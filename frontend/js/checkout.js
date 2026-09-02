// Página: checkout.html (privada — exige login)

function mostrarErroCheckout(mensagem) {
    const alerta = document.getElementById('checkout-alert')
    alerta.textContent = mensagem
    alerta.style.display = 'block'
    alerta.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function esconderErroCheckout() {
    const alerta = document.getElementById('checkout-alert')
    alerta.style.display = 'none'
}

function renderizarResumo() {
    const container = document.getElementById('checkout-content')
    const itens = getCarrinho()

    if (itens.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-brand-muted text-center">
                <span class="text-5xl mb-4">🗂️</span>
                <p class="text-sm font-light text-brand-muted mb-6">Seu carrinho está vazio, não há o que finalizar.</p>
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
        <div class="bg-white border border-brand-border p-8 mb-8">
            <h3 class="text-xs uppercase tracking-widest font-semibold text-brand-black mb-5">Serviços contratados</h3>
            <div class="flex flex-col gap-3">
                ${itens.map(item => `
                    <div class="flex justify-between items-center py-3 border-b border-brand-border last:border-0">
                        <p class="text-sm text-brand-dark">${item.nome}</p>
                        <p class="text-sm font-semibold text-brand-black">${item.quantidade}x ${formatarMoeda(item.preco)}</p>
                    </div>
                `).join('')}
            </div>
            <div class="flex justify-between items-center pt-5 mt-2 border-t border-brand-border">
                <span class="text-xs uppercase tracking-widest font-semibold text-brand-black">Total</span>
                <span class="text-lg font-semibold text-brand-red">${formatarMoeda(total)}</span>
            </div>
        </div>

        <div class="bg-white border border-brand-border p-8">
            <h3 class="text-xs uppercase tracking-widest font-semibold text-brand-black mb-7">Dados do processo licitatório</h3>
            <form id="form-checkout" class="space-y-6">

                <div class="flex flex-col gap-2">
                    <label for="orgaoResponsavel" class="text-xs uppercase tracking-widest font-semibold text-brand-black">Órgão responsável *</label>
                    <input type="text" id="orgaoResponsavel" required placeholder="Ex: Prefeitura Municipal de..."
                        class="w-full bg-brand-canvas border border-brand-border px-4 py-3.5 text-xs text-brand-dark placeholder:text-zinc-400 focus:outline-none focus:border-brand-black focus:bg-white transition-all">
                </div>

                <div class="flex flex-col gap-2">
                    <label for="objetoLicitacao" class="text-xs uppercase tracking-widest font-semibold text-brand-black">Objeto da licitação *</label>
                    <textarea id="objetoLicitacao" rows="3" required placeholder="Descreva o que está sendo licitado"
                        class="w-full bg-brand-canvas border border-brand-border px-4 py-3.5 text-xs text-brand-dark placeholder:text-zinc-400 focus:outline-none focus:border-brand-black focus:bg-white transition-all resize-none"></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="flex flex-col gap-2">
                        <label for="modalidade" class="text-xs uppercase tracking-widest font-semibold text-brand-black">Modalidade *</label>
                        <select id="modalidade" required
                            class="w-full bg-brand-canvas border border-brand-border px-4 py-3.5 text-xs text-brand-dark focus:outline-none focus:border-brand-black focus:bg-white appearance-none transition-all cursor-pointer">
                            <option value="">Selecione</option>
                            <option>Pregão Eletrônico</option>
                            <option>Concorrência</option>
                            <option>Tomada de Preços</option>
                            <option>Convite</option>
                            <option>Dispensa</option>
                            <option>Inexigibilidade</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="responsavelAcompanhamento" class="text-xs uppercase tracking-widest font-semibold text-brand-black">Responsável pelo acompanhamento</label>
                        <input type="text" id="responsavelAcompanhamento" placeholder="Nome do responsável"
                            class="w-full bg-brand-canvas border border-brand-border px-4 py-3.5 text-xs text-brand-dark placeholder:text-zinc-400 focus:outline-none focus:border-brand-black focus:bg-white transition-all">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="flex flex-col gap-2">
                        <label for="dataAbertura" class="text-xs uppercase tracking-widest font-semibold text-brand-black">Data de abertura</label>
                        <input type="date" id="dataAbertura"
                            class="w-full bg-brand-canvas border border-brand-border px-4 py-3.5 text-xs text-brand-dark focus:outline-none focus:border-brand-black focus:bg-white transition-all">
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="dataEncerramento" class="text-xs uppercase tracking-widest font-semibold text-brand-black">Data de encerramento</label>
                        <input type="date" id="dataEncerramento"
                            class="w-full bg-brand-canvas border border-brand-border px-4 py-3.5 text-xs text-brand-dark focus:outline-none focus:border-brand-black focus:bg-white transition-all">
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="documentosNecessarios" class="text-xs uppercase tracking-widest font-semibold text-brand-black">Documentos necessários</label>
                    <textarea id="documentosNecessarios" rows="3" placeholder="Liste os documentos exigidos no edital"
                        class="w-full bg-brand-canvas border border-brand-border px-4 py-3.5 text-xs text-brand-dark placeholder:text-zinc-400 focus:outline-none focus:border-brand-black focus:bg-white transition-all resize-none"></textarea>
                </div>

                <button type="submit" id="btn-checkout"
                    class="w-full py-4 bg-brand-red hover:bg-brand-redHover text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-md shadow-brand-red/20 flex items-center justify-center gap-2 cursor-pointer">
                    Confirmar e abrir processo
                </button>
            </form>
        </div>
    `

    document.getElementById('form-checkout').addEventListener('submit', enviarPedido)
}

async function enviarPedido(e) {
    e.preventDefault()
    esconderErroCheckout()

    const botao = document.getElementById('btn-checkout')
    botao.disabled = true
    botao.textContent = 'Enviando...'

    const itens = getCarrinho().map(item => ({
        idServico: item.idServico,
        quantidade: item.quantidade
    }))

    const entrega = {
        orgaoResponsavel: document.getElementById('orgaoResponsavel').value.trim(),
        objetoLicitacao: document.getElementById('objetoLicitacao').value.trim(),
        modalidade: document.getElementById('modalidade').value,
        responsavelAcompanhamento: document.getElementById('responsavelAcompanhamento').value.trim() || null,
        dataAbertura: document.getElementById('dataAbertura').value || null,
        dataEncerramento: document.getElementById('dataEncerramento').value || null,
        documentosNecessarios: document.getElementById('documentosNecessarios').value.trim() || null
    }

    try {
        const resposta = await apiRequest('/pedidos', {
            method: 'POST',
            auth: true,
            body: { itens, entrega }
        })

        limparCarrinho()
        renderizarConfirmacao(resposta)
    } catch (err) {
        mostrarErroCheckout(err.message)
        botao.disabled = false
        botao.textContent = 'Confirmar e abrir processo'
    }
}

function renderizarConfirmacao(resposta) {
    const container = document.getElementById('checkout-content')
    container.innerHTML = `
        <div class="bg-white border border-brand-border p-12 text-center">
            <div class="w-16 h-16 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto mb-6">
                <span class="text-2xl text-brand-red font-bold">✓</span>
            </div>
            <span class="text-xs uppercase tracking-widest2 text-brand-red font-bold">Processo Aberto</span>
            <h3 class="font-serif text-3xl font-normal text-brand-black mt-3 mb-3">
                Processo nº ${resposta.pedido.codPedido} aberto com sucesso!
            </h3>
            <p class="text-xs text-brand-muted font-light max-w-sm mx-auto mb-8">
                Acompanharemos ${resposta.entrega.orgaoResponsavel} pelo status do processo. Você pode acompanhar tudo no seu histórico de pedidos.
            </p>
            <a href="./orders.html"
                class="inline-flex items-center gap-2 px-8 py-4 bg-brand-red hover:bg-brand-redHover text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-md shadow-brand-red/20">
                Ver meus pedidos
            </a>
        </div>
    `
}

document.addEventListener('DOMContentLoaded', () => {
    exigirLogin()
    renderizarResumo()
})
