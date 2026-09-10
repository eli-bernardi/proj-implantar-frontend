// Wrapper simples sobre fetch para conversar com o backend da Del.
// Usa o token JWT salvo pelo auth.js automaticamente quando existir.
async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' }

    if (auth) {
        const token = localStorage.getItem('del_token')
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    let resposta
    try {
        resposta = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        })
    } catch (err) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.')
    }

    let dados = null
    try {
        dados = await resposta.json()
    } catch (err) {
        // resposta sem corpo JSON
    }

    if (resposta.status === 401) {
        localStorage.removeItem('del_token')
        localStorage.removeItem('del_usuario')
    }

    if (!resposta.ok) {
        const mensagem = (dados && dados.message) || 'Ocorreu um erro ao processar sua solicitação.'
        throw new Error(mensagem)
    }

    return dados
}
