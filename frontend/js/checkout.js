// Página: checkout.html (privada — exige login)

function mostrarErroCheckout(mensagem) {
    const alerta = document.getElementById('checkout-alert')
    alerta.textContent = mensagem
    alerta.classList.add('show')
    alerta.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function esconderErroCheckout() {
    document.getElementById('checkout-alert').classList.remove('show')
}

function renderizarResumo() {
    const container = document.getElementById('checkout-content')
    const itens = getCarrinho()

    if (itens.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty__icon">🗂️</div>
                <p>Seu carrinho está vazio, não há o que finalizar.</p>
                <a href="./catalog.html" class="btn-primary btn-sm" style="display:inline-block; margin-top:16px;">
                    Ver serviços disponíveis
                </a>
            </div>
        `
        return
    }

    const total = totalCarrinho()

    container.innerHTML = `
        <div class="form-shell form-wide" style="margin-bottom: 32px;">
            <h3 style="margin-bottom:16px; font-size:18px; font-weight:700;">Serviços contratados</h3>
            <div class="cart-list">
                ${itens.map(item => `
                    <div class="cart-item">
                        <div class="cart-item__info">
                            <div class="cart-item__name">${item.nome}</div>
                            <div class="cart-item__price">${item.quantidade}x ${formatarMoeda(item.preco)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary__total" style="border-top:1px solid var(--card-border); padding-top:16px; margin-top:16px;">
                <span>Total</span>
                <span>${formatarMoeda(total)}</span>
            </div>
        </div>

        <div class="form-shell form-wide">
            <h3 style="margin-bottom:20px; font-size:18px; font-weight:700;">Dados do processo licitatório</h3>
            <form id="form-checkout">
                <div class="form-group">
                    <label for="orgaoResponsavel">Órgão responsável</label>
                    <input type="text" id="orgaoResponsavel" required placeholder="Ex: Prefeitura Municipal de...">
                </div>

                <div class="form-group">
                    <label for="objetoLicitacao">Objeto da licitação</label>
                    <textarea id="objetoLicitacao" rows="3" required
                        placeholder="Descreva o que está sendo licitado"></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="modalidade">Modalidade</label>
                        <select id="modalidade" required>
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
                        <label for="responsavelAcompanhamento">Responsável pelo acompanhamento</label>
                        <input type="text" id="responsavelAcompanhamento" placeholder="Nome do responsável">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="dataAbertura">Data de abertura</label>
                        <input type="date" id="dataAbertura">
                    </div>
                    <div class="form-group">
                        <label for="dataEncerramento">Data de encerramento</label>
                        <input type="date" id="dataEncerramento">
                    </div>
                </div>

                <div class="form-group">
                    <label for="documentosNecessarios">Documentos necessários</label>
                    <textarea id="documentosNecessarios" rows="3"
                        placeholder="Liste os documentos exigidos no edital"></textarea>
                </div>

                <button type="submit" class="btn-primary btn-block" id="btn-checkout">Confirmar e abrir processo</button>
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
        <div class="form-shell form-wide" style="text-align:center;">
            <div class="stamp" style="margin: 0 auto 20px;">PROCESSO<br>ABERTO</div>
            <h3 style="font-size:22px; font-weight:700; margin-bottom:8px;">Processo nº ${resposta.pedido.codPedido} aberto com sucesso!</h3>
            <p style="color:var(--text-muted); margin-bottom: 24px;">
                Acompanharemos ${resposta.entrega.orgaoResponsavel} pelo status do processo. Você pode acompanhar tudo no seu histórico de pedidos.
            </p>
            <a href="./orders.html" class="btn-primary btn-block">Ver meus pedidos</a>
        </div>
    `
}

document.addEventListener('DOMContentLoaded', () => {
    exigirLogin()
    renderizarResumo()
})
