// Página: assinatura.html (privada — exige login)
// Fluxo: escolher plano + ciclo (+ extras) -> pagar -> plano liberado -> pesquisar licitações.

const METODOS = {
    pix: { rotulo: 'Pix', dica: 'Aprovação imediata' },
    boleto: { rotulo: 'Boleto', dica: 'Compensa em até 3 dias úteis' },
    cartao: { rotulo: 'Cartão de crédito', dica: 'Aprovação imediata' }
}

const MAX_EXTRAS = 20

const params = new URLSearchParams(window.location.search)

const estado = {
    planoId: PLANOS_VALIDOS(params.get('plano')) ? params.get('plano') : 'pro',
    ciclo: ['mensal', 'trimestral', 'anual'].includes(params.get('ciclo')) ? params.get('ciclo') : 'mensal',
    extras: { cnpj: 0, usuario: 0 },
    metodo: 'pix',
    aceite: false,
    enviando: false
}

function PLANOS_VALIDOS(id) {
    return ['free', 'pro', 'max'].includes(id)
}

function mostrarErro(mensagem) {
    const alerta = document.getElementById('assinatura-alert')
    alerta.textContent = mensagem
    alerta.classList.add('show')
    alerta.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function esconderErro() {
    document.getElementById('assinatura-alert').classList.remove('show')
}

// ---------- pagamento ----------
// DEMONSTRAÇÃO: não existe gateway de pagamento nem rota de assinatura no backend ainda.
// Para ir a produção, troque o corpo desta função por uma chamada ao backend/gateway
// (ex.: POST /assinaturas, devolvendo o link/QR do Pix ou a sessão de checkout do cartão)
// e só chame ativarAssinatura() depois da confirmação do pagamento.
async function processarPagamento(dados) {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return { aprovado: true, ...dados }
}

// ---------- renderização ----------

function linhasResumo() {
    const plano = PLANOS[estado.planoId]
    const ciclo = CICLOS[estado.ciclo]
    const linhas = [[`Plano ${plano.nome} — ${ciclo.rotulo}`, formatarPreco(totalDoCiclo(plano.id, estado.ciclo))]]

    if (plano.extras && estado.extras.cnpj > 0) {
        linhas.push([`${estado.extras.cnpj}x CNPJ extra (${formatarPreco(plano.extras.cnpj)}/mês × ${ciclo.meses})`,
            formatarPreco(estado.extras.cnpj * plano.extras.cnpj * ciclo.meses)])
    }
    if (plano.extras && estado.extras.usuario > 0) {
        linhas.push([`${estado.extras.usuario}x usuário extra (${formatarPreco(plano.extras.usuario)}/mês × ${ciclo.meses})`,
            formatarPreco(estado.extras.usuario * plano.extras.usuario * ciclo.meses)])
    }
    return linhas
}

function blocoPlanos() {
    return `
        <div class="summary-box bloco-assinatura">
            <h3 class="box-title">1. Plano</h3>
            <div class="opcoes-grid">
                ${Object.values(PLANOS).map(p => `
                    <label class="opcao-radio ${p.id === estado.planoId ? 'ativa' : ''}">
                        <input type="radio" name="plano" value="${p.id}" ${p.id === estado.planoId ? 'checked' : ''}>
                        <strong>${p.nome}</strong>
                        <small>${p.id === 'free' ? 'R$ 0' : `a partir de ${formatarPreco(equivalenteMensal(p.id, 'anual'))}/mês`}</small>
                    </label>
                `).join('')}
            </div>
        </div>`
}

function blocoCiclo() {
    if (estado.planoId === 'free') return ''
    return `
        <div class="summary-box bloco-assinatura">
            <h3 class="box-title">2. Ciclo de cobrança</h3>
            <div class="opcoes-grid">
                ${Object.entries(CICLOS).map(([id, c]) => `
                    <label class="opcao-radio ${id === estado.ciclo ? 'ativa' : ''}">
                        <input type="radio" name="ciclo" value="${id}" ${id === estado.ciclo ? 'checked' : ''}>
                        <strong>${c.rotulo}</strong>
                        <small>${formatarPreco(equivalenteMensal(estado.planoId, id))}/mês${c.desconto ? ` · -${c.desconto}` : ''}</small>
                    </label>
                `).join('')}
            </div>
        </div>`
}

function blocoExtras() {
    const plano = PLANOS[estado.planoId]
    if (!plano.extras) return ''

    const linha = (chave, titulo, detalhe) => `
        <div class="extra-linha">
            <div>${titulo}<small>${detalhe}</small></div>
            <div class="stepper">
                <button type="button" data-extra="${chave}" data-delta="-1" aria-label="Diminuir">−</button>
                <span>${estado.extras[chave]}</span>
                <button type="button" data-extra="${chave}" data-delta="1" aria-label="Aumentar">+</button>
            </div>
        </div>`

    return `
        <div class="summary-box bloco-assinatura">
            <h3 class="box-title">3. Extras (opcional)</h3>
            ${linha('cnpj', 'CNPJ extra', `${formatarPreco(plano.extras.cnpj)} por mês, cada`)}
            ${linha('usuario', 'Usuário extra', `${formatarPreco(plano.extras.usuario)} por mês, cada`)}
        </div>`
}

function blocoPagamento() {
    if (estado.planoId === 'free') return ''
    return `
        <div class="summary-box bloco-assinatura">
            <h3 class="box-title">4. Forma de pagamento</h3>
            <div class="opcoes-grid">
                ${Object.entries(METODOS).map(([id, m]) => `
                    <label class="opcao-radio ${id === estado.metodo ? 'ativa' : ''}">
                        <input type="radio" name="metodo" value="${id}" ${id === estado.metodo ? 'checked' : ''}>
                        <strong>${m.rotulo}</strong>
                        <small>${m.dica}</small>
                    </label>
                `).join('')}
            </div>
        </div>`
}

function blocoResumo() {
    const free = estado.planoId === 'free'
    const total = free ? 0 : totalAssinatura(estado.planoId, estado.ciclo, estado.extras)
    const economia = !free && estado.ciclo !== 'mensal' ? economiaDoCiclo(estado.planoId, estado.ciclo) : 0

    return `
        <div class="summary-box bloco-assinatura">
            <h3 class="box-title">Resumo</h3>
            ${free
                ? '<div class="summary-line"><p>Plano Free</p><strong>R$ 0</strong></div>'
                : linhasResumo().map(([nome, valor]) => `<div class="summary-line"><p>${escaparTexto(nome)}</p><strong>${valor}</strong></div>`).join('')}
            ${economia > 0 ? `<div class="summary-line"><p>Economia contra o plano mensal</p><strong style="color: var(--brand-red);">${formatarPreco(economia)}</strong></div>` : ''}
            <div class="summary-total-row"><span>Total</span><span>${formatarPreco(total)}</span></div>

            <label class="termos-linha">
                <input type="checkbox" id="aceite-termos" ${estado.aceite ? 'checked' : ''}>
                <span>Li e aceito os <a href="./termos.html" target="_blank" style="color: var(--brand-red);">Termos de Uso</a>
                e a <a href="./privacidade.html" target="_blank" style="color: var(--brand-red);">Política de Privacidade</a>.</span>
            </label>

            <button type="button" id="btn-assinar" class="btn btn-primary btn-block" ${estado.enviando ? 'disabled' : ''}>
                ${estado.enviando ? 'Processando...' : (free ? 'Ativar plano gratuito' : `Pagar ${formatarPreco(total)} e liberar acesso`)}
            </button>
        </div>`
}

function escaparTexto(t) {
    return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function blocoAssinaturaAtual() {
    const atual = getAssinatura()
    if (!atual || !atual.ativa || atual.planoId === 'free' && estado.planoId === 'free') return ''
    return `<div class="plano-status" style="margin-bottom: 24px;">
        <span>Seu plano atual é o <strong>${PLANOS[atual.planoId].nome}</strong>. Ao contratar outro plano, ele será substituído.</span>
    </div>`
}

function renderizar() {
    const container = document.getElementById('assinatura-content')

    container.innerHTML = `
        <div class="aviso-demo">
            <strong>Ambiente de demonstração:</strong> o pagamento ainda é simulado. Nenhum valor é cobrado e nenhum dado
            de cartão é coletado ou guardado.
        </div>
        ${blocoAssinaturaAtual()}
        ${blocoPlanos()}
        ${blocoCiclo()}
        ${blocoExtras()}
        ${blocoPagamento()}
        ${blocoResumo()}
    `

    container.querySelectorAll('input[name="plano"]').forEach(el => el.addEventListener('change', () => {
        estado.planoId = el.value
        if (!PLANOS[estado.planoId].extras) estado.extras = { cnpj: 0, usuario: 0 }
        renderizar()
    }))
    container.querySelectorAll('input[name="ciclo"]').forEach(el => el.addEventListener('change', () => {
        estado.ciclo = el.value
        renderizar()
    }))
    container.querySelectorAll('input[name="metodo"]').forEach(el => el.addEventListener('change', () => {
        estado.metodo = el.value
        renderizar()
    }))
    container.querySelectorAll('[data-extra]').forEach(btn => btn.addEventListener('click', () => {
        const chave = btn.dataset.extra
        estado.extras[chave] = Math.min(MAX_EXTRAS, Math.max(0, estado.extras[chave] + Number(btn.dataset.delta)))
        renderizar()
    }))
    document.getElementById('aceite-termos').addEventListener('change', e => { estado.aceite = e.target.checked })
    document.getElementById('btn-assinar').addEventListener('click', assinar)

    if (typeof lucide !== 'undefined') lucide.createIcons()
}

async function assinar() {
    esconderErro()

    if (!estado.aceite) {
        mostrarErro('Aceite os Termos de Uso e a Política de Privacidade para continuar.')
        return
    }

    estado.enviando = true
    renderizar()

    try {
        const free = estado.planoId === 'free'
        const pagamento = await processarPagamento({
            planoId: estado.planoId,
            ciclo: estado.ciclo,
            extras: estado.extras,
            metodo: free ? null : estado.metodo,
            total: free ? 0 : totalAssinatura(estado.planoId, estado.ciclo, estado.extras)
        })

        if (!pagamento.aprovado) throw new Error('Pagamento não aprovado. Tente outra forma de pagamento.')

        const assinatura = ativarAssinatura({
            planoId: estado.planoId,
            ciclo: estado.ciclo,
            extras: estado.extras,
            metodo: free ? null : estado.metodo
        })
        if (!assinatura) throw new Error('Não foi possível liberar o plano. Entre na sua conta e tente de novo.')

        renderizarConfirmacao(assinatura)
    } catch (err) {
        estado.enviando = false
        renderizar()
        mostrarErro(err.message)
    }
}

function renderizarConfirmacao(assinatura) {
    const plano = PLANOS[assinatura.planoId]
    const validade = assinatura.expiraEm ? `Acesso liberado até ${formatarData(assinatura.expiraEm)}.` : 'Acesso sem prazo de validade.'
    const limite = isFinite(plano.limites.consultasMes)
        ? `Você tem ${plano.limites.consultasMes} consultas por mês.`
        : 'Consultas ilimitadas.'

    document.getElementById('assinatura-content').innerHTML = `
        <div class="confirm-box">
            <div class="confirm-icon"><span>✓</span></div>
            <span class="eyebrow">Plano Liberado</span>
            <h3>Plano ${plano.nome} ativado!</h3>
            <p>${validade} ${limite} A pesquisa de licitações já está disponível para a sua conta.</p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="./licitacoes.html" class="btn btn-primary">Pesquisar licitações</a>
                <a href="./catalog.html" class="btn btn-outline">Voltar aos serviços</a>
            </div>
        </div>
    `
}

function formatarData(iso) {
    const d = new Date(iso)
    return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR')
}

document.addEventListener('DOMContentLoaded', () => {
    // Guarda a escolha para voltar a esta tela depois do login/cadastro
    if (!estaLogado()) {
        sessionStorage.setItem('del_redirect_after_login', `./assinatura.html${window.location.search}`)
        window.location.href = getRelativePath('login')
        return
    }
    renderizar()
})
