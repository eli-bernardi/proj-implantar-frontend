const API_BASE_URL = 'https://projimplantar-production-80b5.up.railway.app'

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contato-form')
    if (!form) return

    const alertBox = document.getElementById('form-alert')
    const btnEnviar = document.getElementById('btn-enviar')
    const textoOriginalBotao = btnEnviar.textContent

    const campos = {
        nome: document.getElementById('nome'),
        email: document.getElementById('email'),
        telefone: document.getElementById('telefone'),
        assunto: document.getElementById('assunto'),
        mensagem: document.getElementById('mensagem'),
        privacidade: document.getElementById('privacidade')
    }

    const erros = {
        nome: document.getElementById('nome-error'),
        email: document.getElementById('email-error'),
        telefone: document.getElementById('telefone-error'),
        assunto: document.getElementById('assunto-error'),
        mensagem: document.getElementById('mensagem-error')
    }

    const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    function limparErros() {
        Object.values(erros).forEach(el => el && (el.style.display = 'none'))
        Object.values(campos).forEach(el => el && el.classList.remove('input-invalido'))
    }

    function mostrarErro(campo, elementoErro) {
        if (elementoErro) elementoErro.style.display = 'block'
        if (campo) campo.classList.add('input-invalido')
    }

    function esconderAlerta() {
        alertBox.style.display = 'none'
    }

    function mostrarAlerta(mensagem, tipo) {
        alertBox.textContent = mensagem
        alertBox.classList.toggle('form-alert-sucesso', tipo === 'sucesso')
        alertBox.style.display = 'block'
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    function validar() {
        limparErros()
        let valido = true

        if (!campos.nome.value.trim()) {
            mostrarErro(campos.nome, erros.nome)
            valido = false
        }

        if (!REGEX_EMAIL.test(campos.email.value.trim())) {
            mostrarErro(campos.email, erros.email)
            valido = false
        }

        if (!campos.assunto.value) {
            mostrarErro(campos.assunto, erros.assunto)
            valido = false
        }

        if (!campos.mensagem.value.trim()) {
            mostrarErro(campos.mensagem, erros.mensagem)
            valido = false
        }

        if (!campos.privacidade.checked) {
            valido = false
            mostrarAlerta('Você precisa aceitar a Política de Privacidade para continuar.', 'erro')
        }

        return valido
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        esconderAlerta()

        if (!validar()) return

        const dados = {
            nome: campos.nome.value.trim(),
            empresa: document.getElementById('empresa').value.trim(),
            email: campos.email.value.trim(),
            telefone: campos.telefone.value.trim(),
            assunto: campos.assunto.value,
            mensagem: campos.mensagem.value.trim()
        }

        btnEnviar.disabled = true
        btnEnviar.textContent = 'Enviando...'

        try {
            const resposta = await fetch(`${API_BASE_URL}/contato`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            })

            const resultado = await resposta.json()

            if (!resposta.ok) {
                throw new Error(resultado.message || 'Erro ao enviar mensagem')
            }

            mostrarAlerta('Mensagem enviada com sucesso! Em breve entraremos em contato.', 'sucesso')
            form.reset()
        } catch (err) {
            console.log('Erro ao enviar formulário de contato!', err)
            mostrarAlerta(err.message || 'Não foi possível enviar sua mensagem. Tente novamente em instantes.', 'erro')
        } finally {
            btnEnviar.disabled = false
            btnEnviar.textContent = textoOriginalBotao
        }
    })
})
