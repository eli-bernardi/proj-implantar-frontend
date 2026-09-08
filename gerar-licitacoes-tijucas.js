/**
 * gerar-licitacoes-tijucas.js
 *
 * Consulta a API pública do PNCP (Portal Nacional de Contratações Públicas)
 * filtrando pelas licitações da Prefeitura Municipal de Tijucas/SC e gera
 * um arquivo licitacoes-tijucas.json — que pode ser servido no seu site
 * como se fosse uma API externa (ex: /public/licitacoes-tijucas.json,
 * ou lido pelo backend e reexposto em uma rota tipo GET /api/licitacoes-externas).
 *
 * Por que PNCP e não o portal tijucas.atende.net?
 * O portal da Prefeitura é uma SPA: os dados só aparecem via chamadas de
 * JavaScript que o navegador faz depois de carregar a página, então não dá
 * pra "raspar" o HTML diretamente. O PNCP é a fonte oficial e obrigatória
 * (Lei 14.133/2021) para onde toda licitação municipal é publicada, com uma
 * API REST pública, sem autenticação — mais estável que depender do widget
 * interno de terceiros que a Prefeitura usa.
 *
 * Uso:
 *   node gerar-licitacoes-tijucas.js
 *   node gerar-licitacoes-tijucas.js --dias 180
 *
 * Requer Node 18+ (fetch nativo). Sem dependências externas.
 */

const fs = require('fs');
const path = require('path');

// CNPJ da Prefeitura Municipal de Tijucas/SC
const CNPJ_TIJUCAS = '82577636000165';
// Código IBGE do município de Tijucas/SC
const CODIGO_IBGE_TIJUCAS = '4218004';

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao';

// Tabela de domínio "Modalidade de Contratação" do PNCP.
// O parâmetro é obrigatório por consulta, então percorremos todas.
const MODALIDADES = [
  { codigo: 1, nome: 'Leilão - Eletrônico' },
  { codigo: 2, nome: 'Diálogo Competitivo' },
  { codigo: 3, nome: 'Concurso' },
  { codigo: 4, nome: 'Concorrência - Eletrônica' },
  { codigo: 5, nome: 'Concorrência - Presencial' },
  { codigo: 6, nome: 'Pregão - Eletrônico' },
  { codigo: 7, nome: 'Pregão - Presencial' },
  { codigo: 8, nome: 'Dispensa de Licitação' },
  { codigo: 9, nome: 'Inexigibilidade' },
  { codigo: 10, nome: 'Manifestação de Interesse' },
  { codigo: 11, nome: 'Pré-qualificação' },
  { codigo: 12, nome: 'Credenciamento' },
  { codigo: 13, nome: 'Leilão - Presencial' },
];

function formatarDataAAAAMMDD(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}${mes}${dia}`;
}

function lerArgumentoDias() {
  const idx = process.argv.indexOf('--dias');
  if (idx !== -1 && process.argv[idx + 1]) {
    const valor = parseInt(process.argv[idx + 1], 10);
    if (!Number.isNaN(valor) && valor > 0) return valor;
  }
  return 365; // padrão: último ano
}

async function buscarPaginaModalidade(modalidade, dataInicial, dataFinal, pagina) {
  const params = new URLSearchParams({
    dataInicial,
    dataFinal,
    codigoModalidadeContratacao: String(modalidade.codigo),
    codigoMunicipioIbge: CODIGO_IBGE_TIJUCAS,
    cnpj: CNPJ_TIJUCAS,
    pagina: String(pagina),
    tamanhoPagina: '50',
  });

  const url = `${BASE_URL}?${params.toString()}`;
  const resposta = await fetch(url, { headers: { accept: '*/*' } });

  if (resposta.status === 204) {
    // Sem conteúdo para essa combinação de filtros — não é erro
    return { dados: [], totalPaginas: 0 };
  }

  if (!resposta.ok) {
    throw new Error(`PNCP retornou ${resposta.status} para modalidade ${modalidade.codigo}, página ${pagina}`);
  }

  const json = await resposta.json();
  return {
    dados: json.data || [],
    totalPaginas: json.totalPaginas || 1,
  };
}

function mapearContratacao(item) {
  return {
    numeroControlePNCP: item.numeroControlePNCP,
    objeto: item.objetoCompra,
    modalidade: item.modalidadeNome,
    situacao: item.situacaoCompraNome,
    valorTotalEstimado: item.valorTotalEstimado ?? null,
    dataPublicacao: item.dataPublicacaoPncp ?? null,
    dataAberturaProposta: item.dataAberturaProposta ?? null,
    dataEncerramentoProposta: item.dataEncerramentoProposta ?? null,
    orgao: item.orgaoEntidade?.razaoSocial ?? null,
    unidade: item.unidadeOrgao?.nomeUnidade ?? null,
    linkSistemaOrigem: item.linkSistemaOrigem ?? null,
  };
}

async function main() {
  const dias = lerArgumentoDias();
  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - dias);

  const dataInicial = formatarDataAAAAMMDD(inicio);
  const dataFinal = formatarDataAAAAMMDD(hoje);

  console.log(`Consultando PNCP para Tijucas/SC de ${dataInicial} até ${dataFinal}...`);

  const todasContratacoes = [];

  for (const modalidade of MODALIDADES) {
    let pagina = 1;
    let totalPaginas = 1;

    do {
      try {
        const { dados, totalPaginas: total } = await buscarPaginaModalidade(
          modalidade,
          dataInicial,
          dataFinal,
          pagina
        );
        totalPaginas = total;

        if (dados.length > 0) {
          console.log(`  ${modalidade.nome}: página ${pagina}/${totalPaginas} — ${dados.length} registro(s)`);
          todasContratacoes.push(...dados.map(mapearContratacao));
        }
      } catch (erro) {
        console.error(`  Erro em "${modalidade.nome}" (página ${pagina}): ${erro.message}`);
        break;
      }

      pagina += 1;
      // pequena pausa para não sobrecarregar a API pública
      await new Promise((r) => setTimeout(r, 300));
    } while (pagina <= totalPaginas);
  }

  // ordena as mais recentes primeiro
  todasContratacoes.sort((a, b) => {
    const dataA = a.dataPublicacao ? new Date(a.dataPublicacao).getTime() : 0;
    const dataB = b.dataPublicacao ? new Date(b.dataPublicacao).getTime() : 0;
    return dataB - dataA;
  });

  const saida = {
    fonte: 'PNCP - Portal Nacional de Contratações Públicas',
    orgao: 'Prefeitura Municipal de Tijucas/SC',
    cnpj: '82.577.636/0001-65',
    geradoEm: new Date().toISOString(),
    periodoConsultado: { dataInicial, dataFinal },
    totalRegistros: todasContratacoes.length,
    licitacoes: todasContratacoes,
  };

  const caminhoSaida = path.join(__dirname, 'licitacoes-tijucas.json');
  fs.writeFileSync(caminhoSaida, JSON.stringify(saida, null, 2), 'utf-8');

  console.log(`\nPronto! ${todasContratacoes.length} licitação(ões) salva(s) em ${caminhoSaida}`);
}

main().catch((erro) => {
  console.error('Erro fatal:', erro);
  process.exit(1);
});
