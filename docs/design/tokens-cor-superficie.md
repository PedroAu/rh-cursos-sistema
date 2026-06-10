# Tokens de Cor e Superfície — Camada Semântica (Story 1.2)

> Gerado por `node scripts/contrast-matrix.mjs` a partir dos valores reais de
> `src/styles/globals.css`. Regere após qualquer mudança de token.

## Arquitetura em duas camadas

| Camada | Onde | Papel |
|--------|------|-------|
| **Paleta** | `--ea-color-*` (valores hex) | Cores brutas da marca/Material |
| **Semântica** | `--ea-color-label`, `--ea-color-surface-raised`, … | Papel funcional; referencia a paleta via `var()` |

Dark mode futuro (decisão D4): redefinir **apenas** o bloco semântico
(ex.: `[data-theme="dark"]`), sem tocar em paleta ou componentes.

## Tokens semânticos

| Token | Classe Tailwind | Uso |
|-------|----------------|-----|
| `label` | `text-label-primary` | Texto principal |
| `secondary-label` | `text-label-secondary` | Texto de apoio, metadata, captions |
| `separator` | `border-separator` | Divisores e bordas sutis |
| `surface` | `bg-surface` | Fundo base da página |
| `surface-raised` | `bg-surface-raised` | Cards e painéis elevados |
| `control` | `bg-control` | Chips, inputs, controles segmentados |
| `accent` | `text-accent` / `bg-accent` | Ação e destaque institucional (dourado) |
| `success` | `text-success` / `bg-success` | Estados positivos |
| `warning` | `text-warning` / `bg-warning` | Alertas (textual/interativo) |
| `danger` | `text-danger` / `bg-danger` | Erros e ações destrutivas |

> **Nota de nomenclatura:** a cor `label` é exposta como `label-primary`/
> `label-secondary` porque `text-label` já é um utilitário de **fontSize**
> (`--ea-font-size-label`) — expor a cor com o mesmo nome colidiria a classe.

## Matriz de contraste — texto sobre superfícies claras

AA texto normal: ≥ 4.5:1 · AA texto grande (≥18pt/14pt bold): ≥ 3:1

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
| `label` #1d1d1f | `surface` #f5f5f7 | 15.46 | ✅ | ✅ |
| `label` #1d1d1f | `surface-raised` #ffffff | 16.83 | ✅ | ✅ |
| `label` #1d1d1f | `control` #e9e9ec | 13.89 | ✅ | ✅ |
| `secondary-label` #515154 | `surface` #f5f5f7 | 7.26 | ✅ | ✅ |
| `secondary-label` #515154 | `surface-raised` #ffffff | 7.91 | ✅ | ✅ |
| `secondary-label` #515154 | `control` #e9e9ec | 6.53 | ✅ | ✅ |
| `accent` #8a6200 | `surface` #f5f5f7 | 5.04 | ✅ | ✅ |
| `accent` #8a6200 | `surface-raised` #ffffff | 5.49 | ✅ | ✅ |
| `accent` #8a6200 | `control` #e9e9ec | 4.53 | ✅ | ✅ |
| `success` #007a36 | `surface` #f5f5f7 | 5.03 | ✅ | ✅ |
| `success` #007a36 | `surface-raised` #ffffff | 5.47 | ✅ | ✅ |
| `success` #007a36 | `control` #e9e9ec | 4.52 | ✅ | ✅ |
| `warning` #7a5600 | `surface` #f5f5f7 | 6.11 | ✅ | ✅ |
| `warning` #7a5600 | `surface-raised` #ffffff | 6.65 | ✅ | ✅ |
| `warning` #7a5600 | `control` #e9e9ec | 5.49 | ✅ | ✅ |
| `danger` #ba1a1a | `surface` #f5f5f7 | 5.93 | ✅ | ✅ |
| `danger` #ba1a1a | `surface-raised` #ffffff | 6.46 | ✅ | ✅ |
| `danger` #ba1a1a | `control` #e9e9ec | 5.33 | ✅ | ✅ |
| `primary` #002b5b | `surface` #f5f5f7 | 12.89 | ✅ | ✅ |
| `primary` #002b5b | `surface-raised` #ffffff | 14.03 | ✅ | ✅ |
| `primary` #002b5b | `control` #e9e9ec | 11.58 | ✅ | ✅ |

## Matriz de contraste — branco sobre fundos escuros/saturados

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
| branco #ffffff | `primary` #002b5b | 14.03 | ✅ | ✅ |
| branco #ffffff | `deep-navy` #001736 | 17.86 | ✅ | ✅ |
| branco #ffffff | `accent` #8a6200 | 5.49 | ✅ | ✅ |
| branco #ffffff | `success` #007a36 | 5.47 | ✅ | ✅ |
| branco #ffffff | `warning` #7a5600 | 6.65 | ✅ | ✅ |
| branco #ffffff | `danger` #ba1a1a | 6.46 | ✅ | ✅ |

## Ajustes de valor aplicados nesta story (auditoria AA)

| Token | Antes | Depois | Motivo |
|-------|-------|--------|--------|
| `success` (`--ea-color-success-green`) | #008a3d | #007a36 | Branco sobre success era 4.47:1 (reprovava AA normal em `bg-success text-white` do Button) |
| `warning` | #d6aa45 (`secondary-fixed-dim`) | #7a5600 | Branco sobre warning era 1.94:1 (`hover:bg-warning text-white` nos Buttons); novo valor também funciona como texto sobre superfícies claras |

## Observações da auditoria

- `--ea-color-on-primary-container` (#6f8fca) tem 4.25:1 sobre `primary` —
  reprovaria como texto normal, mas **não é usado como texto** em nenhum
  componente (verificado). Reservado; se for usado, apenas em texto grande.
- `--ea-color-secondary-fixed-dim` (#d6aa45) permanece na paleta para usos
  decorativos/fundos com texto escuro; deixou de ser o valor de `warning`.
- As 70 "violações" do baseline da Story 1.1 eram artefato de medição
  (axe capturando animações de entrada do framer-motion em /cursos);
  corrigido via `MotionProvider` + emulação de reduced motion no spec.

**Resultado: todas as combinações auditadas passam WCAG AA para texto normal.** ✅
