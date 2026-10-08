// Planos de assinatura da Del Company (Free, Pro e Max) + controle de acesso à pesquisa de licitações.
// Valores e limites vêm da planilha planos_licitacoes_del_company.xlsx (abas "Planos" e "Recursos").
//
// ATENÇÃO: a assinatura é guardada no LocalStorage (por usuário), como o carrinho e os favoritos.
// Isso libera o fluxo no frontend, mas NÃO é segurança: para valer de verdade, o backend precisa
// registrar a assinatura/pagamento e validar o plano nas rotas /api/licitacoes/*.

const ASSINATURA_KEY = 'del_assinatura_'
const CONSULTAS_KEY = 'del_consultas_'

const CICLOS = {
    mensal: { rotulo: 'Mensal', meses: 1, desconto: null },
    trimestral: { rotulo: 'Trimestral', meses: 3, desconto: '10%' },
    anual: { rotulo: 'Anual', meses: 12, desconto: '20%' }
}

// total = valor cobrado no ciclo inteiro (planilha, aba "Planos")
const PLANOS = {
    free: {
        id: 'free',
        nome: 'Free',
        resumo: 'Para conhecer a plataforma e fazer as primeiras triagens.',
        totais: { mensal: 0, trimestral: 0, anual: 0 },
        extras: null,
        limites: { consultasMes: 20, filtrosAvancados: false, ramo: false, seloCompleto: false }
    },
    pro: {
        id: 'pro',
        nome: 'Pro',
        resumo: 'Para empresas que disputam licitações com frequência.',
        destaque: true,
        totais: { mensal: 99, trimestral: 267, anual: 948 },
        extras: { cnpj: 49, usuario: 29 },
        limites: { consultasMes: Infinity, filtrosAvancados: true, ramo: true, seloCompleto: true }
    },
    max: {
        id: 'max',
        nome: 'Max',
        resumo: 'Para operações com vários CNPJs e equipe dedicada.',
        totais: { mensal: 299, trimestral: 807, anual: 2868 },
        extras: { cnpj: 79, usuario: 19 },
        limites: { consultasMes: Infinity, filtrosAvancados: true, ramo: true, seloCompleto: true }
    }
}

// aba "Recursos" da planilha, na mesma ordem
const RECURSOS = [
    ['CNPJs incluídos', '1', '1', 'Até 5'],
    ['Usuários incluídos', '1', '3', '10'],
    ['Busca de licitações (PNCP)', 'Limite de 20 consultas/mês', 'Ilimitada', 'Ilimitada'],
    ['Selo de enquadramento por valor', 'Básico', 'Completo', 'Completo'],
    ['Classificação por ramo', 'Não', 'Sim', 'Sim'],
    ['Filtros avançados', 'Não', 'Sim', 'Sim'],
    ['Buscas salvas', '3', '20', 'Ilimitadas'],
    ['Alertas por e-mail', 'Resumo semanal', 'Diário', 'Em tempo real'],
    ['Análise de mercado', '5 consultas/mês', '50 consultas/mês', 'Ilimitada'],
    ['Dashboard /inteligencia', 'Resumido', 'Completo', 'Completo + exportação (CSV/PDF)'],
    ['Kanban de licitações', 'Não', '1 quadro, até 50 cards', 'Ilimitado'],
    ['Cofre de certidões', 'Não', 'Até 10 documentos', 'Ilimitado, com alerta de vencimento'],
    ['Modelos de documentos', 'Não', 'Básicos', 'Biblioteca completa'],
    ['Histórico de dados', '30 dias', '12 meses', 'Completo'],
    ['Suporte', 'Comunidade / FAQ', 'E-mail', 'Prioritário + 1 h de consultoria/mês']
]

function recursoDoPlano(rotulo, planoId) {
    const linha = RECURSOS.find(r => r[0] === rotulo)
    const coluna = { free: 1, pro: 2, max: 3 }[planoId]
    return linha ? linha[coluna] : ''
}

const formatadorPreco = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 2
})

