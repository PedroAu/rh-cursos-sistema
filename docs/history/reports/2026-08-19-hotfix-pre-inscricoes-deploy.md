# Evidência sanitizada — hotfix de pré-inscrições

## Escopo

Registro operacional agregado para o deploy da correção de hidratação das
pré-inscrições. Este documento não contém nome, e-mail, telefone, documento,
identificador individual ou qualquer outro dado pessoal.

## Evidência read-only anterior ao deploy

| Métrica | Valor |
|---|---:|
| Total de inscrições observadas | 3 |
| Inscrições com status `Pendente` | 3 |
| Registro agregado mais recente (`latestCreatedAt`) | `2026-08-18T16:53:00.088272+00:00` |

A evidência foi confirmada por consulta somente leitura antes desta etapa e é
registrada aqui exclusivamente em forma agregada. Nenhuma linha individual foi
copiada para o repositório e nenhuma escrita foi realizada no banco.

## Rastreabilidade do candidato

- Correção funcional de hidratação: `8ea1e82`.
- Hotfix do smoke com catálogo dinâmico: `85161c8`.
- Handoff documental aprovado: `dbf8c5f`.
- O SHA final de produção será o merge commit em `main` que contenha esses
  commits e este relatório; ele deve ser registrado junto ao run manual antes
  do `workflow_dispatch`.

## Ponto de rollback Cloudflare anterior ao deploy

- Deployment ID atual: `e50133ef-d168-4987-a9b6-c39d3f34deb5`.
- Version ID ativa: `fc2f8175-66cd-4736-b3de-9ed20218afe4`.
- Tráfego observado: 100% na versão ativa.
- Criado em: `2026-07-29T01:21:00.008889Z`.

Esses identificadores foram obtidos com `wrangler deployments list --json`.
Se a verificação pós-deploy falhar, o rollback deve usar o procedimento
versionado em `docs/DEPLOYMENT.md`, sem alteração de inscrições.

## Limites

- O smoke permanece público e read-only.
- Este relatório não autoriza bypass de CI, migrations, functions ou frontend.
- A comprovação administrativa após reload e os IDs do novo deployment serão
  registrados somente após evidência real do deploy.
