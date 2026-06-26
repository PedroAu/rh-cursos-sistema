# Tokens de Cor e Superfície — Camada Semântica

> Gerado por `node scripts/contrast-matrix.mjs` a partir dos valores reais de
> `src/styles/globals.css`. Regere após qualquer mudança de token.

## Arquitetura em duas camadas

| Camada | Onde | Papel |
|--------|------|-------|
| **Paleta atual** | `--ea-color-*` (valores hex) | Cores brutas da marca/Material atual |
| **Paleta Executive Precision** | `--m3-*` (valores hex) | Fonte canônica do frontmatter de `docs/design/executive-precision/DESIGN.md` |
| **Semântica** | `--ea-color-label`, `--ea-color-surface-raised`, ... | Papel funcional; referencia uma paleta via `var()` |

O tema Executive Precision é ativado por rota/layout com
`data-theme="executive"` no contêiner que envolve a rota. Esta story apenas
declara o scope; nenhuma rota recebe o atributo aqui.

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

## Mapeamento semântico — Executive Precision

| Token semântico | Valor no scope `[data-theme="executive"]` | Papel |
|-----------------|---------------------------------------------|-------|
| `label` | `--m3-on-surface` #1a1c1e | Texto principal |
| `secondary-label` | `--m3-on-surface-variant` #41484e | Texto de apoio |
| `separator` | `--m3-outline-variant` #c0c7cf | Bordas sutis |
| `surface-raised` | `--m3-surface-container-lowest` #ffffff | Cards e painéis |
| `control` | `--m3-surface-container` #eeeef0 | Inputs, chips e controles |
| `accent` | `--m3-secondary` #795900 | Dourado textual/interativo |
| `success` | `--m3-success-text` #24732f | Estado positivo textual/filled AA |
| `warning` | `--m3-warning-text` #795900 | Alerta textual/filled AA |
| `danger` | `--m3-error` #ba1a1a | Erro/destrutivo |

## Matriz atual — texto sobre superfícies claras

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

## Matriz atual — branco sobre fundos preenchidos

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
| branco #ffffff | `primary` #002b5b | 14.03 | ✅ | ✅ |
| branco #ffffff | `deep-navy` #001736 | 17.86 | ✅ | ✅ |
| branco #ffffff | `accent` #8a6200 | 5.49 | ✅ | ✅ |
| branco #ffffff | `success` #007a36 | 5.47 | ✅ | ✅ |
| branco #ffffff | `warning` #7a5600 | 6.65 | ✅ | ✅ |
| branco #ffffff | `danger` #ba1a1a | 6.46 | ✅ | ✅ |

## Matriz Executive Precision — texto sobre superfícies claras

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
| `label` #1a1c1e | `surface` #f9f9fc | 16.26 | ✅ | ✅ |
| `label` #1a1c1e | `surface-raised` #ffffff | 17.09 | ✅ | ✅ |
| `label` #1a1c1e | `control` #eeeef0 | 14.75 | ✅ | ✅ |
| `secondary-label` #41484e | `surface` #f9f9fc | 8.84 | ✅ | ✅ |
| `secondary-label` #41484e | `surface-raised` #ffffff | 9.28 | ✅ | ✅ |
| `secondary-label` #41484e | `control` #eeeef0 | 8.01 | ✅ | ✅ |
| `accent` #795900 | `surface` #f9f9fc | 6.16 | ✅ | ✅ |
| `accent` #795900 | `surface-raised` #ffffff | 6.48 | ✅ | ✅ |
| `accent` #795900 | `control` #eeeef0 | 5.59 | ✅ | ✅ |
| `success` #24732f | `surface` #f9f9fc | 5.60 | ✅ | ✅ |
| `success` #24732f | `surface-raised` #ffffff | 5.89 | ✅ | ✅ |
| `success` #24732f | `control` #eeeef0 | 5.08 | ✅ | ✅ |
| `warning` #795900 | `surface` #f9f9fc | 6.16 | ✅ | ✅ |
| `warning` #795900 | `surface-raised` #ffffff | 6.48 | ✅ | ✅ |
| `warning` #795900 | `control` #eeeef0 | 5.59 | ✅ | ✅ |
| `danger` #ba1a1a | `surface` #f9f9fc | 6.15 | ✅ | ✅ |
| `danger` #ba1a1a | `surface-raised` #ffffff | 6.46 | ✅ | ✅ |
| `danger` #ba1a1a | `control` #eeeef0 | 5.58 | ✅ | ✅ |
| `primary` #004364 | `surface` #f9f9fc | 10.06 | ✅ | ✅ |
| `primary` #004364 | `surface-raised` #ffffff | 10.57 | ✅ | ✅ |
| `primary` #004364 | `control` #eeeef0 | 9.12 | ✅ | ✅ |

## Matriz Executive Precision — branco sobre fundos preenchidos

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
| branco #ffffff | `primary` #004364 | 10.57 | ✅ | ✅ |
| branco #ffffff | `surface-dark` #083b56 | 11.86 | ✅ | ✅ |
| branco #ffffff | `accent-text` #795900 | 6.48 | ✅ | ✅ |
| branco #ffffff | `success` #24732f | 5.89 | ✅ | ✅ |
| branco #ffffff | `warning` #795900 | 6.48 | ✅ | ✅ |
| branco #ffffff | `danger` #ba1a1a | 6.46 | ✅ | ✅ |

## Texto sobre gold — Executive Precision

| Texto | Fundo gold | Razão | AA normal | AA grande |
|-------|------------|-------|-----------|-----------|
| `on-gold` #083b56 | `secondary-container` #ffc641 | 7.57 | ✅ | ✅ |
| `on-gold` #083b56 | `secondary-fixed-dim` #f6be39 | 6.97 | ✅ | ✅ |

### Par vetado do protótipo

| Texto | Fundo gold | Razão | Status | Decisão |
|-------|------------|-------|--------|---------|
| `on-secondary-container` #715300 | `secondary-container` #ffc641 | 4.56 | Passa apenas neste fundo | Vetado para texto sobre gold |
| `on-secondary-container` #715300 | `secondary-fixed-dim` #f6be39 | 4.20 | Reprova texto normal | Vetado para texto sobre gold |

## Ajustes de valor aplicados nesta story (auditoria AA)

| Token | Antes | Depois | Motivo |
|-------|-------|--------|--------|
| `success` (`--ea-color-success-green`) | #008a3d | #007a36 | Branco sobre success era 4.47:1 (reprovava AA normal em `bg-success text-white` do Button) |
| `warning` | #d6aa45 (`secondary-fixed-dim`) | #7a5600 | Branco sobre warning era 1.94:1 (`hover:bg-warning text-white` nos Buttons); novo valor também funciona como texto sobre superfícies claras |
| `--m3-on-gold` | #715300 (`--m3-on-secondary-container`) | #083b56 (`--m3-surface-dark`) | #715300 reprova AA normal sobre `--m3-secondary-fixed-dim`; navy escuro passa sobre as duas variantes gold |
| `--m3-success-text` | #2d8a39 (`--m3-success`) | #24732f | O valor fonte reprova como texto sobre `--m3-control` e como fundo com branco |
| `--m3-warning-text` | #e67e22 (`--m3-warning`) | #795900 (`--m3-secondary`) | O valor fonte reprova como texto e como fundo com branco; token textual dedicado mantém AA |

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
