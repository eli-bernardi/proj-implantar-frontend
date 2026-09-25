// Página: orders.html (privada — exige login)

async function carregarPedidos() {
    const container = document.getElementById('orders-content');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-box">
            <p>Carregando seus processos e pedidos...</p>
        </div>
    `;

    try {
        const pedidos = await apiRequest('/pedidos/meus-pedidos', { auth: true });
        renderizarPedidos(pedidos);
    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">📑</span>
                <p>Nenhum processo encontrado ou servidor indisponível no momento.</p>
                <div class="empty-state-actions">
                    <a href="./catalog.html" class="btn btn-primary">Ver serviços de licitação</a>
                    <a href="../index.html" class="btn btn-outline">Voltar ao Início</a>
                </div>
            </div>
        `;
    }
}

function renderizarPedidos(pedidos) {
    const container = document.getElementById('orders-content');
    if (!container) return;

    if (!pedidos || pedidos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">📂</span>
                <p>Você ainda não abriu nenhum processo licitatório.</p>
                <a href="./catalog.html" class="btn btn-primary">Contratar serviços</a>
            </div>
        `;
        return;
    }

    const statusClasses = {
        'CONFIRMADO': 'badge-confirmado',
        'PENDENTE': 'badge-pendente',
        'EM_ANDAMENTO': 'badge-andamento',
        'CONCLUIDO': 'badge-concluido',
        'CANCELADO': 'badge-cancelado',
    };

    container.innerHTML = `
        <div class="orders-list">
            ${pedidos.map(pedido => {
        const dataFormatada = pedido.dataPedido
            ? new Date(pedido.dataPedido).toLocaleDateString('pt-BR')
            : 'Data recente';

        const status = pedido.status || 'PENDENTE';
        const statusClass = statusClasses[status] || 'badge-concluido';

        const entrega = pedido.entregaPedido || {};
        const orgao = entrega.orgaoResponsavel || 'Órgão não informado';
        const objeto = entrega.objetoLicitacao || 'Sem descrição';
        const modalidade = entrega.modalidade || '';

        const total = pedido.valorTotal ? Number(pedido.valorTotal) : 0;
        const itens = pedido.itensPedido || [];

        return `
                    <div class="order-card">
                        <div class="order-header">
                            <div>
                                <span class="order-label">Processo</span>
                                <h3 class="order-number">#${pedido.codPedido || '---'}</h3>
                                <p class="order-date">${dataFormatada}</p>
                            </div>
                            <span class="badge ${statusClass}">${status.replace('_', ' ')}</span>
                        </div>

                        <div class="order-info">
                            <p><strong>Órgão:</strong> ${orgao}</p>
                            <p><strong>Objeto:</strong> ${objeto}</p>
                            ${modalidade ? `<p><strong>Modalidade:</strong> ${modalidade}</p>` : ''}
                        </div>

                        ${itens.length > 0 ? `
                            <div class="order-items-box">
                                <span class="order-items-label">Serviços Contratados</span>
                                <ul class="order-items-list">
                                    ${itens.map(item => `
                                        <li>
                                            <span>Serviço #${item.idServico} (${item.quantidade || 1}x)</span>
                                            <span>${typeof formatarMoeda === 'function' ? formatarMoeda(Number(item.precoUnitario || 0)) : 'R$ ' + item.precoUnitario}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <div class="order-footer">
                            <span>Total</span>
                            <span class="order-total">${typeof formatarMoeda === 'function' ? formatarMoeda(total) : 'R$ ' + total}</span>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
        <div style="margin-top: 40px; text-align: center;">
            <a href="./catalog.html" class="link-arrow" style="justify-content: center;">+ Contratar mais serviços</a>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    exigirLogin();
    carregarPedidos();
});