async function carregarLicitacoes() {
    const container = document.getElementById('licitacoes-grid')
    if (!container) return

    container.innerHTML = '<p class="state-message">Carregando licitações...</p>'

    try {
        const resposta = await fetch(`${LICITACOES_API_URL}/licitacoes`)
        const dados = await resposta.json()
        const lista = dados.data || dados.licitacoes || dados

        if (!lista.length) {
            container.innerHTML = '<p class="state-message">Nenhuma licitação encontrada no momento.</p>'
            return
        }

        container.innerHTML = lista.map(l => `
            <article class="product-card">
                <div class="product-card__body">
                    <span class="product-card__category">${l.modalidade || ''}</span>
                    <h3 class="product-card__name">${l.objeto || 'Sem descrição'}</h3>
                    <p class="product-card__desc">${l.unidade_gestora || ''}</p>
                    <p class="product-card__desc">Situação: ${l.situacao || '-'}</p>
                </div>
            </article>
        `).join('')
    } catch (err) {
        container.innerHTML = '<p class="state-message">Não foi possível carregar as licitações agora.</p>'
    }
}

document.addEventListener('DOMContentLoaded', carregarLicitacoes)