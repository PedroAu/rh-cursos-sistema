#!/usr/bin/env node
/**
 * Gera a matriz de contraste WCAG dos tokens de cor (Story 1.2).
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
const tokenRegex = /(--ea-color-[a-z-]+):\s*([^;]+);/g;
const raw = new Map();
for (const match of css.matchAll(tokenRegex)) {
  raw.set(match[1], match[2].trim().split("/*")[0].trim());
}

function resolve(name, depth = 0) {
  if (depth > 5) throw new Error(`Indireção circular em ${name}`);
  const value = raw.get(name);
  if (!value) throw new Error(`Token não encontrado: ${name}`);
  const ref = value.match(/^var\((--ea-color-[a-z-]+)\)$/);
  return ref ? resolve(ref[1], depth + 1) : value;
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

const WHITE = "#ffffff";
const textTokens = [
  ["label", resolve("--ea-color-label")],
  ["secondary-label", resolve("--ea-color-secondary-label")],
  ["accent", resolve("--ea-color-accent")],
  ["success", resolve("--ea-color-success")],
  ["warning", resolve("--ea-color-warning")],
  ["danger", resolve("--ea-color-danger")],
  ["primary", resolve("--ea-color-primary")]
];
const surfaceTokens = [
  ["surface", resolve("--ea-color-surface")],
  ["surface-raised", resolve("--ea-color-surface-raised")],
  ["control", resolve("--ea-color-control")]
];
const darkBackgrounds = [
  ["primary", resolve("--ea-color-primary")],
  ["deep-navy", resolve("--ea-color-deep-navy")],
  ["accent", resolve("--ea-color-accent")],
  ["success", resolve("--ea-color-success")],
  ["warning", resolve("--ea-color-warning")],
  ["danger", resolve("--ea-color-danger")]
];

function verdict(r, threshold = 4.5) {
  return r >= threshold ? "✅" : "❌";
}

const rows = [];
for (const [fgName, fg] of textTokens) {
  for (const [bgName, bg] of surfaceTokens) {
    const r = ratio(fg, bg);
    rows.push(
      `| \`${fgName}\` ${fg} | \`${bgName}\` ${bg} | ${r.toFixed(2)} | ${verdict(r)} | ${r >= 3 ? "✅" : "❌"} |`
    );
  }
}

const darkRows = [];
for (const [bgName, bg] of darkBackgrounds) {
  const r = ratio(WHITE, bg);
  darkRows.push(
    `| branco #ffffff | \`${bgName}\` ${bg} | ${r.toFixed(2)} | ${verdict(r)} | ${r >= 3 ? "✅" : "❌"} |`
  );
}

const failures = [...rows, ...darkRows].filter((row) => row.includes("❌ |"));

// --- Documento --------------------------------------------------------------

const doc = `# Tokens de Cor e Superfície — Camada Semântica (Story 1.2)

> Gerado por \`node scripts/contrast-matrix.mjs\` a partir dos valores reais de
> \`src/styles/globals.css\`. Regere após qualquer mudança de token.

## Arquitetura em duas camadas

| Camada | Onde | Papel |
|--------|------|-------|
| **Paleta** | \`--ea-color-*\` (valores hex) | Cores brutas da marca/Material |
| **Semântica** | \`--ea-color-label\`, \`--ea-color-surface-raised\`, … | Papel funcional; referencia a paleta via \`var()\` |

Dark mode futuro (decisão D4): redefinir **apenas** o bloco semântico
(ex.: \`[data-theme="dark"]\`), sem tocar em paleta ou componentes.

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
> (\`--ea-font-size-label\`) — expor a cor com o mesmo nome colidiria a classe.

## Matriz de contraste — texto sobre superfícies claras

AA texto normal: ≥ 4.5:1 · AA texto grande (≥18pt/14pt bold): ≥ 3:1

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
${rows.join("\n")}

## Matriz de contraste — branco sobre fundos escuros/saturados

| Texto | Fundo | Razão | AA normal | AA grande |
|-------|-------|-------|-----------|-----------|
${darkRows.join("\n")}

## Ajustes de valor aplicados nesta story (auditoria AA)

| Token | Antes | Depois | Motivo |
|-------|-------|--------|--------|
| \`success\` (\`--ea-color-success-green\`) | #008a3d | #007a36 | Branco sobre success era 4.47:1 (reprovava AA normal em \`bg-success text-white\` do Button) |
| \`warning\` | #d6aa45 (\`secondary-fixed-dim\`) | #7a5600 | Branco sobre warning era 1.94:1 (\`hover:bg-warning text-white\` nos Buttons); novo valor também funciona como texto sobre superfícies claras |

## Observações da auditoria

- \`--ea-color-on-primary-container\` (#6f8fca) tem 4.25:1 sobre \`primary\` —
  reprovaria como texto normal, mas **não é usado como texto** em nenhum
  componente (verificado). Reservado; se for usado, apenas em texto grande.
- \`--ea-color-secondary-fixed-dim\` (#d6aa45) permanece na paleta para usos
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
