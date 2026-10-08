// Componente reutilizável dos selos de enquadramento por valor.
// Usado na listagem, nos favoritos e (nas próximas fases) no kanban e no dashboard.
// Os selos já chegam prontos do backend (campo "selos"); aqui só desenhamos.

function escaparHtml(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatarMoeda(valor) {
    return valor === null || valor === undefined ? '—' : formatadorMoeda.format(Number(valor))
}

function formatarData(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

// selos: [{ codigo, rotulo, cor, emoji, baseLegal, limite, indicativo }]
// opcoes.basico: selo "Básico" do plano Free (só o rótulo, sem limite nem base legal)
function renderizarSelos(selos, opcoes = {}) {
    if (!Array.isArray(selos) || selos.length === 0) return ''

    const itens = selos.map(s => {
        const dica = [
            s.indicativo ? 'Indicativo: confirme no texto do edital.' : null,
            !opcoes.basico && s.limite ? `Limite considerado: ${formatarMoeda(s.limite)}` : null,
            !opcoes.basico ? (s.baseLegal || null) : null
        ].filter(Boolean).join(' — ')

        return `<span class="selo selo-${escaparHtml(s.cor)} ${s.indicativo ? 'selo-indicativo' : ''}" title="${escaparHtml(dica)}">${escaparHtml(s.emoji)} ${escaparHtml(s.rotulo)}</span>`
    }).join('')

    return `<div class="selos-linha">${itens}</div>`
}
