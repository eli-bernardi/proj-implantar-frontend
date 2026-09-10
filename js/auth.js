// Controle de sessão do cliente (token JWT + dados básicos do usuário)

function isSubdir() {
    const path = window.location.pathname.replace(/\\/g, '/');
    return path.includes('/html/') || path.endsWith('/html');
}

function getRelativePath(target) {
    const inHtml = isSubdir();
    const map = {
        'index': inHtml ? '../index.html' : './index.html',
        'catalog': inHtml ? './catalog.html' : './html/catalog.html',
        'cart': inHtml ? './cart.html' : './html/cart.html',
        'checkout': inHtml ? './checkout.html' : './html/checkout.html',
        'contato': inHtml ? './contato.html' : './html/contato.html',
        'login': inHtml ? './login.html' : './html/login.html',
        'register': inHtml ? './register.html' : './html/register.html',
        'orders': inHtml ? './orders.html' : './html/orders.html'
    };
    return map[target] || (inHtml ? `./${target}.html` : `./html/${target}.html`);
}

function salvarSessao(token, usuario) {
    localStorage.setItem('del_token', token);
    localStorage.setItem('del_usuario', JSON.stringify(usuario));
}

function getUsuarioLogado() {
    const dados = localStorage.getItem('del_usuario');
    return dados ? JSON.parse(dados) : null;
}

function estaLogado() {
    return !!localStorage.getItem('del_token');
}

function logout() {
    localStorage.removeItem('del_token');
    localStorage.removeItem('del_usuario');
    window.location.href = getRelativePath('login');
}

// Chame no topo de páginas privadas (checkout, perfil, pedidos, admin-*)
function exigirLogin() {
    if (!estaLogado()) {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        sessionStorage.setItem('del_redirect_after_login', isSubdir() ? `./${currentPath}` : `./html/${currentPath}`);
        window.location.href = getRelativePath('login');
    }
}

// Chame no topo de páginas exclusivas de admin
function exigirAdmin() {
    exigirLogin();
    const usuario = getUsuarioLogado();
    if (!usuario || usuario.tipo !== 'ADMIN') {
        window.location.href = getRelativePath('index');
    }
}

// Atualiza o botão de conta no header conforme o estado de login (chamar em todas as páginas)
function atualizarNavSessao() {
    const usuario = getUsuarioLogado();
    const linkConta = document.getElementById('nav-conta');

    if (linkConta) {
        if (usuario) {
            const primeiroNome = (usuario.nome || 'Minha Conta').split(' ')[0];
            linkConta.innerHTML = `<i data-lucide="user" class="w-3.5 h-3.5 stroke-[1.5]"></i> Olá, ${primeiroNome}`;
            linkConta.title = 'Ver meus pedidos e processos';
            linkConta.href = getRelativePath('orders');
            // Reinicializa ícones Lucide para o novo ícone
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            linkConta.innerHTML = `<i data-lucide="log-in" class="w-3.5 h-3.5 stroke-[1.5]"></i> Entrar`;
            linkConta.removeAttribute('title');
            linkConta.href = getRelativePath('login');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
}

document.addEventListener('DOMContentLoaded', atualizarNavSessao);