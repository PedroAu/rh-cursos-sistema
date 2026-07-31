# Épica 20 — Matriz de implementação do canvas Admin

Fonte recebida: `/Users/pedroaugusto/Downloads/Site RH Cursos/RH Cursos Admin Dashboard.dc.html`  
SHA-256: `59a6592a28cf5d9b2b3741b066948be969c106166ac2255b291a72ae84eb8971`

## Delta verificável

O arquivo recebido tem 1.515 linhas. O canvas versionado antes da Épica 20 tem 708 linhas. O diff contém 807 adições e 87 remoções.

| Elemento do canvas | Implementação alvo | Regra |
|---|---|---|
| `cursosPager`, `turmasPager`, `matriculasPager`, `alunosPager`, `instrutoresPager`, `leadsPager`, `postsPager`, `paginasPager` | `AdminResourcePage` + estado de página | Paginação local sobre a projeção já carregada até o read model ser consumido diretamente pela UI |
| `openModal.curso/turma/aluno/instrutor/matricula` | query `?action=create` ou abertura do mesmo Dialog existente | Reutilizar `buildResourceConfig`; não duplicar formulário |
| `*.open` | ação “Ver detalhes”/“Editar” com registro real | Nenhum detalhe pode usar placeholder não persistido |
| `*.remove` | confirmação acessível + `config.onDelete` | Não excluir sem confirmação |
| `has*Detail` | painel de detalhe genérico por recurso | Exibir colunas/domínio existentes; relações só quando já carregadas |
| `.adm-pager` | componente de paginação com 5/10/25 | Resetar página em busca/filtro e manter `aria-label` |
| `prefers-reduced-motion` | tokens/classes atuais + testes | Não importar o `styles.css` do canvas para produção |
| Logo e shell lateral (`.adm-side`, `.adm-item`) | Story 20.6: assets locais + `AdminSidebar`/drawer/bottom nav | Alinhar a shell à superfície clara e aos tokens do canvas; remover a paleta escura legada hardcoded |

## Gaps conhecidos do baseline

- O dashboard já implementa métricas, leads e turmas, mas “Novo curso” e “Nova turma” eram botões sem ação.
- `AdminResourcePage` já possui Dialog de CRUD e ações de editar/excluir, porém não tinha paginação, detalhe e confirmação centralizados.
- Read models paginados existem no backend, mas a tela genérica ainda trabalha sobre as coleções do `AppStore`.
- A navegação mobile foi corrigida na REC-306 e deve ser preservada.
