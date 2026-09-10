// Carrinho de compras usando LocalStorage — funciona mesmo sem login,
// conforme exigido no PDF (o login só é obrigatório na finalização do pedido).

const CART_KEY = 'del_carrinho'

function getCarrinho() {
    const dados = localStorage.getItem(CART_KEY)
    return dados ? JSON.parse(dados) : []
}

function salvarCarrinho(itens) {
    localStorage.setItem(CART_KEY, JSON.stringify(itens))
    atualizarContadorCarrinho()
}

function adicionarAoCarrinho(servico) {
    const itens = getCarrinho()
    const existente = itens.find(i => i.idServico === servico.codServico)

    if (existente) {
        existente.quantidade += 1
    } else {
        itens.push({
            idServico: servico.codServico,
            nome: servico.nome,
            preco: Number(servico.preco),
            quantidade: 1,
            capacidadeDisponivel: servico.capacidadeDisponivel
        })
    }

    salvarCarrinho(itens)
}

function alterarQuantidade(idServico, delta) {
    const itens = getCarrinho()
    const item = itens.find(i => i.idServico === idServico)
    if (!item) return

    item.quantidade += delta

    if (item.quantidade <= 0) {
        return removerDoCarrinho(idServico)
    }

    salvarCarrinho(itens)
}

function removerDoCarrinho(idServico) {
    const itens = getCarrinho().filter(i => i.idServico !== idServico)
    salvarCarrinho(itens)
}

function limparCarrinho() {
    localStorage.removeItem(CART_KEY)
    atualizarContadorCarrinho()
}

function totalCarrinho() {
    return getCarrinho().reduce((total, item) => total + item.preco * item.quantidade, 0)
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Atualiza o badge de quantidade no ícone do carrinho no header (se existir na página)
function atualizarContadorCarrinho() {
    const contador = document.getElementById('nav-carrinho-count')
    if (!contador) return

    const total = getCarrinho().reduce((soma, item) => soma + item.quantidade, 0)
    contador.textContent = total
    contador.style.display = total > 0 ? 'inline-flex' : 'none'
}

document.addEventListener('DOMContentLoaded', atualizarContadorCarrinho)
