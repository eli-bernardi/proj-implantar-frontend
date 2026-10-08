// Listagem de licitações com filtros avançados, selos de enquadramento e paginação.
// Fonte principal: backend Del Company (/api/licitacoes/filtros). Se o backend ainda
// não tiver dados (ou estiver fora do ar), cai para a API pública de Tijucas, sem selos.

// Acesso por plano (Free, Pro, Max). Preenchido em aplicarAcessoDoPlano() quando a página abre.
let ACESSO = { consultasMes: Infinity, filtrosAvancados: true, ramo: true, seloCompleto: true }
let PLANO_ACESSO = null

let licitacoesDebounce = null
let situacoesSelecionadas = []
let paginaAtual = 1
let listaAtual = []
const LIMITE_POR_PAGINA = 10

const CAMPOS_FILTRO = {
    ramo: 'filtro-ramo',
    modalidade: 'filtro-modalidade',
    enquadramento: 'filtro-enquadramento',
    valorMin: 'filtro-valor-min',
    valorMax: 'filtro-valor-max',
    publicacaoDe: 'filtro-publicacao-de',
    publicacaoAte: 'filtro-publicacao-ate'
}

// ---------- filtros ----------

function lerFiltros() {
    const params = new URLSearchParams()

    const busca = document.getElementById('licitacoes-busca')?.value.trim()
    if (busca) params.set('q', busca)
    if (situacoesSelecionadas.length) params.set('situacao', situacoesSelecionadas.join(','))

    for (const [param, id] of Object.entries(CAMPOS_FILTRO)) {
        const valor = document.getElementById(id)?.value.trim()
        if (valor) params.set(param, valor)
    }
    return params
}

function haFiltrosAtivos() {
    return Array.from(lerFiltros().keys()).length > 0
}

function limparFiltros() {
    const busca = document.getElementById('licitacoes-busca')
    if (busca) busca.value = ''
    Object.values(CAMPOS_FILTRO).forEach(id => {
        const el = document.getElementById(id)
        if (el) el.value = ''
    })
    document.querySelectorAll('.situacao-checkbox').forEach(cb => { cb.checked = false })
    situacoesSelecionadas = []
    atualizarLabelSituacao()
    buscarComCota(1)
}

function preencherSelect(id, itens, rotuloPadrao, pegarValor = i => i, pegarTexto = i => i) {
    const select = document.getElementById(id)
    if (!select) return
    select.innerHTML = `<option value="">${rotuloPadrao}</option>` +
        itens.map(i => `<option value="${escaparHtml(pegarValor(i))}">${escaparHtml(pegarTexto(i))}</option>`).join('')
}

