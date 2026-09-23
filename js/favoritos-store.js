// Favoritos de licitações usando LocalStorage — mesmo padrão do carrinho,
// funciona sem precisar de login.

const FAVORITOS_KEY = 'del_favoritos_licitacoes'

function getFavoritos() {
    const dados = localStorage.getItem(FAVORITOS_KEY)
    return dados ? JSON.parse(dados) : []
}

function salvarFavoritos(itens) {
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(itens))
}

function ehFavorito(chave) {
    return getFavoritos().some(f => f.chave === chave)
}

function alternarFavorito(chave, dados) {
    const itens = getFavoritos()
    const existente = itens.findIndex(f => f.chave === chave)

    if (existente >= 0) {
        itens.splice(existente, 1)
        salvarFavoritos(itens)
        return false // não é mais favorito
    }

    itens.push({ chave, ...dados })
    salvarFavoritos(itens)
    return true // virou favorito
}