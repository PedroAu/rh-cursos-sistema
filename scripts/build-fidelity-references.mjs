import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const REPO_ROOT = process.cwd();
const SOURCE_DIR = join(REPO_ROOT, "docs", "design-system");
const OUTPUT_DIR = join(SOURCE_DIR, "reference");
const LOGO_PATH = join(REPO_ROOT, "public", "uploads", "logoHorizontal_800X600.png");

const sources = [
  ["RH Cursos Home.dc.html", "home.html"],
  ["RH Cursos Catálogo.dc.html", "courses.html"],
  ["Agenda export.dc.html", "agenda.html"],
  ["RH Cursos In-company.dc.html", "in-company.html"],
  ["RH Cursos Quem Somos.dc.html", "about.html"],
  ["RH Cursos Blog.dc.html", "blog.html"],
  ["RH Cursos Login.dc.html", "login.html"],
  ["RH Cursos Curso.dc.html", "course-detail.html"],
  ["RH Cursos Checkout.dc.html", "checkout.html"],
];

const adminScreens = [
  "dashboard",
  "cursos",
  "turmas",
  "matriculas",
  "alunos",
  "instrutores",
  "leads",
  "blog",
  "paginas",
  "config",
];

function inlineDesignSystemCss() {
  const tokenFiles = ["fonts.css", "colors.css", "typography.css", "spacing.css", "effects.css"];
  const tokens = tokenFiles.map((file) => readFileSync(join(SOURCE_DIR, "tokens", file), "utf8")).join("\n");
  const withoutRemoteFonts = tokens
    .replace(/@import\s+url\([\s\S]*?\)\s*;\s*/g, "")
    .replace(/@font-face\s*\{[\s\S]*?\n\}\s*/g, "");
  const styles = readFileSync(join(SOURCE_DIR, "styles.css"), "utf8");
  return `${withoutRemoteFonts}\n${styles.replace(/@import\s+url\([\s\S]*?\)\s*;\s*/g, "")}\n`;
}

