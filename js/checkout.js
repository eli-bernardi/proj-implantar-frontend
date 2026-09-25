// Página: checkout.html (privada — exige login)

function mostrarErroCheckout(mensagem) {
    const alerta = document.getElementById('checkout-alert')
    alerta.textContent = mensagem
    alerta.classList.add('show')
    alerta.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function esconderErroCheckout() {
    const alerta = document.getElementById('checkout-alert')
    alerta.classList.remove('show')
}

function renderizarResumo() {
    const container = document.getElementById('checkout-content')
    const itens = getCarrinho()

    if (itens.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🗂️</span>
                <p>Seu carrinho está vazio, não há o que finalizar.</p>
                <a href="./catalog.html" class="btn btn-primary">Ver serviços disponíveis</a>
            </div>
        `
        return
    }

    const total = totalCarrinho()

    container.innerHTML = `
        <div class="summary-box">
            <h3 class="box-title">Serviços contratados</h3>
            ${itens.map(item => `
                <div class="summary-line">
                    <p>${item.nome}</p>
                    <strong>${item.quantidade}x ${formatarMoeda(item.preco)}</strong>
                </div>
            `).join('')}
            <div class="summary-total-row">
                <span>Total</span>
                <span>${formatarMoeda(total)}</span>
            </div>
        </div>

        <div class="checkout-form-box">
            <h3 class="box-title" style="margin-bottom: 28px;">Dados do processo licitatório</h3>
            <form id="form-checkout" class="form">

                <div class="form-group">
                    <label for="orgaoResponsavel" class="form-label">Órgão responsável *</label>
                    <input type="text" id="orgaoResponsavel" required placeholder="Ex: Prefeitura Municipal de..."
                        class="form-input">
                </div>

                <div class="form-group">
                    <label for="objetoLicitacao" class="form-label">Objeto da licitação *</label>
                    <textarea id="objetoLicitacao" rows="3" required placeholder="Descreva o que está sendo licitado"
                        class="form-input"></textarea>
                </div>

                <div class="form-grid-2">
                    <div class="form-group">
                        <label for="modalidade" class="form-label">Modalidade *</label>
                        <select id="modalidade" required class="form-input">
                            <option value="">Selecione</option>
                            <option>Pregão Eletrônico</option>
                            <option>Concorrência</option>
                            <option>Tomada de Preços</option>
                            <option>Convite</option>
                            <option>Dispensa</option>
                            <option>Inexigibilidade</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="responsavelAcompanhamento" class="form-label">Responsável pelo acompanhamento</label>
                        <input type="text" id="responsavelAcompanhamento" placeholder="Nome do responsável"
                            class="form-input">
                    </div>
                </div>

                <div class="form-grid-2">
                    <div class="form-group">
                        <label for="dataAbertura" class="form-label">Data de abertura</label>
                        <input type="date" id="dataAbertura" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="dataEncerramento" class="form-label">Data de encerramento</label>
                        <input type="date" id="dataEncerramento" class="form-input">
                    </div>
                </div>

                <div class="form-group">
                    <label for="documentosNecessarios" class="form-label">Documentos necessários</label>
                    <textarea id="documentosNecessarios" rows="3" placeholder="Liste os documentos exigidos no edital"
                        class="form-input"></textarea>
                </div>

                <button type="submit" id="btn-checkout" class="btn btn-primary btn-block">
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
        <div class="confirm-box">
            <div class="confirm-icon"><span>✓</span></div>
            <span class="eyebrow">Processo Aberto</span>
            <h3>Processo nº ${resposta.pedido.codPedido} aberto com sucesso!</h3>
            <p>Acompanharemos ${resposta.entrega.orgaoResponsavel} pelo status do processo. Você pode acompanhar tudo
                no seu histórico de pedidos.</p>
            <a href="./orders.html" class="btn btn-primary">Ver meus pedidos</a>
        </div>
    `
}

document.addEventListener('DOMContentLoaded', () => {
    exigirLogin()
    renderizarResumo()
})