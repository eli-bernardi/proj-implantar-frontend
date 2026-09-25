// Página: cart.html

function renderizarCarrinho() {
    const container = document.getElementById('cart-content')
    const itens = getCarrinho()

    if (itens.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🗂️</span>
                <p>Seu carrinho está vazio.</p>
                <a href="./catalog.html" class="btn btn-primary">Ver serviços disponíveis</a>
            </div>
        `
        return
    }

    const total = totalCarrinho()

    container.innerHTML = `
        <div class="cart-layout">
            <div class="cart-items">
                ${itens.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <p class="cart-item-name">${item.nome}</p>
                            <p class="cart-item-price">${formatarMoeda(item.preco)} cada</p>
                        </div>
                        <div class="cart-item-qty">
                            <button onclick="alterarQuantidade(${item.idServico}, -1); renderizarCarrinho();">−</button>
                            <span>${item.quantidade}</span>
                            <button onclick="alterarQuantidade(${item.idServico}, 1); renderizarCarrinho();">+</button>
                        </div>
                        <p class="cart-item-subtotal">${formatarMoeda(item.preco * item.quantidade)}</p>
                        <button onclick="removerDoCarrinho(${item.idServico}); renderizarCarrinho();" class="cart-item-remove">
                            Remover
                        </button>
                    </div>
                `).join('')}
            </div>

            <aside class="cart-summary">
                <div class="cart-summary-box">
                    <h3>Resumo</h3>
                    <div class="cart-summary-row">
                        <span>Serviços selecionados</span>
                        <strong>${itens.reduce((s, i) => s + i.quantidade, 0)}</strong>
                    </div>
                    <div class="cart-summary-total">
                        <span>Total</span>
                        <span>${formatarMoeda(total)}</span>
                    </div>
                    <button onclick="irParaCheckout()" class="btn btn-primary">
                        Finalizar processo
                    </button>
                </div>
            </aside>
        </div>
    `
}

function renderizarFavoritos() {
    const container = document.getElementById('favoritos-content')
    if (!container) return

    const favoritos = getFavoritos()

    if (favoritos.length === 0) {
        container.innerHTML = `<p class="empty-text">Você ainda não favoritou nenhuma licitação.</p>`
        return
    }

    container.innerHTML = favoritos.map(f => `
        <div class="favorito-row">
            <div>
                <p class="favorito-modalidade">${f.modalidade || 'Modalidade não informada'}</p>
                <p class="favorito-nome">Licitação ${f.numero || '-'}/${f.ano || '-'} — ${f.unidadeGestora || '-'}</p>
            </div>
            <button data-chave="${f.chave}" class="remover-favorito">Remover</button>
        </div>
    `).join('')

    container.querySelectorAll('.remover-favorito').forEach(botao => {
        botao.addEventListener('click', () => {
            alternarFavorito(botao.dataset.chave, {})
            renderizarFavoritos()
        })
    })
}

function irParaCheckout() {
    if (!estaLogado()) {
        sessionStorage.setItem('del_redirect_after_login', './checkout.html')
        window.location.href = './login.html'
        return
    }
    window.location.href = './checkout.html'
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrinho()
    renderizarFavoritos()
})