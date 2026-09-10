// Página: cart.html

function renderizarCarrinho() {
    const container = document.getElementById('cart-content')
    const itens = getCarrinho()

    if (itens.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-brand-muted text-center">
                <span class="text-5xl mb-4">🗂️</span>
                <p class="text-sm font-light text-brand-muted mb-6">Seu carrinho está vazio.</p>
                <a href="./catalog.html"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-redHover text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300">
                    Ver serviços disponíveis
                </a>
            </div>
        `
        return
    }

    const total = totalCarrinho()

    container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8">
            <div class="flex-1 flex flex-col gap-3">
                ${itens.map(item => `
                    <div class="flex items-center justify-between gap-4 bg-white border border-brand-border px-6 py-5">
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-brand-black truncate">${item.nome}</p>
                            <p class="text-xs text-brand-muted font-light mt-0.5">${formatarMoeda(item.preco)} cada</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                onclick="alterarQuantidade(${item.idServico}, -1); renderizarCarrinho();"
                                class="w-8 h-8 flex items-center justify-center border border-brand-border hover:border-brand-black text-brand-black text-sm font-medium transition-colors cursor-pointer">−</button>
                            <span class="w-8 text-center text-sm font-semibold text-brand-black">${item.quantidade}</span>
                            <button
                                onclick="alterarQuantidade(${item.idServico}, 1); renderizarCarrinho();"
                                class="w-8 h-8 flex items-center justify-center border border-brand-border hover:border-brand-black text-brand-black text-sm font-medium transition-colors cursor-pointer">+</button>
                        </div>
                        <p class="text-sm font-semibold text-brand-black w-24 text-right">${formatarMoeda(item.preco * item.quantidade)}</p>
                        <button
                            onclick="removerDoCarrinho(${item.idServico}); renderizarCarrinho();"
                            class="text-xs uppercase tracking-widest text-brand-muted hover:text-brand-red font-medium transition-colors cursor-pointer ml-2">
                            Remover
                        </button>
                    </div>
                `).join('')}
            </div>

            <aside class="w-full lg:w-72 flex-shrink-0">
                <div class="bg-white border border-brand-border p-6 sticky top-28">
                    <h3 class="text-xs uppercase tracking-widest font-semibold text-brand-black mb-5">Resumo</h3>
                    <div class="flex justify-between items-center text-xs text-brand-muted mb-3">
                        <span>Serviços selecionados</span>
                        <span class="font-semibold text-brand-black">${itens.reduce((s, i) => s + i.quantidade, 0)}</span>
                    </div>
                    <div class="flex justify-between items-center pt-4 border-t border-brand-border">
                        <span class="text-xs uppercase tracking-widest font-semibold text-brand-black">Total</span>
                        <span class="text-lg font-semibold text-brand-red">${formatarMoeda(total)}</span>
                    </div>
                    <button
                        onclick="irParaCheckout()"
                        class="w-full mt-6 py-4 bg-brand-red hover:bg-brand-redHover text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer shadow-md shadow-brand-red/20">
                        Finalizar processo
                    </button>
                </div>
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
