// Página: cart.html

function renderizarCarrinho() {
    const container = document.getElementById('cart-content')
    const itens = getCarrinho()

    if (itens.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty__icon">🗂️</div>
                <p>Seu carrinho está vazio.</p>
                <a href="./catalog.html" class="btn-primary btn-sm" style="display:inline-block; margin-top:16px;">
                    Ver serviços disponíveis
                </a>
            </div>
        `
        return
    }

    const total = totalCarrinho()

    container.innerHTML = `
        <div class="cart-layout">
            <div class="cart-list">
                ${itens.map(item => `
                    <div class="cart-item">
                        <div class="cart-item__info">
                            <div class="cart-item__name">${item.nome}</div>
                            <div class="cart-item__price">${formatarMoeda(item.preco)} cada</div>
                        </div>
                        <div class="cart-item__qty">
                            <button onclick="alterarQuantidade(${item.idServico}, -1); renderizarCarrinho();">−</button>
                            <span>${item.quantidade}</span>
                            <button onclick="alterarQuantidade(${item.idServico}, 1); renderizarCarrinho();">+</button>
                        </div>
                        <button class="cart-item__remove" onclick="removerDoCarrinho(${item.idServico}); renderizarCarrinho();">
                            Remover
                        </button>
                    </div>
                `).join('')}
            </div>

            <aside class="cart-summary">
                <h3>Resumo</h3>
                <div class="cart-summary__row">
                    <span>Serviços selecionados</span>
                    <span>${itens.reduce((s, i) => s + i.quantidade, 0)}</span>
                </div>
                <div class="cart-summary__total">
                    <span>Total</span>
                    <span>${formatarMoeda(total)}</span>
                </div>
                <button class="btn-primary btn-block" onclick="irParaCheckout()">Finalizar processo</button>
            </aside>
        </div>
    `
}

function irParaCheckout() {
    if (!estaLogado()) {
        sessionStorage.setItem('del_redirect_after_login', './checkout.html')
        window.location.href = './login.html'
        return
    }
    window.location.href = './checkout.html'
}

document.addEventListener('DOMContentLoaded', renderizarCarrinho)
