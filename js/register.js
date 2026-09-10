// Página: register.html

function mascaraCPF(valor) {
    return valor
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraCEP(valor) {
    return valor
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, '$1-$2');
}

function mostrarErroRegister(mensagem) {
    const alerta = document.getElementById('register-alert');
    if (!alerta) return;
    alerta.textContent = mensagem;
    alerta.classList.add('show');
}

function esconderErroRegister() {
    const alerta = document.getElementById('register-alert');
    if (!alerta) return;
    alerta.classList.remove('show');
}

// Consulta o ViaCEP diretamente do navegador para dar feedback imediato ao usuário
// (o backend também valida e busca o endereço de novo antes de salvar, por segurança)
async function autocompletarEndereco() {
    const cepInput = document.getElementById('cep');
    const status = document.getElementById('cep-status');
    if (!cepInput) return;
    const cepLimpo = cepInput.value.replace(/\D/g, '');

    if (cepLimpo.length !== 8) return;

    if (status) status.textContent = 'Buscando endereço...';

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            if (status) status.textContent = 'CEP não encontrado. Verifique e tente novamente.';
            return;
        }

        const rua = document.getElementById('rua');
        const bairro = document.getElementById('bairro');
        const cidade = document.getElementById('cidade');
        if (rua) rua.value = dados.logradouro || '';
        if (bairro) bairro.value = dados.bairro || '';
        if (cidade) cidade.value = dados.localidade || '';
        if (status) status.textContent = 'Endereço encontrado.';
    } catch (err) {
        if (status) status.textContent = 'Não foi possível buscar o CEP agora. O servidor validará no cadastro.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof estaLogado === 'function' && estaLogado()) {
        window.location.href = typeof getRelativePath === 'function' ? getRelativePath('index') : '../index.html';
        return;
    }

    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', () => {
            cpfInput.value = mascaraCPF(cpfInput.value);
        });
    }

    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', () => {
            cepInput.value = mascaraCEP(cepInput.value);
        });
        cepInput.addEventListener('blur', autocompletarEndereco);
    }

    const form = document.getElementById('form-register');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        esconderErroRegister();

        const botao = document.getElementById('btn-register');
        if (botao) {
            botao.disabled = true;
            botao.textContent = 'Criando conta...';
        }

        const corpo = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            senha: document.getElementById('senha').value,
            cpf: document.getElementById('cpf').value,
            cep: document.getElementById('cep').value
        };

        try {
            await apiRequest('/usuarios', { method: 'POST', body: corpo });

            // Loga automaticamente após o cadastro
            const resposta = await apiRequest('/login', {
                method: 'POST',
                body: { email: corpo.email, senha: corpo.senha }
            });
            salvarSessao(resposta.token, resposta.usuario);

            const redirecionarPara = sessionStorage.getItem('del_redirect_after_login');
            sessionStorage.removeItem('del_redirect_after_login');
            window.location.href = redirecionarPara || (typeof getRelativePath === 'function' ? getRelativePath('index') : '../index.html');
        } catch (err) {
            mostrarErroRegister(err.message || 'Erro ao realizar cadastro.');
            if (botao) {
                botao.disabled = false;
                botao.textContent = 'Criar conta';
            }
        }
    });
});