function dataUri(path) {
  const mime = path.endsWith(".png") ? "image/png" : "application/octet-stream";
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

const logoDataUri = dataUri(LOGO_PATH);
const DESIGN_LINKS = {
  "RH Cursos Login.dc.html": "login.html",
  "RH Cursos Home.dc.html": "home.html",
  "RH Cursos Catálogo.dc.html": "courses.html",
};

const ADMIN_SCREENS = new Set(adminScreens);

function placeholderValue(expression, adminScreen = null) {
  const normalized = expression.replace(/[{}]/g, "").trim();
  const key = normalized.split(/[.\s]/).filter(Boolean).at(-1)?.toLowerCase() ?? "value";
  const path = normalized.toLowerCase();

  if (/^(true|false)$/.test(normalized)) return normalized;
  if (/^cur\./.test(path)) return path.endsWith(`.${adminScreen}`) ? "1" : "0";
  if (/^aria\./.test(path)) return path.endsWith(`.${adminScreen}`) ? "page" : "";
  if (path === "layout.display") return "grid";
  if (path === "layout.cols") return "1fr 340px";
  if (path === "layout.maxwidth") return "1120px";
  if (/\.barstyle$/.test(path)) return "width:74%;background:var(--tk-accent)";
  if (/\.(tagstyle|ststyle|pgstyle|dotstyle)$/.test(path)) return "background:var(--tk-accent-soft);color:var(--tk-brand)";
  if (/\.(spotcolor|pctcolor|dotfill|dotborder|tint)$/.test(path)) return "var(--tk-brand)";
  if (/\.spotbg$/.test(path)) return "var(--tk-accent-soft)";
  if (/\.status$/.test(path) && path.startsWith("it.")) return "active";
  if (/status|st$/.test(key) && adminScreen === "instrutores") return "Ativo";
  if (/^(hot|isactive)$/.test(key)) return "1";
  if (path.endsWith(".q")) return "Como funciona a inscrição?";
  if (/^(empty|no|not|hidden|disabled|sent|showerror|noleads|notdone|iscal|isstep1|isstep2|aria)$/.test(key)) return "false";
  if (/^(on|pressed|checked|done|linedone|expanded|open|isopen|isstep|islist|current|remember|visible|show)/.test(key)) return "1";
  if (/day/.test(key)) return "18";
  if (/month/.test(key)) return "AGO";
  if (/date|time/.test(key)) return "18 de agosto de 2026";
  if (/price|valor|amount/.test(key)) return "R$ 1.200";
  if (/count|total|number|n$|vagas|spots|turmas|horas|pct|percent|courses?$/.test(key)) return "12";
  if (/mode/.test(key)) return "Online";
  if (/status|st$/.test(key)) return "Aberta";
  if (/email/.test(key)) return "contato@rhcursos.com.br";
  if (/phone|whats/.test(key)) return "(31) 99999-0000";
  if (/brandname/.test(key)) return "RH Cursos & Soluções";
  if (/title|name|label|cat|category|author|role|org|company|institution|course|l\.name/.test(key)) return "Referência RH Cursos";
  if (/^(query|search)$/.test(key)) return "";
  if (/avatar/.test(path)) return "";
  return "Referência";
}

function hydratePlaceholders(html, adminScreen = null) {
  return html.replace(/\{\{([\s\S]*?)\}\}/g, (_, expression) => placeholderValue(expression, adminScreen));
}

function transformCustomConditionals(html, adminScreen = null) {
  const tagPattern = /<sc-if\b([^>]*)>|<\/sc-if>/gi;
  const stack = [];
  return html.replace(tagPattern, (match, attributes = "") => {
    if (match.toLowerCase() === "</sc-if>") {
      const tagName = stack.pop() ?? "div";
      return `</${tagName}>`;
    }

    const screenMatch = attributes.match(/value=["']\s*\{\{\s*show\.([\w-]+)\s*\}\}\s*["']/i);
    if (screenMatch && ADMIN_SCREENS.has(screenMatch[1])) {
      stack.push("section");
      const hidden = adminScreen && adminScreen !== screenMatch[1] ? ' class="reference-screen-hidden"' : "";
      return `<section data-reference-screen="${screenMatch[1]}"${hidden}>`;
    }

    stack.push("div");
    return `<div data-reference-condition${attributes}>`;
  });
}

function hydrateReferenceComponents(html) {
  return html.replace(/<span\s+data-reference-component\b([^>]*)><\/span>/gi, (_, attributes) => {
    const label = attributes.match(/(?:label|placeholder|aria-label)=["']([^"']+)["']/i)?.[1];
    const avatar = /(?:avatar|size=["'](?:sm|md)["'])/i.test(attributes);
    return `<span data-reference-component${attributes}>${label ?? (avatar ? "MR" : "—")}</span>`;
  });
}

function resolveConditionalBlocks(html) {
  const tokenPattern = /<div\b[^>]*>|<\/div>/gi;
  const stack = [];
  const nodes = [];

  for (const match of html.matchAll(tokenPattern)) {
    const token = match[0];
    if (token.startsWith("</")) {
      const node = stack.pop();
      if (node?.condition) {
        node.closeStart = match.index;
        node.end = match.index + token.length;
        nodes.push(node);
      }
      continue;
    }

    const condition = /data-reference-condition\b/i.test(token);
    stack.push({
      condition,
      start: match.index,
      openEnd: match.index + token.length,
      value: token.match(/value=["']([^"']+)["']/i)?.[1]?.trim().toLowerCase() ?? "true",
    });
  }

  const roots = [];
  const parentStack = [];
  for (const node of nodes.sort((a, b) => a.start - b.start)) {
    while (parentStack.length && node.start >= parentStack.at(-1).closeStart) parentStack.pop();
    if (parentStack.length) {
      const parent = parentStack.at(-1);
      parent.children ??= [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
    node.children ??= [];
    parentStack.push(node);
  }

  const renderRange = (start, end, parent = null) => {
    const children = (parent ? parent.children : roots).filter((node) => node.start >= start && node.end <= end);
    let cursor = start;
    let output = "";
    for (const node of children) {
      output += html.slice(cursor, node.start);
      if (node.value !== "false" && node.value !== "0") {
        output += renderRange(node.openEnd, node.closeStart, node);
      }
      cursor = node.end;
    }
    return output + html.slice(cursor, end);
  };

  return renderRange(0, html.length);
}

function normalizeCustomMarkup(html, adminScreen = null, referenceTitle = "") {
  let normalized = html
    .replace(/<script\s+src=["']\.\/support\.js["']\s*><\/script>/gi, "")
    .replace(/<script\s+src=["'][^"']*_ds\/trust-keith[^"']*_ds_bundle\.js["']\s*><\/script>/gi, "")
    .replace(/<link\s+rel=["']stylesheet["']\s+href=["'][^"']*_ds\/trust-keith[^"']*\/styles\.css["']\s*\/?\s*>/gi, "")
    .replace(/<script\s+type=["']text\/x-dc["'][\s\S]*?<\/script>/gi, "")
    .replace(/<template\s+id=["']__bundler_thumbnail["'][\s\S]*?<\/template>/gi, "")
    .replace(/\s+(?:hint-[a-z-]+|component-from-global-scope|dc-props)="(?:[^"]*)"/gi, "")
    .replace(/<x-import\b([^>]*)>/gi, '<span data-reference-component$1>')
    .replace(/<\/x-import>/gi, "</span>")
    .replace(/<dc-import\b[^>]*><\/dc-import>/gi, "")
    .replace(/<sc-for\b[^>]*>/gi, "")
    .replace(/<\/sc-for>/gi, "")
    .replace(/<x-dc>/gi, "<div data-reference-document>")
    .replace(/<\/x-dc>/gi, "</div>")
    .replace(/<helmet>/gi, "<div data-reference-head>")
    .replace(/<\/helmet>/gi, "</div>")
    .replace(/<img\s+([^>]*?)src=["'](?:\.\/)?uploads\/logoHorizontal_800X600\.png["']([^>]*)>/gi, (_, before, after) => `<img ${before}src="${logoDataUri}"${after}>`);

  normalized = transformCustomConditionals(normalized, adminScreen);
  normalized = hydratePlaceholders(normalized, adminScreen);
  normalized = hydrateReferenceComponents(normalized);
  normalized = normalized
    .replace(/\s+on[a-z][a-z0-9:-]*="[^"]*"/gi, "")
    .replace(/\s+style-hover="[^"]*"/gi, "")
    .replace(/\s+data-cur="0"/gi, "")
    .replace(/\s+aria-current="(?:false|0)?"/gi, "")
    .replace(/style="#([0-9a-f]{3,8})"/gi, 'style="background:#$1"')
    .replace(/style="Referência"/gi, 'style="background:var(--tk-accent-soft)"')
    .replace(/aria-pressed="1"/gi, 'aria-pressed="true"')
    .replace(/aria-pressed="0"/gi, 'aria-pressed="false"')
    .replace(/checked="(?:Referência|1)"/gi, 'checked="true"')
    .replace(/checked="0"/gi, 'checked="false"')
    .replace(/(aria-label="Ocupação de )12(%")/gi, (_, prefix, suffix) => `${prefix}74${suffix}`)
    .replace(/(<i\s+data-hot="1"\s+style="width:74%);background:var\(--tk-accent\)(")/gi, "$1$2")
    .replace(/<p\s+class="adm-empty">[\s\S]*?<\/p>/gi, "");
  normalized = resolveConditionalBlocks(normalized);
  normalized = normalized
    .replace(/aria-current="1"/gi, 'aria-current="page"')
    .replace(/aria-expanded="1"/gi, 'aria-expanded="true"')
    .replace(/aria-expanded="0"/gi, 'aria-expanded="false"')
    .replace(/aria-checked="1"/gi, 'aria-checked="true"')
    .replace(/aria-checked="0"/gi, 'aria-checked="false"')
    .replace(/(<select\b[^>]*class=["'][^"']*\brh-fsel\b[^"']*["'][^>]*)\s+data-on=["'][^"']*["']/gi, '$1 data-on="1"')
    .replace(/(<select\b[^>]*class=["'][^"']*\brh-fsel\b[^>]*?)\s+value=["'][^"']*["']/gi, "$1")
    .replace(/\s+data-i="Referência"/gi, ' data-i="1"')
    .replace(/\bhref=["']([^"']+\.dc\.html)["']/gi, (_, href) => `href="${DESIGN_LINKS[href] ?? "#"}"`)
    .replace(/\bclass="([^"']*\brh-modetag)\s+(?:rh-mode-)?([^"'\s]+)([^"']*)"/gi, (_, before, mode, after) => `class="${before} rh-mode-${mode.toLowerCase()}${after}"`)
    .replace(/\s+defaultValue=["'][^"']*["']/gi, "")
    .replace(/(<select\s+id=["']uf-select["'][^>]*>\s*<option\b[^>]*value=["']["'][^>]*)(>)/i, "$1 selected$2")
    .replace(/<input\b([^>]*\bplaceholder=["']Cupom de desconto["'][^>]*)>/gi, (_, attributes) => /\baria-label=/i.test(attributes) ? `<input${attributes}>` : `<input${attributes} aria-label="Cupom de desconto">`)
    .replace(/<button(?![^>]*\btype=)([^>]*)>/gi, '<button type="button"$1>')
    .replace(/--tk-text-display(?![-a-z])/g, "--tk-text-display-large")
    .replace(/<html(?![^>]*\blang=)/i, '<html lang="pt-BR"');
  normalized = normalized.replace(/©\s*2026\s*RH Cursos\. Todos os direitos reservados\./gi, "© 2026 RH Cursos &amp; Soluções. Todos os direitos reservados.");

  const referenceCss = `<style data-reference-inline-css>\n${inlineDesignSystemCss()}\n.reference-screen-hidden{display:none!important}\n[data-reference-document]{display:block}\n.rh-wrap{width:min(1120px,calc(100% - 48px))}.rh-journeys{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.rh-consult{display:grid;grid-template-columns:1fr 1fr;gap:24px}.rh-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.rh-jlink{display:inline-flex;align-items:center}\n</style>`;
  const titleMarkup = referenceTitle && !/<title\b/i.test(normalized) ? `<title>${referenceTitle}</title>` : "";
  normalized = normalized.replace(/<\/head>/i, `${titleMarkup}${referenceCss}</head>`);
  if (adminScreen) {
    normalized = normalized.replace(/<body([^>]*)>/i, `<body$1 data-reference-admin-screen="${adminScreen}">`);
  }
  let buyerOptionIndex = 0;
  normalized = normalized.replace(/<button\b([^>]*class=["'][^"']*\brh-segbtn\b[^"']*["'][^>]*)>/gi, (_, attributes) => {
    const selected = buyerOptionIndex++ === 0;
    const cleanAttributes = attributes
      .replace(/\s+data-on=["'][^"']*["']/gi, "")
      .replace(/\s+role=["'][^"']*["']/gi, "")
      .replace(/\s+aria-checked=["'][^"']*["']/gi, "");
    return `<button${cleanAttributes} role="radio" aria-checked="${selected ? "true" : "false"}"${selected ? ' data-on="1"' : ""}>`;
  });
  return normalized;
}

function buildReference(sourceName, outputName, adminScreen = null) {
  const sourcePath = join(SOURCE_DIR, sourceName);
  if (!existsSync(sourcePath)) throw new Error(`Canvas fonte ausente: ${sourceName}`);
  let source = readFileSync(sourcePath, "utf8");
  if (sourceName === "RH Cursos Home.dc.html") {
    const sections = readFileSync(join(SOURCE_DIR, "RH Home Sections.dc.html"), "utf8")
      .replace(/^[\s\S]*?<x-dc>/i, "")
      .replace(/<\/x-dc>[\s\S]*$/i, "")
      .replace(/<helmet>[\s\S]*?<\/helmet>/i, "");
    source = source.replace(/<dc-import\b[^>]*><\/dc-import>/i, sections);
  }
  const referenceTitle = outputName
    .replace(/\.html$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const html = normalizeCustomMarkup(source, adminScreen, referenceTitle);
  const unresolved = (html.match(/\{\{/g) ?? []).length;
  const forbiddenAssets = ["support.js", "_ds_bundle.js", "_ds/", "uploads/logoHorizontal_800X600.png"];
  const remainingAssets = forbiddenAssets.filter((asset) => html.includes(asset));
  if (unresolved > 0 || remainingAssets.length > 0) {
    throw new Error(`${sourceName} gerou referência inválida: placeholders=${unresolved}; ativos=${remainingAssets.join(",")}`);
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, outputName), html.replace(/[ \t]+$/gm, ""));
}

function buildAdminScreenReferences() {
  for (const screen of adminScreens) {
    buildReference("RH Cursos Admin Dashboard.dc.html", `admin-${screen}.html`, screen);
  }
}

function validateOutput() {
  const expected = [...sources.map(([, output]) => output), ...adminScreens.map((screen) => `admin-${screen}.html`)];
  const missing = expected.filter((file) => !existsSync(join(OUTPUT_DIR, file)));
  const generated = readdirSync(OUTPUT_DIR).filter((file) => file.endsWith(".html"));
  const unexpected = generated.filter((file) => !expected.includes(file));
  if (missing.length || unexpected.length) {
    throw new Error(`Referências inconsistentes: missing=${missing.join(",")}; unexpected=${unexpected.join(",")}`);
  }
  for (const file of expected) {
    const html = readFileSync(join(OUTPUT_DIR, file), "utf8");
    const invalidPatterns = [
      /\{\{/,
      /support\.js|_ds_bundle\.js|_ds\//,
      /uploads\/logoHorizontal_800X600\.png/,
      /\son[a-z][a-z0-9:-]*=/i,
      /\sstyle-hover=/i,
      /\.dc\.html["']/i,
      /style="(?:#[0-9a-f]{3,8}|Referência)"/i,
      /data-(?:cur|on|hot|status|done|open)="Referência"/i,
      /aria-current="(?:Referência|1)"/i,
      /data-reference-loop/,
      /data-reference-condition/,
      /<span\s+data-reference-component\b[^>]*><\/span>/i,
      /<title>\s*<\/title>/i,
    ];
    if (invalidPatterns.some((pattern) => pattern.test(html))) {
      throw new Error(`Referência não autocontida: ${file}`);
    }
  }
}

function main() {
  if (!existsSync(LOGO_PATH)) throw new Error(`Logo de produção ausente: ${LOGO_PATH}`);
  for (const [sourceName, outputName] of sources) {
    buildReference(sourceName, outputName);
  }
  buildAdminScreenReferences();
  validateOutput();
  console.log(`Generated ${sources.length + adminScreens.length} self-contained fidelity references in ${basename(OUTPUT_DIR)}/.`);
}

main();
