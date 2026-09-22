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

function renderizarLicitacoes(lista) {
    const container = document.getElementById('licitacoes-grid')
    if (!container) return

    if (!lista || !lista.length) {
        container.innerHTML = '<p class="state-message">Nenhuma licitação encontrada para esse filtro.</p>'
        return
    }

    container.innerHTML = lista.map((l, i) => `
        <article class="product-card border border-brand-border rounded-lg overflow-hidden">
            <button class="w-full text-left p-5 licitacao-toggle" data-index="${i}">
                <span class="product-card__category block text-xs uppercase tracking-widest text-brand-muted">${l.modalidade || 'Modalidade não informada'}</span>
                <h3 class="product-card__name font-serif text-lg mt-1">Licitação ${l.licitacao_numero || '-'}/${l.licitacao_ano || '-'}</h3>
                <span class="text-xs text-brand-red mt-2 inline-block">Ver mais ▾</span>
            </button>
            <div class="licitacao-detalhes hidden px-5 pb-5 text-sm text-brand-muted border-t border-brand-border pt-4">
                <p class="mb-2">${l.objeto || 'Sem descrição disponível.'}</p>
                <p><strong>Órgão:</strong> ${l.unidade_gestora || '-'}</p>
                <p><strong>Situação:</strong> ${l.situacao || '-'}</p>
            </div>
        </article>
    `).join('')

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