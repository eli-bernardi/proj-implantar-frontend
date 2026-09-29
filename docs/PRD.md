# PRD — Del Company

> Documento de requisitos do produto. Descreve o sistema como um todo (frontend + backend), mesmo estando em repositórios separados: `proj-implantar-frontend` e `proj_implantar`.

## 1. Visão do produto

A Del Company é uma plataforma de assessoria especializada em licitações públicas. Ela conecta empresas que querem participar de processos licitatórios a um conjunto de serviços de apoio técnico (análise de edital, auditoria documental, acompanhamento de sessão pública, elaboração de recursos), comercializados através de um catálogo com carrinho e checkout — e complementa isso com uma vitrine de licitações reais e ativas do Município de Tijucas/SC, extraídas do Portal da Transparência.

## 2. Problema que resolve

Empresas (principalmente pequenas e médias) que querem disputar licitações públicas enfrentam duas barreiras:
1. Dificuldade em acompanhar quais licitações estão abertas e são relevantes para o seu ramo.
2. Falta de conhecimento técnico/documental para participar sem errar em prazos, documentos ou requisitos de habilitação.

## 3. Personas

- **Cliente (CLIENTE)** — dono ou responsável de empresa que quer contratar assessoria para participar de uma licitação específica.
- **Administrador (ADMIN)** — responsável pela Del Company que gerencia o catálogo de serviços, categorias, estoque/capacidade de atendimento e acompanha os pedidos em andamento.

## 4. Escopo funcional atual

### Público (sem login)
- Home institucional com apresentação da empresa, "Como Funciona", diferenciais e FAQ
- Catálogo de serviços (busca e filtro por categoria)
- Vitrine de licitações reais de Tijucas/SC (busca, filtro por situação, favoritar)
- Formulário de contato

### Cliente autenticado
- Cadastro e login
- Favoritar licitações (armazenado localmente, no navegador)
- Carrinho de serviços
- Checkout — abertura de um "processo" vinculando os serviços contratados aos dados da licitação (órgão, objeto, modalidade, datas)
- Histórico de pedidos ("Meus Processos") com status

### Administrador
- CRUD de categorias e serviços
- Consulta de estoque/capacidade
- Consulta de usuários e pedidos

## 5. Fora de escopo (por enquanto)

- Pagamento on-line integrado (checkout hoje só registra o pedido, não processa pagamento)
- Dados de licitação de cidades além de Tijucas/SC
- Recuperação de senha funcional (link existe, mas ainda não tem fluxo)
- Notificações por e-mail/WhatsApp sobre andamento do processo

## 6. Métricas de sucesso (a definir)

Ainda não há métricas de negócio formalizadas. Candidatos naturais: número de contas criadas, número de processos abertos, taxa de conversão catálogo → checkout.