function formatarPreco(valor) {
    return formatadorPreco.format(Number(valor))
}

// ---------- preços ----------

function totalDoCiclo(planoId, ciclo) {
    return PLANOS[planoId].totais[ciclo]
}

function equivalenteMensal(planoId, ciclo) {
    return totalDoCiclo(planoId, ciclo) / CICLOS[ciclo].meses
}

// economia do ciclo contra pagar mensalmente o mesmo período
function economiaDoCiclo(planoId, ciclo) {
    return PLANOS[planoId].totais.mensal * CICLOS[ciclo].meses - totalDoCiclo(planoId, ciclo)
}

// extras: { cnpj: n, usuario: n } — cobrados por mês, durante todo o ciclo
function totalExtras(planoId, ciclo, extras = {}) {
    const preco = PLANOS[planoId].extras
    if (!preco) return 0
    const porMes = (extras.cnpj || 0) * preco.cnpj + (extras.usuario || 0) * preco.usuario
    return porMes * CICLOS[ciclo].meses
}

function totalAssinatura(planoId, ciclo, extras) {
    return totalDoCiclo(planoId, ciclo) + totalExtras(planoId, ciclo, extras)
}

// ---------- assinatura do usuário logado ----------

function chaveUsuario() {
    const u = typeof getUsuarioLogado === 'function' ? getUsuarioLogado() : null
    if (!u) return null
    return String(u.codUsuario ?? u.id ?? u.email ?? u.nome ?? 'usuario')
}

function adicionarMeses(data, meses) {
    const d = new Date(data)
    d.setMonth(d.getMonth() + meses)
    return d
}

// Retorna a assinatura salva (ou null). `ativa` considera a validade.
function getAssinatura() {
    const chave = chaveUsuario()
    if (!chave) return null
    try {
        const bruto = localStorage.getItem(ASSINATURA_KEY + chave)
        if (!bruto) return null
        const a = JSON.parse(bruto)
        if (!PLANOS[a.planoId]) return null
        a.ativa = !a.expiraEm || new Date(a.expiraEm) > new Date()
        return a
    } catch (err) {
        return null
    }
}

// Plano liberado agora (ou null se não tem assinatura ativa)
function planoAtual() {
    const a = getAssinatura()
    return a && a.ativa ? PLANOS[a.planoId] : null
}

function ativarAssinatura({ planoId, ciclo = 'mensal', extras = {}, metodo = null }) {
    const chave = chaveUsuario()
    if (!chave || !PLANOS[planoId]) return null

    const agora = new Date()
    const assinatura = {
        planoId,
        ciclo: planoId === 'free' ? null : ciclo,
        extras: planoId === 'free' ? { cnpj: 0, usuario: 0 } : { cnpj: extras.cnpj || 0, usuario: extras.usuario || 0 },
        valorPago: planoId === 'free' ? 0 : totalAssinatura(planoId, ciclo, extras),
        metodo: planoId === 'free' ? null : metodo,
        inicioEm: agora.toISOString(),
        expiraEm: planoId === 'free' ? null : adicionarMeses(agora, CICLOS[ciclo].meses).toISOString()
    }
    localStorage.setItem(ASSINATURA_KEY + chave, JSON.stringify(assinatura))
    return assinatura
}

// ---------- cota de consultas (plano Free) ----------

function mesAtualChave() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function consultasUsadas() {
    const chave = chaveUsuario()
    if (!chave) return 0
    return Number(localStorage.getItem(`${CONSULTAS_KEY}${chave}_${mesAtualChave()}`)) || 0
}

// Tenta gastar 1 consulta. Retorna { ok, usadas, limite }.
function consumirConsulta(limite) {
    const usadas = consultasUsadas()
    if (!isFinite(limite)) return { ok: true, usadas, limite }
    if (usadas >= limite) return { ok: false, usadas, limite }

    localStorage.setItem(`${CONSULTAS_KEY}${chaveUsuario()}_${mesAtualChave()}`, String(usadas + 1))
    return { ok: true, usadas: usadas + 1, limite }
}
