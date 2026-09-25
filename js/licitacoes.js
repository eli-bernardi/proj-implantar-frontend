let licitacoesDebounce = null
let situacoesSelecionadas = []

async function carregarSituacoes() {
    const panel = document.getElementById('licitacoes-situacao-panel')
    if (!panel) return

    try {
        const resposta = await fetch(`${LICITACOES_API_URL}/api/situacoes`)
        const situacoes = await resposta.json()
        const lista = situacoes.data || situacoes

        panel.innerHTML = lista.map(s => `
            <label class="situacao-checkbox-label">
                <input type="checkbox" value="${s}" class="situacao-checkbox">
                ${s}
            </label>
        `).join('')

        panel.querySelectorAll('.situacao-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                situacoesSelecionadas = Array.from(panel.querySelectorAll('.situacao-checkbox:checked')).map(c => c.value)
                atualizarLabelSituacao()
                buscarLicitacoes()
            })
        })
    } catch (err) {
        // Se não conseguir carregar as situações, o painel fica vazio — sem quebrar a página
    }
}

function atualizarLabelSituacao() {
    const label = document.getElementById('licitacoes-situacao-label')
    if (!label) return

    if (situacoesSelecionadas.length === 0) {
        label.textContent = 'Todas as situações'
    } else if (situacoesSelecionadas.length === 1) {
        label.textContent = situacoesSelecionadas[0]
    } else {
        label.textContent = `${situacoesSelecionadas.length} situações`
    }
}

function configurarDropdownSituacao() {
    const btn = document.getElementById('licitacoes-situacao-btn')
    const panel = document.getElementById('licitacoes-situacao-panel')
    if (!btn || !panel) return

    btn.addEventListener('click', () => {
        panel.classList.toggle('show')
    })

    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !panel.contains(e.target)) {
            panel.classList.remove('show')
        }
    })
}

async function buscarLicitacoes() {
    const container = document.getElementById('licitacoes-grid')
    if (!container) return

    container.innerHTML = '<p class="state-message">Carregando licitações...</p>'

    const busca = document.getElementById('licitacoes-busca')?.value.trim()

    try {
        const situacoesParaBuscar = situacoesSelecionadas.length > 0 ? situacoesSelecionadas : [null]

        const resultados = await Promise.all(situacoesParaBuscar.map(async situacao => {
            const params = new URLSearchParams()
            if (situacao) params.set('situacao', situacao)

            const url = busca
                ? `${LICITACOES_API_URL}/licitacoes/search?q=${encodeURIComponent(busca)}&${params.toString()}`
                : `${LICITACOES_API_URL}/licitacoes?${params.toString()}`

            const resposta = await fetch(url)
            const dados = await resposta.json()
            return dados.data || dados.licitacoes || dados
        }))

        let listaFinal = resultados.flat()

        if (situacoesParaBuscar.length > 1) {
            const vistos = new Set()
            listaFinal = listaFinal.filter(l => {
                const chave = chaveLicitacao(l)
                if (vistos.has(chave)) return false
                vistos.add(chave)
                return true
            })
        }

        renderizarLicitacoes(listaFinal)
    } catch (err) {
        container.innerHTML = '<p class="state-message">Não foi possível carregar as licitações agora.</p>'
    }
}

function chaveLicitacao(l) {
    return `${l.unidade_gestora}-${l.licitacao_numero}-${l.licitacao_ano}`
}

function renderizarLicitacoes(lista) {
    const container = document.getElementById('licitacoes-grid')
    if (!container) return

    if (!lista || !lista.length) {
        container.innerHTML = '<p class="state-message">Nenhuma licitação encontrada para esse filtro.</p>'
        return
    }

    container.innerHTML = lista.map((l, i) => {
        const chave = chaveLicitacao(l)
        const favoritado = ehFavorito(chave)

        return `
        <article class="licitacao-item">
            <div class="licitacao-row">
                <button class="licitacao-toggle" data-index="${i}">
                    <div>
                        <span class="licitacao-modalidade">${l.modalidade || 'Modalidade não informada'}</span>
                        <h3 class="licitacao-nome">Licitação ${l.licitacao_numero || '-'}/${l.licitacao_ano || '-'}</h3>
                    </div>
                    <span class="licitacao-ver-mais">Ver mais ▾</span>
                </button>
                <button class="favorito-toggle" data-index="${i}" aria-label="Favoritar licitação">
                    <i data-lucide="heart" class="icone-favorito ${favoritado ? 'favorito-ativo' : ''}"></i>
                </button>
            </div>
            <div class="licitacao-detalhes">
                <p>${l.objeto || 'Sem descrição disponível.'}</p>
                <p><strong>Órgão:</strong> ${l.unidade_gestora || '-'}</p>
                <p><strong>Situação:</strong> ${l.situacao || '-'}</p>
            </div>
        </article>
    `}).join('')

    container.querySelectorAll('.licitacao-toggle').forEach(botao => {
        botao.addEventListener('click', () => {
            const card = botao.closest('article')
            const detalhes = card.querySelector('.licitacao-detalhes')
            const label = botao.querySelector('span:last-child')
            const abrindo = !detalhes.classList.contains('show')

            detalhes.classList.toggle('show')
            label.textContent = abrindo ? 'Ver menos ▴' : 'Ver mais ▾'
        })
    })

    container.querySelectorAll('.favorito-toggle').forEach(botao => {
        botao.addEventListener('click', () => {
            const index = Number(botao.dataset.index)
            const l = lista[index]
            const chave = chaveLicitacao(l)
            const icone = botao.querySelector('.icone-favorito')

            const agoraFavorito = alternarFavorito(chave, {
                modalidade: l.modalidade,
                numero: l.licitacao_numero,
                ano: l.licitacao_ano,
                objeto: l.objeto,
                unidadeGestora: l.unidade_gestora
            })

            icone.classList.toggle('favorito-ativo', agoraFavorito)
        })
    })

    if (typeof lucide !== 'undefined') lucide.createIcons()
}

document.addEventListener('DOMContentLoaded', () => {
    configurarDropdownSituacao()
    carregarSituacoes()
    buscarLicitacoes()

    const busca = document.getElementById('licitacoes-busca')
    if (busca) {
        busca.addEventListener('input', () => {
            clearTimeout(licitacoesDebounce)
            licitacoesDebounce = setTimeout(buscarLicitacoes, 400)
        })
    }
})