async function carregarOpcoes() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/api/licitacoes/filtros/opcoes`)
        if (!resposta.ok) throw new Error('opcoes indisponiveis')
        const opcoes = await resposta.json()

        preencherSelect('filtro-ramo', opcoes.ramos || [], 'Todos os ramos', r => r.nome, r => r.nome)
        preencherSelect('filtro-modalidade', opcoes.modalidades || [], 'Todas as modalidades')
        preencherSelect('filtro-enquadramento', opcoes.enquadramentos || [], 'Todos os enquadramentos',
            e => e.codigo, e => `${e.emoji} ${e.rotulo}`)
        montarPainelSituacoes(opcoes.situacoes || [])
    } catch (err) {
        carregarSituacoesLegado()
    }
}

// ---------- dropdown de situação (multi-seleção) ----------

function montarPainelSituacoes(lista) {
    const panel = document.getElementById('licitacoes-situacao-panel')
    if (!panel) return

    panel.innerHTML = lista.map(s => `
        <label class="situacao-checkbox-label">
            <input type="checkbox" value="${escaparHtml(s)}" class="situacao-checkbox">
            ${escaparHtml(s)}
        </label>
    `).join('')

    panel.querySelectorAll('.situacao-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            situacoesSelecionadas = Array.from(panel.querySelectorAll('.situacao-checkbox:checked')).map(c => c.value)
            atualizarLabelSituacao()
            buscarComCota(1)
        })
    })
}

// Plano B: lista de situações direto da API de Tijucas
async function carregarSituacoesLegado() {
    try {
        const resposta = await fetch(`${LICITACOES_API_URL}/api/situacoes`)
        const situacoes = await resposta.json()
        montarPainelSituacoes(situacoes.data || situacoes)
    } catch (err) {
        // painel fica vazio, sem quebrar a página
    }
}

function atualizarLabelSituacao() {
    const label = document.getElementById('licitacoes-situacao-label')
    if (!label) return

    if (situacoesSelecionadas.length === 0) label.textContent = 'Todas as situações'
    else if (situacoesSelecionadas.length === 1) label.textContent = situacoesSelecionadas[0]
    else label.textContent = `${situacoesSelecionadas.length} situações`
}

function configurarDropdownSituacao() {
    const btn = document.getElementById('licitacoes-situacao-btn')
    const panel = document.getElementById('licitacoes-situacao-panel')
    if (!btn || !panel) return

    btn.addEventListener('click', () => panel.classList.toggle('show'))
    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !panel.contains(e.target)) panel.classList.remove('show')
    })
}

// ---------- busca ----------

// Converte um registro da API de Tijucas para o formato do backend (sem selos).
function normalizarLegado(l) {
    return {
        numero: l.licitacao_numero, ano: l.licitacao_ano, objeto: l.objeto,
        unidadeGestora: l.unidade_gestora, modalidade: l.modalidade, situacao: l.situacao,
        valorEstimado: null, valorHomologado: null, selos: [], categoria: null
    }
}

async function buscarNoLegado(params) {
    const busca = params.get('q')
    const url = busca
        ? `${LICITACOES_API_URL}/licitacoes/search?q=${encodeURIComponent(busca)}`
        : `${LICITACOES_API_URL}/licitacoes`
    const resposta = await fetch(url)
    const dados = await resposta.json()
    const lista = (dados.data || dados.licitacoes || dados).map(normalizarLegado)
    const situacoes = params.get('situacao') ? params.get('situacao').split(',') : []
    return situacoes.length ? lista.filter(l => situacoes.includes(l.situacao)) : lista
}

async function buscarLicitacoes(pagina = 1) {
    const container = document.getElementById('licitacoes-grid')
    if (!container) return

    paginaAtual = pagina
    container.innerHTML = '<p class="state-message">Carregando licitações...</p>'

    const params = lerFiltros()
    params.set('pagina', pagina)
    params.set('limite', LIMITE_POR_PAGINA)

    try {
        const resposta = await fetch(`${API_BASE_URL}/api/licitacoes/filtros?${params.toString()}`)

        if (resposta.status === 400) {
            const erro = await resposta.json()
            container.innerHTML = `<p class="state-message">${escaparHtml(erro.message || 'Filtro inválido.')}</p>`
            return
        }
        if (!resposta.ok) throw new Error('backend indisponivel')

        const resultado = await resposta.json()

        // Base ainda vazia (sem sincronizar) e nenhum filtro aplicado: usa a API de Tijucas
        if (resultado.paginacao.total === 0 && !haFiltrosAtivos()) {
            throw new Error('base vazia')
        }

        listaAtual = resultado.dados
        renderizarLicitacoes(listaAtual, resultado.paginacao)
    } catch (err) {
        try {
            listaAtual = await buscarNoLegado(params)
            renderizarLicitacoes(listaAtual, null)
        } catch (erroLegado) {
            container.innerHTML = '<p class="state-message">Não foi possível carregar as licitações agora.</p>'
        }
    }
}

// ---------- renderização ----------

function chaveLicitacao(l) {
    return `${l.unidadeGestora}-${l.numero}-${l.ano}`
}

function renderizarPaginacao(paginacao) {
    const nav = document.getElementById('licitacoes-paginacao')
    if (!nav) return

    if (!paginacao || paginacao.totalPaginas <= 1) {
        nav.innerHTML = ''
        return
    }

    nav.innerHTML = `
        <button type="button" class="btn-filtro" id="pagina-anterior" ${paginacao.pagina <= 1 ? 'disabled' : ''}>← Anterior</button>
        <span>Página ${paginacao.pagina} de ${paginacao.totalPaginas}</span>
        <button type="button" class="btn-filtro" id="pagina-proxima" ${paginacao.pagina >= paginacao.totalPaginas ? 'disabled' : ''}>Próxima →</button>
    `
    document.getElementById('pagina-anterior').addEventListener('click', () => buscarLicitacoes(paginacao.pagina - 1))
    document.getElementById('pagina-proxima').addEventListener('click', () => buscarLicitacoes(paginacao.pagina + 1))
}

function renderizarContador(paginacao, total) {
    const el = document.getElementById('licitacoes-contador')
    if (!el) return
    const n = paginacao ? paginacao.total : total
    el.textContent = n === 1 ? '1 licitação encontrada' : `${n} licitações encontradas`
}

function renderizarLicitacoes(lista, paginacao) {
    const container = document.getElementById('licitacoes-grid')
    if (!container) return

    renderizarContador(paginacao, lista ? lista.length : 0)
    renderizarPaginacao(paginacao)

    if (!lista || !lista.length) {
        container.innerHTML = '<p class="state-message">Nenhuma licitação encontrada para esse filtro.</p>'
        return
    }

    container.innerHTML = lista.map((l, i) => {
        const favoritado = ehFavorito(chaveLicitacao(l))
        const ramo = (l.categoria && ACESSO.ramo) ? `<span class="licitacao-ramo">${escaparHtml(l.categoria.nome)}</span>` : ''
        const valores = (l.valorEstimado !== null || l.valorHomologado !== null) ? `
            <div class="licitacao-valores">
                <div><span>Valor estimado</span><strong>${formatarMoeda(l.valorEstimado)}</strong></div>
                <div><span>Valor homologado</span><strong>${formatarMoeda(l.valorHomologado)}</strong></div>
                ${l.percentualEconomia !== null && l.percentualEconomia !== undefined
                    ? `<div><span>Economia</span><strong>${l.percentualEconomia.toLocaleString('pt-BR')}%</strong></div>` : ''}
            </div>` : ''

        return `
        <article class="licitacao-item">
            <div class="licitacao-row">
                <button class="licitacao-toggle" data-index="${i}">
                    <div>
                        <span class="licitacao-modalidade">${escaparHtml(l.modalidade || 'Modalidade não informada')}</span>${ramo}
                        <h3 class="licitacao-nome">Licitação ${escaparHtml(l.numero || '-')}/${escaparHtml(l.ano || '-')}</h3>
                        ${renderizarSelos(l.selos, { basico: !ACESSO.seloCompleto })}
                    </div>
                    <span class="licitacao-ver-mais">Ver mais ▾</span>
                </button>
                <button class="favorito-toggle" data-index="${i}" aria-label="Favoritar licitação">
                    <i data-lucide="heart" class="icone-favorito ${favoritado ? 'favorito-ativo' : ''}"></i>
                </button>
            </div>
            <div class="licitacao-detalhes">
                <p>${escaparHtml(l.objeto || 'Sem descrição disponível.')}</p>
                ${valores}
                <p><strong>Órgão:</strong> ${escaparHtml(l.unidadeGestora || '-')}</p>
                <p><strong>Situação:</strong> ${escaparHtml(l.situacao || '-')}</p>
                ${l.dataEdital ? `<p><strong>Publicação (edital):</strong> ${formatarData(l.dataEdital)}</p>` : ''}
                ${l.dataAbertura ? `<p><strong>Abertura:</strong> ${formatarData(l.dataAbertura)}</p>` : ''}
            </div>
        </article>
    `}).join('')

    container.querySelectorAll('.licitacao-toggle').forEach(botao => {
        botao.addEventListener('click', () => {
            const card = botao.closest('article')
            const detalhes = card.querySelector('.licitacao-detalhes')
            const label = botao.querySelector('.licitacao-ver-mais')
            const abrindo = !detalhes.classList.contains('show')

            detalhes.classList.toggle('show')
            label.textContent = abrindo ? 'Ver menos ▴' : 'Ver mais ▾'
        })
    })

    container.querySelectorAll('.favorito-toggle').forEach(botao => {
        botao.addEventListener('click', () => {
            const l = lista[Number(botao.dataset.index)]
            const icone = botao.querySelector('.icone-favorito')

            const agoraFavorito = alternarFavorito(chaveLicitacao(l), {
                modalidade: l.modalidade,
                numero: l.numero,
                ano: l.ano,
                objeto: l.objeto,
                unidadeGestora: l.unidadeGestora,
                selos: l.selos || [],
                valorEstimado: l.valorEstimado ?? null
            })

            icone.classList.toggle('favorito-ativo', agoraFavorito)
        })
    })

    if (typeof lucide !== 'undefined') lucide.createIcons()
}

// ---------- acesso por plano ----------

function mostrarBloqueio(titulo, texto, rotuloBotao) {
    const bloqueio = document.getElementById('licitacoes-bloqueio')
    const conteudo = document.getElementById('licitacoes-conteudo')
    if (conteudo) conteudo.style.display = 'none'
    if (!bloqueio) return

    bloqueio.style.display = 'block'
    bloqueio.innerHTML = `
        <span class="eyebrow">Acesso por plano</span>
        <h2>${escaparHtml(titulo)}</h2>
        <p>${escaparHtml(texto)}</p>
        <a href="./catalog.html#planos" class="btn btn-primary">${escaparHtml(rotuloBotao)}</a>
    `
}

function atualizarBarraCota() {
    const barra = document.getElementById('licitacoes-cota')
    if (!barra || !PLANO_ACESSO) return

    const limite = ACESSO.consultasMes
    const consultas = isFinite(limite)
        ? `Consultas neste mês: <strong>${consultasUsadas()}/${limite}</strong>`
        : 'Consultas: <strong>ilimitadas</strong>'
    const upgrade = PLANO_ACESSO.id === 'max' ? '' : ' · <a href="./catalog.html#planos">Fazer upgrade</a>'

    barra.innerHTML = `<span>Plano <strong>${escaparHtml(PLANO_ACESSO.nome)}</strong>${upgrade}</span><span>${consultas}</span>`
}

// Retorna true se o usuário tem plano ativo e a página pode carregar.
function aplicarAcessoDoPlano() {
    if (!estaLogado()) {
        exigirLogin() // volta para esta página depois do login
        return false
    }

    const assinatura = getAssinatura()

    if (!assinatura) {
        mostrarBloqueio(
            'Escolha um plano para pesquisar licitações',
            'A pesquisa de licitações é liberada depois da contratação de um plano. Existe um plano gratuito para começar.',
            'Ver planos'
        )
        return false
    }

    if (!assinatura.ativa) {
        mostrarBloqueio(
            'Seu plano expirou',
            'Renove a assinatura para voltar a pesquisar licitações.',
            'Renovar plano'
        )
        return false
    }

    PLANO_ACESSO = PLANOS[assinatura.planoId]
    ACESSO = PLANO_ACESSO.limites

    document.getElementById('licitacoes-conteudo').style.display = 'block'

    if (!ACESSO.filtrosAvancados) {
        // Esconde só os campos avançados; contador e botões Limpar/Aplicar continuam disponíveis
        document.querySelector('#filtros-avancados .filtros-avancados-grid')?.style.setProperty('display', 'none')
        document.getElementById('filtros-bloqueados')?.style.setProperty('display', 'block')
    }

    atualizarBarraCota()
    return true
}

// Busca disparada pelo usuário (digitar, filtrar, limpar): gasta 1 consulta do plano.
// Abrir a página e trocar de página na listagem não contam.
let ultimaBuscaContada = null

function buscarComCota(pagina = 1) {
    // Repetir exatamente a mesma busca não gasta outra consulta
    const assinaturaBusca = lerFiltros().toString()
    if (assinaturaBusca === ultimaBuscaContada) {
        buscarLicitacoes(pagina)
        return
    }

    const resultado = consumirConsulta(ACESSO.consultasMes)

    if (!resultado.ok) {
        const container = document.getElementById('licitacoes-grid')
        if (container) {
            container.innerHTML = `<p class="state-message">Você usou as ${resultado.limite} consultas do plano ${escaparHtml(PLANO_ACESSO.nome)} neste mês. <a href="./catalog.html#planos" style="color: var(--brand-red); font-weight: 600;">Faça upgrade</a> para pesquisar sem limite.</p>`
        }
        atualizarBarraCota()
        return
    }

    ultimaBuscaContada = assinaturaBusca
    atualizarBarraCota()
    buscarLicitacoes(pagina)
}

document.addEventListener('DOMContentLoaded', () => {
    if (!aplicarAcessoDoPlano()) return

    configurarDropdownSituacao()
    carregarOpcoes()
    ultimaBuscaContada = lerFiltros().toString()
    buscarLicitacoes(1)

    const busca = document.getElementById('licitacoes-busca')
    if (busca) {
        busca.addEventListener('input', () => {
            clearTimeout(licitacoesDebounce)
            licitacoesDebounce = setTimeout(() => buscarComCota(1), 400)
        })
    }

    document.getElementById('btn-aplicar-filtros')?.addEventListener('click', () => buscarComCota(1))
    document.getElementById('btn-limpar-filtros')?.addEventListener('click', limparFiltros)
    document.getElementById('filtros-avancados-toggle')?.addEventListener('click', () => {
        document.getElementById('filtros-avancados')?.classList.toggle('hidden-filtros')
    })
})
