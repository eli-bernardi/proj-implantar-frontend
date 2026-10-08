// Página: catalog.html — seção "Planos" (Free, Pro e Max) com ciclo de cobrança variável.
// A tabela de preços muda conforme o ciclo escolhido (mensal, trimestral ou anual).

let cicloAtual = sessionStorage.getItem('del_ciclo') || 'mensal'

function irParaAssinatura(planoId) {
    sessionStorage.setItem('del_ciclo', cicloAtual)
    const ciclo = planoId === 'free' ? '' : `&ciclo=${cicloAtual}`
    window.location.href = `./assinatura.html?plano=${planoId}${ciclo}`
}

function renderizarStatusPlano() {
    const box = document.getElementById('plano-status')
    if (!box) return

    const assinatura = typeof getAssinatura === 'function' ? getAssinatura() : null

    if (!assinatura) {
        box.style.display = 'none'
        return
    }

    const plano = PLANOS[assinatura.planoId]
    const validade = assinatura.expiraEm
        ? (assinatura.ativa ? `ativo até ${formatarData(assinatura.expiraEm)}` : `expirou em ${formatarData(assinatura.expiraEm)}`)
        : 'sem prazo de validade'

    box.style.display = 'flex'
    box.innerHTML = `
        <span>Seu plano: <strong>${escaparHtml(plano.nome)}</strong> — ${escaparHtml(validade)}</span>
        ${assinatura.ativa
            ? '<a href="./licitacoes.html" class="btn btn-primary btn-sm">Pesquisar licitações</a>'
            : `<button type="button" class="btn btn-primary btn-sm" onclick="irParaAssinatura('${plano.id}')">Renovar plano</button>`}
    `
}

function renderizarCiclos() {
    const toggle = document.getElementById('ciclo-toggle')
    if (!toggle) return

    toggle.innerHTML = Object.entries(CICLOS).map(([id, c]) => `
        <button type="button" class="ciclo-btn ${id === cicloAtual ? 'ativo' : ''}" data-ciclo="${id}">
            ${c.rotulo}${c.desconto ? `<small>-${c.desconto}</small>` : ''}
        </button>
    `).join('')

    toggle.querySelectorAll('.ciclo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cicloAtual = btn.dataset.ciclo
            sessionStorage.setItem('del_ciclo', cicloAtual)
            renderizarCiclos()
            renderizarCards()
        })
    })
}

function textoCobranca(planoId) {
    if (planoId === 'free') return 'Sem cobrança, para sempre.'

    const ciclo = CICLOS[cicloAtual]
    if (cicloAtual === 'mensal') return 'Cobrança mensal, sem fidelidade.'

    const total = formatarPreco(totalDoCiclo(planoId, cicloAtual))
    const economia = formatarPreco(economiaDoCiclo(planoId, cicloAtual))
    return `${total} a cada ${ciclo.meses} meses · <b>economia de ${economia}</b>`
}

function renderizarCards() {
    const grid = document.getElementById('planos-grid')
    if (!grid) return

    const assinatura = typeof getAssinatura === 'function' ? getAssinatura() : null
    const planoAtualId = assinatura && assinatura.ativa ? assinatura.planoId : null
    const destaques = ['CNPJs incluídos', 'Usuários incluídos', 'Busca de licitações (PNCP)', 'Alertas por e-mail', 'Buscas salvas', 'Análise de mercado']

    grid.innerHTML = Object.values(PLANOS).map(plano => {
        const eAtual = planoAtualId === plano.id
        const preco = plano.id === 'free' ? 'R$ 0' : formatarPreco(equivalenteMensal(plano.id, cicloAtual))
        const rotuloBotao = eAtual
            ? 'Plano atual'
            : plano.id === 'free' ? 'Começar grátis' : `Contratar ${plano.nome}`

        return `
        <article class="plano-card ${plano.destaque ? 'destaque' : ''} ${eAtual ? 'atual' : ''}">
            ${plano.destaque ? '<span class="plano-selo">Mais escolhido</span>' : ''}
            <h3 class="plano-nome">${plano.nome}</h3>
            <p class="plano-resumo">${plano.resumo}</p>
            <div class="plano-preco">${preco} <span>/mês</span></div>
            <p class="plano-cobranca">${textoCobranca(plano.id)}</p>
            <ul class="plano-lista">
                ${destaques.map(r => `<li><span>${r}</span><span>${escaparHtml(recursoDoPlano(r, plano.id))}</span></li>`).join('')}
            </ul>
            <button type="button" class="${plano.destaque ? 'btn btn-primary' : 'btn btn-dark'} btn-block btn-sm"
                ${eAtual ? 'disabled' : ''} onclick="irParaAssinatura('${plano.id}')">${rotuloBotao}</button>
        </article>`
    }).join('')
}

function renderizarTabela() {
    const wrap = document.getElementById('planos-tabela')
    if (!wrap) return

    wrap.innerHTML = `
        <table class="planos-tabela">
            <thead>
                <tr><th>Recurso</th><th>Free</th><th>Pro</th><th>Max</th></tr>
            </thead>
            <tbody>
                ${RECURSOS.map(r => `
                    <tr><th scope="row">${escaparHtml(r[0])}</th><td>${escaparHtml(r[1])}</td><td>${escaparHtml(r[2])}</td><td>${escaparHtml(r[3])}</td></tr>
                `).join('')}
            </tbody>
        </table>
    `
}

function renderizarExtras() {
    const box = document.getElementById('planos-extras')
    if (!box) return

    box.innerHTML = `
        <div class="plano-extra-box">
            <strong>CNPJ extra</strong>
            Pro: ${formatarPreco(PLANOS.pro.extras.cnpj)}/mês por CNPJ · Max: ${formatarPreco(PLANOS.max.extras.cnpj)}/mês por CNPJ acima do incluído.
        </div>
        <div class="plano-extra-box">
            <strong>Usuário extra</strong>
            Pro: ${formatarPreco(PLANOS.pro.extras.usuario)}/mês por usuário · Max: ${formatarPreco(PLANOS.max.extras.usuario)}/mês por usuário.
        </div>
    `
}

document.addEventListener('DOMContentLoaded', () => {
    if (!CICLOS[cicloAtual]) cicloAtual = 'mensal'
    renderizarStatusPlano()
    renderizarCiclos()
    renderizarCards()
    renderizarTabela()
    renderizarExtras()
    if (typeof lucide !== 'undefined') lucide.createIcons()
})
