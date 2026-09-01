// Página: orders.html (privada — exige login)

async function carregarPedidos() {
    const container = document.getElementById('orders-content');
    if (!container) return;

    container.innerHTML = '<p class="state-message">Carregando seus processos e pedidos...</p>';

    try {
        const pedidos = await apiRequest('/pedidos', { auth: true });
        renderizarPedidos(pedidos);
    } catch (err) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty__icon">📑</div>
                <p>Nenhum processo encontrado ou servidor indisponível no momento.</p>
                <div class="flex gap-4 justify-center mt-4">
                    <a href="./catalog.html" class="btn-primary btn-sm" style="display:inline-block;">
                        Ver serviços de licitação
                    </a>
                    <a href="../index.html" class="btn-secondary btn-sm" style="display:inline-block; border: 1px solid rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 8px;">
                        Voltar ao Início
                    </a>
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
            <div class="cart-empty">
                <div class="cart-empty__icon">📂</div>
                <p>Você ainda não abriu nenhum processo licitatório.</p>
                <a href="./catalog.html" class="btn-primary btn-sm" style="display:inline-block; margin-top:16px;">
                    Contratar serviços
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="orders-list" style="display:flex; flex-direction:column; gap:20px;">
            ${pedidos.map(pedido => {
                const dataFormatada = pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString('pt-BR') : 'Data recente';
                const status = pedido.status || 'Em Análise';
                const orgao = (pedido.entrega && pedido.entrega.orgaoResponsavel) || pedido.orgaoResponsavel || 'Órgão não informado';
                const objeto = (pedido.entrega && pedido.entrega.objetoLicitacao) || pedido.objetoLicitacao || 'Sem descrição';
                const modalidade = (pedido.entrega && pedido.entrega.modalidade) || pedido.modalidade || '';
                const total = pedido.total ? Number(pedido.total) : (pedido.itens ? pedido.itens.reduce((acc, item) => acc + (Number(item.preco || (item.servico && item.servico.preco) || 0) * (item.quantidade || 1)), 0) : 0);

                return `
                    <div class="form-shell form-wide text-left" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 24px;">
                        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 mb-4">
                            <div>
                                <span class="text-xs text-white/50">PROCESSO</span>
                                <h3 class="text-lg font-bold text-white">#${pedido.codPedido || pedido.id || '---'}</h3>
                            </div>
                            <div class="text-right">
                                <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#d62828]/20 text-[#ff6b6b] border border-[#d62828]/30">
                                    ${status}
                                </span>
                                <p class="text-xs text-white/40 mt-1">${dataFormatada}</p>
                            </div>
                        </div>

                        <div class="space-y-2 text-sm text-white/80 mb-4">
                            <p><strong class="text-white">Órgão:</strong> ${orgao}</p>
                            <p><strong class="text-white">Objeto:</strong> ${objeto}</p>
                            ${modalidade ? `<p><strong class="text-white">Modalidade:</strong> ${modalidade}</p>` : ''}
                        </div>

                        ${pedido.itens && pedido.itens.length > 0 ? `
                            <div class="bg-black/30 rounded-lg p-3 mb-4">
                                <span class="text-xs text-white/50 font-semibold block mb-2">SERVIÇOS CONTRATADOS:</span>
                                <ul class="space-y-1 text-xs text-white/70">
                                    ${pedido.itens.map(item => `
                                        <li class="flex justify-between">
                                            <span>${(item.servico && item.servico.nome) || item.nome || 'Serviço de Licitação'} (${item.quantidade || 1}x)</span>
                                            <span class="text-[#ff6b6b] font-medium">${formatarMoeda ? formatarMoeda(Number(item.preco || (item.servico && item.servico.preco) || 0)) : `R$ ${item.preco}`}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <div class="flex justify-between items-center pt-2 border-t border-white/5 text-sm">
                            <span class="text-white/60">Total</span>
                            <span class="text-base font-bold text-[#d62828]">${formatarMoeda ? formatarMoeda(total) : `R$ ${total}`}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="mt-8 text-center">
            <a href="./catalog.html" class="btn-primary btn-sm" style="display:inline-block;">
                + Contratar mais serviços
            </a>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    exigirLogin();
    carregarPedidos();
});
