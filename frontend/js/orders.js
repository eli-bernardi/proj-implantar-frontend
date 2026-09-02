// Página: orders.html (privada — exige login)

async function carregarPedidos() {
    const container = document.getElementById('orders-content');
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-brand-muted">
            <p class="text-xs uppercase tracking-widest font-light">Carregando seus processos e pedidos...</p>
        </div>
    `;

    try {
        // ✅ Rota correta: /pedidos/meus-pedidos retorna apenas os pedidos do usuário logado.
        //    /pedidos é exclusiva de admin (somenteAdmin) e retornaria 403 para clientes.
        const pedidos = await apiRequest('/pedidos/meus-pedidos', { auth: true });
        renderizarPedidos(pedidos);
    } catch (err) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <span class="text-5xl mb-4">📑</span>
                <p class="text-sm font-light text-brand-muted mb-6">Nenhum processo encontrado ou servidor indisponível no momento.</p>
                <div class="flex flex-wrap gap-3 justify-center">
                    <a href="./catalog.html"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-redHover text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300">
                        Ver serviços de licitação
                    </a>
                    <a href="../index.html"
                        class="inline-flex items-center gap-2 px-6 py-3 border border-brand-border hover:border-brand-black text-brand-black text-xs uppercase tracking-widest font-semibold transition-all duration-300">
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
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <span class="text-5xl mb-4">📂</span>
                <p class="text-sm font-light text-brand-muted mb-6">Você ainda não abriu nenhum processo licitatório.</p>
                <a href="./catalog.html"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-redHover text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300">
                    Contratar serviços
                </a>
            </div>
        `;
        return;
    }

    const statusClasses = {
        'CONFIRMADO':   'bg-green-50 text-green-700 border border-green-200',
        'PENDENTE':     'bg-yellow-50 text-yellow-700 border border-yellow-200',
        'EM_ANDAMENTO': 'bg-blue-50 text-blue-700 border border-blue-200',
        'CONCLUIDO':    'bg-gray-100 text-gray-600 border border-gray-200',
        'CANCELADO':    'bg-red-50 text-brand-red border border-brand-red/20',
    };

    container.innerHTML = `
        <div class="flex flex-col gap-6">
            ${pedidos.map(pedido => {
                // ✅ Campo correto: dataPedido (modelo usa timestamps: false, não há createdAt)
                const dataFormatada = pedido.dataPedido
                    ? new Date(pedido.dataPedido).toLocaleDateString('pt-BR')
                    : 'Data recente';

                const status = pedido.status || 'PENDENTE';
                const statusClass = statusClasses[status] || 'bg-gray-100 text-gray-600 border border-gray-200';

                // ✅ Campo correto: entregaPedido (alias do pedido.controller.js)
                const entrega = pedido.entregaPedido || {};
                const orgao = entrega.orgaoResponsavel || 'Órgão não informado';
                const objeto = entrega.objetoLicitacao || 'Sem descrição';
                const modalidade = entrega.modalidade || '';

                // ✅ Campo correto: valorTotal (campo do modelo Pedido)
                const total = pedido.valorTotal ? Number(pedido.valorTotal) : 0;

                // ✅ Campo correto: itensPedido (alias do pedido.controller.js)
                const itens = pedido.itensPedido || [];

                return `
                    <div class="bg-white border border-brand-border p-6 sm:p-8">
                        <div class="flex flex-wrap items-start justify-between gap-3 pb-5 mb-5 border-b border-brand-border">
                            <div>
                                <span class="text-[10px] uppercase tracking-widest text-brand-muted">Processo</span>
                                <h3 class="font-serif text-2xl font-normal text-brand-black mt-0.5">#${pedido.codPedido || '---'}</h3>
                                <p class="text-[11px] text-brand-muted font-light mt-1">${dataFormatada}</p>
                            </div>
                            <span class="inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-semibold ${statusClass}">
                                ${status.replace('_', ' ')}
                            </span>
                        </div>

                        <div class="flex flex-col gap-2 text-xs text-brand-dark mb-5">
                            <p><span class="font-semibold text-brand-black uppercase tracking-widest text-[10px]">Órgão:</span> ${orgao}</p>
                            <p><span class="font-semibold text-brand-black uppercase tracking-widest text-[10px]">Objeto:</span> ${objeto}</p>
                            ${modalidade ? '<p><span class="font-semibold text-brand-black uppercase tracking-widest text-[10px]">Modalidade:</span> ' + modalidade + '</p>' : ''}
                        </div>

                        ${itens.length > 0 ? `
                            <div class="bg-brand-canvas border border-brand-border p-4 mb-5">
                                <span class="text-[10px] uppercase tracking-widest text-brand-muted font-semibold block mb-3">Serviços Contratados</span>
                                <ul class="flex flex-col gap-2">
                                    ${itens.map(item => '<li class="flex justify-between items-center text-xs"><span class="text-brand-dark">Serviço #' + item.idServico + ' (' + (item.quantidade || 1) + 'x)</span><span class="font-semibold text-brand-black">' + (typeof formatarMoeda === 'function' ? formatarMoeda(Number(item.precoUnitario || 0)) : 'R$ ' + item.precoUnitario) + '</span></li>').join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <div class="flex justify-between items-center pt-4 border-t border-brand-border">
                            <span class="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Total</span>
                            <span class="font-serif text-xl text-brand-red">${typeof formatarMoeda === 'function' ? formatarMoeda(total) : 'R$ ' + total}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="mt-10 text-center">
            <a href="./catalog.html"
                class="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-brand-black hover:text-brand-red transition-colors">
                + Contratar mais serviços
            </a>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    exigirLogin();
    carregarPedidos();
});
