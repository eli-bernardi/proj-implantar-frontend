let licitacoesDebounce = null

async function carregarSituacoes() {
    const select = document.getElementById('licitacoes-situacao')
    if (!select) return

    try {
        const resposta = await fetch(`${LICITACOES_API_URL}/api/situacoes`)
        const situacoes = await resposta.json()
        const lista = situacoes.data || situacoes

        lista.forEach(s => {
            const option = document.createElement('option')
            option.value = s
            option.textContent = s
            select.appendChild(option)
        })
    } catch (err) {
        // Se não conseguir carregar as situações, o filtro só fica com "Todas as situações" mesmo — sem quebrar a página
    }
}

function montarQueryParams() {
    const busca = document.getElementById('licitacoes-busca')?.value.trim()
    const situacao = document.getElementById('licitacoes-situacao')?.value

    const params = new URLSearchParams()
    if (situacao) params.set('situacao', situacao)

    return { busca, params }
}

async function buscarLicitacoes() {
    const container = document.getElementById('licitacoes-grid')
    if (!container) return

    container.innerHTML = '<p class="state-message">Carregando licitações...</p>'

    const { busca, params } = montarQueryParams()

    try {
        const url = busca
            ? `${LICITACOES_API_URL}/licitacoes/search?q=${encodeURIComponent(busca)}&${params.toString()}`
            : `${LICITACOES_API_URL}/licitacoes?${params.toString()}`

        const resposta = await fetch(url)
        const dados = await resposta.json()
        const lista = dados.data || dados.licitacoes || dados

        renderizarLicitacoes(lista)
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
        <article class="border border-brand-border rounded-lg overflow-hidden border-l-4 border-l-brand-red">
            <div class="flex items-center">
                <button class="flex-1 flex items-center justify-between text-left p-4 licitacao-toggle" data-index="${i}">
                    <div>
                        <span class="product-card__category block text-xs uppercase tracking-widest text-brand-muted">${l.modalidade || 'Modalidade não informada'}</span>
                        <h3 class="product-card__name font-serif text-lg mt-1">Licitação ${l.licitacao_numero || '-'}/${l.licitacao_ano || '-'}</h3>
                    </div>
                    <span class="text-xs text-brand-red whitespace-nowrap ml-4">Ver mais ▾</span>
                </button>
                <button class="favorito-toggle px-4 shrink-0" data-index="${i}" aria-label="Favoritar licitação">
                    <i data-lucide="heart" class="w-5 h-5 stroke-[1.5] ${favoritado ? 'fill-brand-red stroke-brand-red' : 'stroke-brand-muted'}"></i>
                </button>
            </div>
            <div class="licitacao-detalhes hidden px-4 pb-4 text-sm text-brand-muted border-t border-brand-border pt-4">
                <p class="mb-2">${l.objeto || 'Sem descrição disponível.'}</p>
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
            const abrindo = detalhes.classList.contains('hidden')

            detalhes.classList.toggle('hidden')
            label.textContent = abrindo ? 'Ver menos ▴' : 'Ver mais ▾'
        })
    })

    container.querySelectorAll('.favorito-toggle').forEach(botao => {
        botao.addEventListener('click', () => {
            const index = Number(botao.dataset.index)
            const l = lista[index]
            const chave = chaveLicitacao(l)
            const icone = botao.querySelector('i')

            const agoraFavorito = alternarFavorito(chave, {
                modalidade: l.modalidade,
                numero: l.licitacao_numero,
                ano: l.licitacao_ano,
                objeto: l.objeto,
                unidadeGestora: l.unidade_gestora
            })

            icone.classList.toggle('fill-brand-red', agoraFavorito)
            icone.classList.toggle('stroke-brand-red', agoraFavorito)
            icone.classList.toggle('stroke-brand-muted', !agoraFavorito)
        })
    })

    if (typeof lucide !== 'undefined') lucide.createIcons()
}

document.addEventListener('DOMContentLoaded', () => {
    carregarSituacoes()
    buscarLicitacoes()

    const busca = document.getElementById('licitacoes-busca')
    if (busca) {
        busca.addEventListener('input', () => {
            clearTimeout(licitacoesDebounce)
            licitacoesDebounce = setTimeout(buscarLicitacoes, 400)
        })
    }

    const situacao = document.getElementById('licitacoes-situacao')
    if (situacao) {
        situacao.addEventListener('change', buscarLicitacoes)
    }
})