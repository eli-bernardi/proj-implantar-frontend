<div align="center">

# Del Company — Frontend

**Assessoria Especializada em Licitações**

Site institucional e catálogo de serviços de uma plataforma de consultoria em licitações públicas, com dados reais de licitações do Município de Tijucas/SC.

[![Deploy](https://img.shields.io/badge/deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://proj-implantar-frontend.vercel.app)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

[Ver site online](https://proj-implantar-frontend.vercel.app) · [Reportar problema](https://github.com/eli-bernardi/proj-implantar-frontend/issues)

</div>

---

## Sobre o projeto

A **Del Company** é uma plataforma de assessoria em licitações públicas. Este repositório contém o **frontend** do projeto: um site multipágina em HTML, CSS e JavaScript puro que apresenta a empresa, seus serviços e o processo de contratação, e se comunica com uma API REST para autenticação, catálogo e pedidos.

O fluxo do cliente é simples: conhecer a empresa, escolher serviços no catálogo, adicioná-los ao carrinho e finalizar a solicitação. Depois disso, a equipe entra em contato para iniciar o processo.

O catálogo também integra uma **API própria de licitações**, alimentada com dados reais extraídos do Portal da Transparência de Tijucas, para que o cliente acompanhe processos licitatórios dentro da própria plataforma.

## Funcionalidades

- **Página inicial institucional** com apresentação, soluções, etapas do processo ("Como Funciona"), diferenciais e perguntas frequentes
- **Catálogo de serviços** com busca e filtro por categoria
- **Planos Free, Pro e Max** no catálogo, com tabela de preços por ciclo (mensal, trimestral e anual) e contratação em `html/assinatura.html`
- **Pesquisa de licitações** em `html/licitacoes.html`, liberada conforme o plano contratado (Free: 20 consultas/mês, sem filtros avançados nem classificação por ramo)
- **Licitações reais de Tijucas/SC** via API externa, na página de pesquisa
- **Carrinho de serviços** com estado gerenciado no cliente (`cart-store.js`)
- **Login e autenticação** com JWT, integrados ao backend
- **Página de contato** com envio de mensagem por e-mail e atalho para WhatsApp
- **Páginas legais:** Termos de Uso e Privacidade & LGPD
- **Layout responsivo** com identidade visual própria (paleta preto, vermelho e cinza; tipografia Cormorant Garamond + Plus Jakarta Sans)

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Marcação | HTML5 |
| Estilo | CSS3 + Tailwind CSS (via CDN) com paleta personalizada |
| Lógica | JavaScript (ES6+), sem frameworks |
| Fontes | Google Fonts: Cormorant Garamond e Plus Jakarta Sans |
| Hospedagem | Vercel |
| Backend (repositório separado) | Node.js, Express, Sequelize, MySQL, JWT, hospedado no Railway |

## Estrutura do repositório

```
proj-implantar-frontend/
├── index.html                    # Página inicial
├── gerar-licitacoes-tijucas.js   # Script de geração dos dados de licitações de Tijucas
├── html/
│   ├── catalog.html              # Catálogo de serviços e planos
│   ├── assinatura.html           # Contratação e pagamento do plano
│   ├── licitacoes.html           # Pesquisa de licitações (exige plano)
│   ├── cart.html                 # Carrinho de serviços
│   ├── login.html                # Autenticação
│   ├── contato.html              # Formulário de contato
│   ├── termos.html               # Termos de Uso
│   └── privacidade.html          # Privacidade & LGPD
├── css/                          # Estilos personalizados
├── js/
│   ├── config.js                 # Configurações globais (ex.: URLs das APIs)
│   ├── api.js                    # Camada de comunicação com as APIs
│   ├── auth.js                   # Login, sessão e token JWT
│   ├── cart-store.js             # Estado do carrinho
│   ├── home.js                   # Comportamento da página inicial
│   └── catalog.js                # Catálogo, busca e filtros
└── img/                          # Imagens e recursos visuais
```

## Como executar localmente

Por ser um projeto estático, não há etapa de build nem dependências para instalar.

**1. Clone o repositório**

```bash
git clone https://github.com/eli-bernardi/proj-implantar-frontend.git
cd proj-implantar-frontend
```

**2. Sirva os arquivos com um servidor local**

Qualquer servidor estático funciona. Por exemplo:

```bash
# Com Node.js
npx serve .

# Com Python
python -m http.server 5500
```

Também é possível usar a extensão **Live Server** do VS Code, clicando com o botão direito em `index.html` e escolhendo *Open with Live Server*.

**3. Acesse no navegador**

```
http://localhost:5500
```

> Evite abrir os arquivos diretamente por `file://`. Requisições às APIs e caminhos relativos funcionam melhor com um servidor local.

## Configuração das APIs

O frontend consome duas APIs, configuradas em `js/config.js`:

| API | Finalidade |
| --- | --- |
| **API Del Company** (backend) | Autenticação, serviços, categorias, pedidos e entregas |
| **API de Licitações de Tijucas** | Licitações reais com paginação, filtros por situação, unidade gestora e ano, e busca textual |

Para apontar o frontend para outro ambiente (por exemplo, um backend rodando localmente), altere as URLs base em `js/config.js`.

## Arquitetura

```
┌──────────────────────┐        ┌───────────────────────────┐
│  Frontend (Vercel)   │ ─────▶ │  API Del Company          │
│  HTML + CSS + JS     │        │  Node · Express · MySQL   │
│                      │        └───────────────────────────┘
│                      │        ┌───────────────────────────┐
│                      │ ─────▶ │  API de Licitações        │
└──────────────────────┘        │  Dados do Portal da       │
                                │  Transparência de Tijucas │
                                └───────────────────────────┘
```

## Deploy

O frontend é publicado na **Vercel**, direto da branch `main`. Cada push na `main` gera um novo deploy automaticamente.

🔗 **Produção:** [proj-implantar-frontend.vercel.app](https://proj-implantar-frontend.vercel.app)

## Roadmap

- [x] Página inicial institucional
- [x] Catálogo de serviços com integração à API de licitações
- [x] Carrinho de serviços
- [x] Login integrado ao backend
- [x] Página de contato
- [x] Termos de Uso e Privacidade & LGPD
- [ ] Página de cadastro (validação de CPF e preenchimento de endereço via ViaCEP)
- [ ] Recuperação de senha
- [ ] Favoritos de licitações (funcionalidade adicional, separada do carrinho)
- [ ] Tradução dos textos de interface para uso 100% em português

## Autor

**Eli Bernardi**

Projeto desenvolvido durante o curso Técnico em Desenvolvimento de Sistemas, no SESI/SENAI Digital Studios.

[![GitHub](https://img.shields.io/badge/GitHub-eli--bernardi-181717?style=flat-square&logo=github)](https://github.com/eli-bernardi)

---

<div align="center">

**Del Company** © 2026. Todos os direitos reservados.

</div>
