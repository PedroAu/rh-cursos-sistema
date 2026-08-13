#!/usr/bin/env node
/**
 * Gera a matriz de contraste WCAG dos tokens de cor (Story 1.2 + Epic 7).
 *
 * Lê os valores reais de src/styles/globals.css (resolvendo indireção var()),
 * calcula a razão de contraste WCAG 2.1 de cada combinação texto/fundo
 * documentada e escreve docs/design/tokens-cor-superficie.md.
 *
 * Uso: node scripts/contrast-matrix.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const cssPath = join(root, "src/styles/globals.css");
const outPath = join(root, "docs/design/tokens-cor-superficie.md");

// --- Parse dos tokens ------------------------------------------------------

const css = readFileSync(cssPath, "utf-8");
function readBlock(selector) {
  const selectorIndex = css.indexOf(selector);
  if (selectorIndex === -1) {
    throw new Error(`Seletor não encontrado: ${selector}`);
  }

  const openIndex = css.indexOf("{", selectorIndex);
  let depth = 0;
  for (let i = openIndex; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") depth -= 1;
    if (depth === 0) {
      return css.slice(openIndex + 1, i);
    }
  }

  throw new Error(`Bloco CSS não fechado: ${selector}`);
}

function readTokens(block) {
  const tokenRegex = /(--[a-z0-9-]+):\s*([^;]+);/gi;
  const tokens = new Map();
  for (const match of block.matchAll(tokenRegex)) {
    tokens.set(match[1], match[2].trim().split("/*")[0].trim());
  }
  return tokens;
}

const rootTokens = readTokens(readBlock(":root"));
const executiveTokens = readTokens(readBlock('[data-theme="executive"]'));

function createResolver(scopeTokens = new Map()) {
  return function resolve(name, depth = 0) {
    if (depth > 8) throw new Error(`Indireção circular em ${name}`);
    const value = scopeTokens.get(name) ?? rootTokens.get(name);
    if (!value) throw new Error(`Token não encontrado: ${name}`);
    const ref = value.match(/^var\((--[a-z0-9-]+)\)$/i);
    return ref ? resolve(ref[1], depth + 1) : value;
  };
}

// --- Contraste WCAG 2.1 ----------------------------------------------------

function luminance(hex) {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fgHex, bgHex) {
  const [hi, lo] = [luminance(fgHex), luminance(bgHex)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// --- Combinações auditadas --------------------------------------------------

function verdict(r, threshold = 4.5) {
  return r >= threshold ? "✅" : "❌";
}

function buildRows(textTokens, surfaceTokens) {
  const rows = [];
  for (const [fgName, fg] of textTokens) {
    for (const [bgName, bg] of surfaceTokens) {
      const r = ratio(fg, bg);
      rows.push(
        `| \`${fgName}\` ${fg} | \`${bgName}\` ${bg} | ${r.toFixed(2)} | ${verdict(r)} | ${r >= 3 ? "✅" : "❌"} |`
      );
    }
  }
  return rows;
}

function buildWhiteRows(backgrounds) {
  const WHITE = "#ffffff";
  const rows = [];
  for (const [bgName, bg] of backgrounds) {
    const r = ratio(WHITE, bg);
    rows.push(
      `| branco #ffffff | \`${bgName}\` ${bg} | ${r.toFixed(2)} | ${verdict(r)} | ${r >= 3 ? "✅" : "❌"} |`
    );
  }
  return rows;
}

function makeTheme(resolve, mode) {
  if (mode === "executive") {
    return {
      textTokens: [
        ["label", resolve("--rh-color-label")],
        ["secondary-label", resolve("--rh-color-secondary-label")],
        ["accent", resolve("--rh-color-accent")],
        ["success", resolve("--rh-color-success")],
        ["warning", resolve("--rh-color-warning")],
        ["danger", resolve("--rh-color-danger")],
        ["primary", resolve("--m3-primary")]
      ],
      surfaceTokens: [
        ["surface", resolve("--m3-surface")],
        ["surface-raised", resolve("--rh-color-surface-raised")],
        ["control", resolve("--rh-color-control")]
      ],
      filledBackgrounds: [
        ["primary", resolve("--m3-primary")],
        ["surface-dark", resolve("--m3-surface-dark")],
        ["accent-text", resolve("--rh-color-accent")],
        ["success", resolve("--rh-color-success")],
        ["warning", resolve("--rh-color-warning")],
        ["danger", resolve("--rh-color-danger")]
      ]
    };
  }

  return {
    textTokens: [
      ["label", resolve("--rh-color-label")],
      ["secondary-label", resolve("--rh-color-secondary-label")],
      ["accent", resolve("--rh-color-accent")],
      ["success", resolve("--rh-color-success")],
      ["warning", resolve("--rh-color-warning")],
      ["danger", resolve("--rh-color-danger")],
      ["primary", resolve("--rh-color-primary")]
    ],
    surfaceTokens: [
      ["surface", resolve("--rh-color-surface")],
      ["surface-raised", resolve("--rh-color-surface-raised")],
      ["control", resolve("--rh-color-control")]
    ],
    filledBackgrounds: [
      ["primary", resolve("--rh-color-primary")],
      ["deep-navy", resolve("--rh-color-deep-navy")],
      ["accent", resolve("--rh-color-accent")],
      ["success", resolve("--rh-color-success")],
      ["warning", resolve("--rh-color-warning")],
      ["danger", resolve("--rh-color-danger")]
    ]
  };
}

const legacyResolve = createResolver();
const executiveResolve = createResolver(executiveTokens);
const legacyTheme = makeTheme(legacyResolve, "legacy");
const executiveTheme = makeTheme(executiveResolve, "executive");

const legacyRows = buildRows(legacyTheme.textTokens, legacyTheme.surfaceTokens);
const legacyFilledRows = buildWhiteRows(legacyTheme.filledBackgrounds);
const executiveRows = buildRows(executiveTheme.textTokens, executiveTheme.surfaceTokens);
const executiveFilledRows = buildWhiteRows(executiveTheme.filledBackgrounds);

const goldRows = [
  ["on-gold", executiveResolve("--m3-on-gold"), "secondary-container", executiveResolve("--m3-secondary-container")],
  ["on-gold", executiveResolve("--m3-on-gold"), "secondary-fixed-dim", executiveResolve("--m3-secondary-fixed-dim")]
].map(([fgName, fg, bgName, bg]) => {
  const r = ratio(fg, bg);
  return `| \`${fgName}\` ${fg} | \`${bgName}\` ${bg} | ${r.toFixed(2)} | ${verdict(r)} | ${r >= 3 ? "✅" : "❌"} |`;
});

const vetoRows = [
  ["on-secondary-container", executiveResolve("--m3-on-secondary-container"), "secondary-container", executiveResolve("--m3-secondary-container")],
  ["on-secondary-container", executiveResolve("--m3-on-secondary-container"), "secondary-fixed-dim", executiveResolve("--m3-secondary-fixed-dim")]
].map(([fgName, fg, bgName, bg]) => {
  const r = ratio(fg, bg);
  const status = r >= 4.5 ? "Passa apenas neste fundo" : "Reprova texto normal";
  return `| \`${fgName}\` ${fg} | \`${bgName}\` ${bg} | ${r.toFixed(2)} | ${status} | Vetado para texto sobre gold |`;
});

const failures = [
  ...legacyRows,
  ...legacyFilledRows,
  ...executiveRows,
  ...executiveFilledRows,
  ...goldRows
].filter((row) => row.includes("❌ |"));

// --- Documento --------------------------------------------------------------

const doc = `# Tokens de Cor e Superfície — Camada Semântica

> Gerado por \`node scripts/contrast-matrix.mjs\` a partir dos valores reais de
> \`src/styles/globals.css\`. Regere após qualquer mudança de token.

## Arquitetura em duas camadas

| Camada | Onde | Papel |
|--------|------|-------|
| **Paleta atual** | \`--rh-color-*\` (valores hex) | Cores brutas da marca/Material atual |
| **Paleta Executive Precision** | \`--m3-*\` (valores hex) | Fonte canônica do frontmatter de \`docs/design/executive-precision/DESIGN.md\` |
| **Semântica** | \`--rh-color-label\`, \`--rh-color-surface-raised\`, ... | Papel funcional; referencia uma paleta via \`var()\` |

O tema Executive Precision é ativado por rota/layout com
\`data-theme="executive"\` no contêiner que envolve a rota. Esta story apenas
declara o scope; nenhuma rota recebe o atributo aqui.

## Tokens semânticos

| Token | Classe Tailwind | Uso |
|-------|----------------|-----|
| \`label\` | \`text-label-primary\` | Texto principal |
| \`secondary-label\` | \`text-label-secondary\` | Texto de apoio, metadata, captions |
| \`separator\` | \`border-separator\` | Divisores e bordas sutis |
| \`surface\` | \`bg-surface\` | Fundo base da página |
| \`surface-raised\` | \`bg-surface-raised\` | Cards e painéis elevados |
| \`control\` | \`bg-control\` | Chips, inputs, controles segmentados |
| \`accent\` | \`text-accent\` / \`bg-accent\` | Ação e destaque institucional (dourado) |
| \`success\` | \`text-success\` / \`bg-success\` | Estados positivos |
| \`warning\` | \`text-warning\` / \`bg-warning\` | Alertas (textual/interativo) |
| \`danger\` | \`text-danger\` / \`bg-danger\` | Erros e ações destrutivas |

> **Nota de nomenclatura:** a cor \`label\` é exposta como \`label-primary\`/
> \`label-secondary\` porque \`text-label\` já é um utilitário de **fontSize**
> (\`--rh-font-size-label\`) — expor a cor com o mesmo nome colidiria a classe.

## Mapeamento semântico — Executive Precision

| Token semântico | Valor no scope \`[data-theme="executive"]\` | Papel |
|-----------------|---------------------------------------------|-------|
| \`label\` | \`--m3-on-surface\` ${executiveResolve("--rh-color-label")} | Texto principal |
| \`secondary-label\` | \`--m3-on-surface-variant\` ${executiveResolve("--rh-color-secondary-label")} | Texto de apoio |
| \`separator\` | \`--m3-outline-variant\` ${executiveResolve("--rh-color-separator")} | Bordas sutis |
| \`surface-raised\` | \`--m3-surface-container-lowest\` ${executiveResolve("--rh-color-surface-raised")} | Cards e painéis |
| \`control\` | \`--m3-surface-container\` ${executiveResolve("--rh-color-control")} | Inputs, chips e controles |
| \`accent\` | \`--m3-secondary\` ${executiveResolve("--rh-color-accent")} | Dourado textual/interativo |
| \`success\` | \`--m3-success-text\` ${executiveResolve("--rh-color-success")} | Estado positivo textual/filled AA |
| \`warning\` | \`--m3-warning-text\` ${executiveResolve("--rh-color-warning")} | Alerta textual/filled AA |
| \`danger\` | \`--m3-error\` ${executiveResolve("--rh-color-danger")} | Erro/destrutivo |

## Matriz atual — texto sobre superfícies claras

AA texto normal: ≥ 4.5:1 · AA texto grande (≥18pt/14pt bold): ≥ 3:1

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
${legacyRows.join("\n")}

## Matriz atual — branco sobre fundos preenchidos

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
${legacyFilledRows.join("\n")}

## Matriz Executive Precision — texto sobre superfícies claras

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
${executiveRows.join("\n")}

## Matriz Executive Precision — branco sobre fundos preenchidos

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
${executiveFilledRows.join("\n")}

## Texto sobre gold — Executive Precision

| Texto | Fundo gold | Razão | AA normal | AA grande |
|-------|------------|-------|-----------|-----------|
${goldRows.join("\n")}

### Par vetado do protótipo

| Texto | Fundo gold | Razão | Status | Decisão |
|-------|------------|-------|--------|---------|
${vetoRows.join("\n")}

## Ajustes de valor aplicados nesta story (auditoria AA)

| Token | Antes | Depois | Motivo |
|-------|-------|--------|--------|
| \`success\` (\`--rh-color-success-green\`) | #008a3d | #007a36 | Branco sobre success era 4.47:1 (reprovava AA normal em \`bg-success text-white\` do Button) |
| \`warning\` | #d6aa45 (\`secondary-fixed-dim\`) | #7a5600 | Branco sobre warning era 1.94:1 (\`hover:bg-warning text-white\` nos Buttons); novo valor também funciona como texto sobre superfícies claras |
| \`--m3-on-gold\` | #715300 (\`--m3-on-secondary-container\`) | #083b56 (\`--m3-surface-dark\`) | #715300 reprova AA normal sobre \`--m3-secondary-fixed-dim\`; navy escuro passa sobre as duas variantes gold |
| \`--m3-success-text\` | #2d8a39 (\`--m3-success\`) | #24732f | O valor fonte reprova como texto sobre \`--m3-control\` e como fundo com branco |
| \`--m3-warning-text\` | #e67e22 (\`--m3-warning\`) | #795900 (\`--m3-secondary\`) | O valor fonte reprova como texto e como fundo com branco; token textual dedicado mantém AA |

## Observações da auditoria

- \`--rh-color-on-primary-container\` (#6f8fca) tem 4.25:1 sobre \`primary\` —
  reprovaria como texto normal, mas **não é usado como texto** em nenhum
  componente (verificado). Reservado; se for usado, apenas em texto grande.
- \`--rh-color-secondary-fixed-dim\` (#d6aa45) permanece na paleta para usos
  decorativos/fundos com texto escuro; deixou de ser o valor de \`warning\`.
- As 70 "violações" do baseline da Story 1.1 eram artefato de medição
  (axe capturando animações de entrada do framer-motion em /cursos);
  corrigido via \`MotionProvider\` + emulação de reduced motion no spec.

${failures.length === 0 ? "**Resultado: todas as combinações auditadas passam WCAG AA para texto normal.** ✅" : `**Atenção: ${failures.length} combinação(ões) abaixo de 4.5:1 (verificar se o uso é texto grande/decorativo):**\n\n${failures.join("\n")}`}
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, doc, "utf-8");
console.log(`Matriz gerada em ${outPath}`);
const failCount = failures.length;
console.log(failCount === 0 ? "Todas as combinações passam AA normal. ✅" : `${failCount} combinações < 4.5:1 (ver doc).`);
