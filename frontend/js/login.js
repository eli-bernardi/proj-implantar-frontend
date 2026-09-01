// Página: login.html

function mostrarErroLogin(mensagem) {
    const alerta = document.getElementById('login-alert');
    if (!alerta) return;
    alerta.textContent = mensagem;
    alerta.classList.add('show');
}

function esconderErroLogin() {
    const alerta = document.getElementById('login-alert');
    if (!alerta) return;
    alerta.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
    // Se já está logado, não faz sentido ficar na tela de login
    if (typeof estaLogado === 'function' && estaLogado()) {
        window.location.href = typeof getRelativePath === 'function' ? getRelativePath('index') : '../index.html';
        return;
    }

    // Toggle de visualização da senha
    const toggleSenhaBtn = document.getElementById('toggle-senha');
    const senhaInput = document.getElementById('senha');
    if (toggleSenhaBtn && senhaInput) {
        toggleSenhaBtn.addEventListener('click', () => {
            const isPassword = senhaInput.type === 'password';
            senhaInput.type = isPassword ? 'text' : 'password';
            toggleSenhaBtn.textContent = isPassword ? 'Ocultar' : 'Mostrar';
        });
    }

    const form = document.getElementById('form-login') || document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        esconderErroLogin();

        const emailInput = document.getElementById('email');
        const senhaInput = document.getElementById('senha');
        const email = emailInput ? emailInput.value.trim() : '';
        const senha = senhaInput ? senhaInput.value : '';
        const botao = document.getElementById('btn-login');

        if (!email || !senha) {
            mostrarErroLogin('Preencha seu e-mail e senha.');
            return;
        }

        if (botao) {
            botao.disabled = true;
            botao.textContent = 'Entrando...';
        }

        try {
            const resposta = await apiRequest('/login', { method: 'POST', body: { email, senha } });
            salvarSessao(resposta.token, resposta.usuario);

            // Volta pra página que o usuário estava tentando acessar, se houver
            const redirecionarPara = sessionStorage.getItem('del_redirect_after_login');
            sessionStorage.removeItem('del_redirect_after_login');
            window.location.href = redirecionarPara || (typeof getRelativePath === 'function' ? getRelativePath('index') : '../index.html');
        } catch (err) {
            mostrarErroLogin(err.message || 'E-mail ou senha inválidos.');
            if (botao) {
                botao.disabled = false;
                botao.textContent = 'Entrar';
            }
        }
    });
});
