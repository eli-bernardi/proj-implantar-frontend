# ARCHITECTURE — Del Company

> Descreve a arquitetura técnica do sistema como um todo. O sistema vive em repositórios e serviços separados — este documento é o mapa que amarra as peças.

## 1. Visão geral dos repositórios

| Repositório | Conteúdo | Hospedagem |
|---|---|---|
| `proj-implantar-frontend` | HTML/CSS/JS estático (sem framework, sem build step) | Vercel |
| `proj_implantar` | API REST em Node.js/Express | Railway |
| `api-licitacoes` | API REST separada, serve dados reais de licitações de Tijucas/SC extraídos do Portal da Transparência | Railway (projeto próprio, com seu próprio MySQL) |

O frontend consome as duas APIs de backend de forma independente — elas não se conhecem entre si.

## 2. Stack técnica

**Frontend:** HTML + CSS puro (sem Tailwind, sem framework) + JavaScript puro (sem bundler). Ícones via Lucide (CDN). Fontes via Google Fonts.

**Backend (`proj_implantar`):** Node.js, Express, Sequelize (ORM) sobre MySQL. Autenticação via token criptografado com `crypto-js` (AES) — não usa JWT nem bcrypt, por escolha deliberada de seguir o padrão de código de referência do professor.

**Backend (`api-licitacoes`):** Node.js, Express, MySQL, dados alimentados por um coletor que lê exportações do Portal da Transparência de Tijucas.

**Banco de dados:** MySQL gerenciado pelo Railway — uma instância para `proj_implantar` (tabelas: `usuarios`, `categorias`, `servicos`, `estoques`, `pedidos`, `itens_pedido`, `entregas`) e outra, separada, para `api-licitacoes` (tabela `licitacoes`).

## 3. Autenticação

O login gera um token que é um JSON `{ codUsuario, nome, tipo, expiraEm }` criptografado com AES usando uma chave fixa (`CHAVE_SECRETA`, hardcoded no backend). O frontend guarda esse token no `localStorage` e o envia no header `Authorization` em requisições autenticadas. O middleware `autenticar` descriptografa o token, confere a expiração (3h) e popula `req.usuario`. Um segundo middleware, `somenteAdmin`, bloqueia rotas administrativas para quem não tem `tipo: 'ADMIN'`.

**Nota de segurança:** essa abordagem usa criptografia reversível (AES) em vez de hash irreversível (bcrypt) para armazenar a senha, e um token que qualquer pessoa com a `CHAVE_SECRETA` (que está no código-fonte) consegue forjar ou decifrar. Essa escolha foi feita para seguir o padrão de referência do professor, não por ser a prática mais segura — vale ter em mente antes de expor esse sistema além do contexto acadêmico.

## 4. Fluxo de dados principal (checkout)

1. Cliente adiciona serviços ao carrinho (guardado no `localStorage`, via `cart-store.js`)
2. No checkout, informa dados do processo licitatório (órgão, objeto, modalidade, datas)
3. `POST /pedidos` cria, numa transação, o registro em `pedidos`, os `itens_pedido` correspondentes e a `entrega` (dados do processo), além de deduzir a capacidade disponível em `estoques`
4. O pedido passa a aparecer em "Meus Processos" (`GET /pedidos/meus-pedidos`)

## 5. Integração com a API de licitações

O frontend (`licitacoes.js`, na página de catálogo) consome `api-licitacoes` diretamente via `fetch`, usando a constante `LICITACOES_API_URL` (definida em `config.js`). Não há autenticação nessa chamada — é pública. Os favoritos de licitação são guardados só no `localStorage` do navegador (`favoritos-store.js`), não no backend — ou seja, não sincronizam entre dispositivos.

## 6. Débito técnico conhecido

- Sem testes automatizados no frontend
- `LICITACOES_API_URL` e `API_BASE_URL` hardcoded em `config.js` — trocar de ambiente exige editar o arquivo e fazer novo deploy
- Endpoint `/api/situacoes` da API de licitações pode não estar implementado (a ser confirmado)
- Filtro de cidade na vitrine de licitações é só visual — hoje só existe dado de Tijucas/SC
