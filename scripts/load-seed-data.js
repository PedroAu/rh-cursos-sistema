#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

async function loadSeedData() {
  console.log('🌱 Loading seed data into Supabase...\n');

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      db: {
        schema: 'public'
      }
    });

    // First, let's just test connectivity
    const { data: testData, error: testError } = await supabase
      .rpc('ping');

    if (testError) {
      console.log('RPC not available, will use REST API directly...\n');
    }

    // Use raw SQL via rpc call - we'll build our own SQL function
    const sqlScript = `
BEGIN;

INSERT INTO public.trilha (id, codigo, nome, nome_curto, slug, descricao, icone, ordem, ativa)
VALUES
  ('path-dp', 'T01', 'Departamento Pessoal, Folha de Pagamento & eSocial', 'DP, Folha & eSocial', 'departamento-pessoal-folha-de-pagamento-esocial', 'Capacitação completa do DP público, da legislação trabalhista à conformidade digital com eSocial, FGTS Digital e LGPD.', 'Calculator', 1, true),
  ('path-licitacoes', 'T02', 'Licitações, Compras Públicas & Contratos Administrativos', 'Licitações & Contratos', 'licitacoes-compras-publicas-contratos-administrativos', 'Da legislação básica à fiscalização avançada de contratos, com cobertura da Lei nº 14.133/2021 e melhores práticas de contratação pública.', 'Scale', 2, true),
  ('path-pessoas', 'T03', 'Gestão de Pessoas, Liderança & Desenvolvimento Humano', 'Pessoas & Liderança', 'gestao-de-pessoas-lideranca-desenvolvimento-humano', 'Formação humanizada para líderes e equipes, com inteligência emocional, cultura organizacional, saúde mental e gestão por resultados.', 'Users', 3, true),
  ('path-comunicacao', 'T04', 'Comunicação Institucional, Redação & Atendimento ao Cidadão', 'Comunicação & Atendimento', 'comunicacao-institucional-redacao-atendimento-ao-cidadao', 'Comunicação clara e eficiente, do atendimento ao cidadão à redação oficial, oratória, mídias digitais e conformidade com LAI/LGPD.', 'MessageSquareText', 4, true),
  ('path-auditoria', 'T05', 'Auditoria, Contabilidade Pública & Gestão Tributária', 'Auditoria & Tributária', 'auditoria-contabilidade-publica-gestao-tributaria', 'Domínio técnico em contabilidade pública, obrigações acessórias, Tesouro Gerencial, SIAFI e auditoria governamental.', 'ClipboardCheck', 5, true),
  ('path-tech', 'T06', 'Tecnologia, Dados, Processos & Inovação', 'Tecnologia & Inovação', 'tecnologia-dados-processos-inovacao', 'Ferramentas digitais, análise de dados, modelagem de processos, inteligência artificial e governança para transformação digital.', 'BarChart3', 6, true)
ON CONFLICT (id) DO UPDATE SET
  codigo = excluded.codigo,
  nome = excluded.nome,
  nome_curto = excluded.nome_curto,
  slug = excluded.slug,
  descricao = excluded.descricao,
  icone = excluded.icone,
  ordem = excluded.ordem,
  ativa = excluded.ativa;

COMMIT;
    `;

    console.log('📝 Sending raw SQL to Supabase...');

    // Try using the SQL function if it exists
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({ query: sqlScript }),
    });

    if (!response.ok) {
      console.log('⚠️  Direct RPC query not available. Using table-by-table insert instead...\n');

      // Fallback: Insert data table by table
      console.log('📚 Loading Trilhas...');
      const trilhas = [
        { id: 'path-dp', codigo: 'T01', nome: 'Departamento Pessoal, Folha de Pagamento & eSocial', nome_curto: 'DP, Folha & eSocial', slug: 'departamento-pessoal-folha-de-pagamento-esocial', descricao: 'Capacitação completa do DP público', icone: 'Calculator', ordem: 1, ativa: true },
        { id: 'path-licitacoes', codigo: 'T02', nome: 'Licitações, Compras Públicas & Contratos Administrativos', nome_curto: 'Licitações & Contratos', slug: 'licitacoes-compras-publicas-contratos-administrativos', descricao: 'Da legislação básica à fiscalização avançada', icone: 'Scale', ordem: 2, ativa: true },
      ];

      for (const trilha of trilhas) {
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/trilha`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(trilha),
        });

        if (!insertResponse.ok) {
          const errorText = await insertResponse.text();
          console.log(`  ⚠️  ${trilha.nome}: ${errorText.substring(0, 100)}`);
        } else {
          console.log(`  ✅ ${trilha.nome}`);
        }
      }
    } else {
      console.log('✅ SQL script executed successfully');
    }

    console.log('\n✨ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

loadSeedData();
