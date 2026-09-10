// Página: catalog.html
// Carrega os serviços automaticamente ao abrir a tela (requisito do PDF),
// permite busca por nome e filtro por categoria, tudo sem exigir login.

let SERVICOS_CACHE = []

async function carregarCategorias() {
    try {
        const categorias = await apiRequest('/categorias')
        const select = document.getElementById('filtro-categoria')

        categorias.forEach(cat => {
            const option = document.createElement('option')
            option.value = cat.codCategoria
            option.textContent = cat.nome
            select.appendChild(option)
        })
    } catch (err) {
        console.log('Não foi possível carregar as categorias:', err.message)
    }
}

async function carregarServicos() {
    const grid = document.getElementById('catalogo-grid')
    grid.innerHTML = '<p class="state-message">Carregando serviços...</p>'

    try {
        SERVICOS_CACHE = await apiRequest('/servicos')
        renderizarGrid(SERVICOS_CACHE)
    } catch (err) {
        grid.innerHTML = `<p class="state-message">Não foi possível carregar os serviços agora. ${err.message}</p>`
    }
}

function renderizarGrid(lista) {
    const grid = document.getElementById('catalogo-grid')

    if (lista.length === 0) {
        grid.innerHTML = '<p class="state-message">Nenhum serviço encontrado para essa busca.</p>'
        return
    }

    grid.innerHTML = lista.map(servico => {
        const semCapacidade = servico.capacidadeDisponivel <= 0
        const categoriaNome = servico.categoriaServico ? servico.categoriaServico.nome : ''

        return `
            <article class="product-card">
                <div class="product-card__image">
                    ${servico.imagem
                ? `<img src="${servico.imagem}" alt="${servico.nome}">`
                : '📋'}
                </div>
                <div class="product-card__body">
                    ${categoriaNome ? `<span class="product-card__category">${categoriaNome}</span>` : ''}
                    <h3 class="product-card__name">${servico.nome}</h3>
                    <p class="product-card__desc">${servico.descricao}</p>
                    <div class="product-card__footer">
                        <div class="product-card__price">
                            ${formatarMoeda(Number(servico.preco))}
                            <span>${semCapacidade ? 'sem vagas no momento' : 'por contratação'}</span>
                        </div>
                    </div>
                    <button
                        class="btn-primary btn-block btn-sm"
                        ${semCapacidade ? 'disabled' : ''}
                        onclick='adicionarServicoAoCarrinho(${servico.codServico})'
                    >
                        ${semCapacidade ? 'Indisponível' : 'Adicionar ao carrinho'}
                    </button>
                </div>
            </article>
        `
    }).join('')
}

function adicionarServicoAoCarrinho(codServico) {
    const servico = SERVICOS_CACHE.find(s => s.codServico === codServico)
    if (!servico) return

    adicionarAoCarrinho(servico)

    const botao = event.target
    const textoOriginal = botao.textContent
    botao.textContent = 'Adicionado ✓'
    setTimeout(() => { botao.textContent = textoOriginal }, 1200)
}

function aplicarFiltros() {
    const busca = document.getElementById('filtro-busca').value.trim().toLowerCase()
    const categoria = document.getElementById('filtro-categoria').value

    const filtrados = SERVICOS_CACHE.filter(servico => {
        const bateBusca = !busca || servico.nome.toLowerCase().includes(busca)
        const bateCategoria = !categoria || String(servico.idCategoria) === categoria
        return bateBusca && bateCategoria
    })

    renderizarGrid(filtrados)
}

document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias()
    carregarServicos()

    document.getElementById('filtro-busca').addEventListener('input', aplicarFiltros)
    document.getElementById('filtro-categoria').addEventListener('change', aplicarFiltros)
})
