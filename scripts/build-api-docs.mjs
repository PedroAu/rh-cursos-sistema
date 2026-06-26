#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { parse } from "yaml";

const root = process.cwd();
const specPath = resolve(root, "docs/api/openapi.yaml");
const outputPath = resolve(root, "public/api-docs.html");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

let spec;

try {
  spec = parse(readFileSync(specPath, "utf8"));
} catch (error) {
  fail(`Falha ao carregar ${specPath}: ${error instanceof Error ? error.message : error}`);
}

const specJson = JSON.stringify(spec).replace(/</g, "\\u003c");
const pathSummaries = Object.entries(spec.paths ?? {})
  .map(([path, operations]) => {
    const methods = Object.keys(operations ?? {})
      .filter((method) => ["get", "post", "put", "patch", "delete", "options", "head"].includes(method))
      .map((method) => method.toUpperCase())
      .join(" · ");

    return `<li><span>${escapeHtml(methods || "UNKNOWN")}</span><code>${escapeHtml(path)}</code></li>`;
  })
  .join("");

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>RH Cursos API</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f5ef;
        --panel: #ffffff;
        --panel-border: rgba(22, 31, 45, 0.12);
        --text: #13233a;
        --muted: #516173;
        --accent: #0d5b86;
        --accent-soft: rgba(13, 91, 134, 0.08);
        --shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(13, 91, 134, 0.10), transparent 34%),
          linear-gradient(180deg, #fefdf9 0%, var(--bg) 100%);
        color: var(--text);
      }

      .shell {
        max-width: 1240px;
        margin: 0 auto;
        padding: 32px 20px 48px;
      }

      .hero {
        display: grid;
        gap: 16px;
        margin-bottom: 24px;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 12px;
        color: var(--accent);
        font-weight: 700;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 1.02;
      }

      .subtitle {
        max-width: 72ch;
        margin: 0;
        color: var(--muted);
        font-size: 1rem;
        line-height: 1.6;
      }

      .grid {
        display: grid;
        grid-template-columns: 340px minmax(0, 1fr);
        gap: 18px;
        align-items: start;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 24px;
        box-shadow: var(--shadow);
      }

      .sidebar {
        padding: 20px;
        position: sticky;
        top: 16px;
      }

      .sidebar h2,
      .doc h2 {
        margin: 0 0 12px;
        font-size: 1.05rem;
      }

      .meta {
        display: grid;
        gap: 10px;
        margin-bottom: 18px;
        color: var(--muted);
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .meta code,
      .doc code {
        background: var(--accent-soft);
        color: var(--accent);
        padding: 0.18rem 0.4rem;
        border-radius: 999px;
        font-size: 0.9em;
      }

      .links {
        display: grid;
        gap: 10px;
      }

      .links a {
        color: var(--accent);
        text-decoration: none;
        font-weight: 600;
      }

      .doc {
        padding: 20px;
        overflow: hidden;
      }

      .summary {
        margin: 0 0 16px;
        color: var(--muted);
        line-height: 1.6;
      }

      .path-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 10px;
      }

      .path-list li {
        display: flex;
        gap: 12px;
        align-items: baseline;
        padding: 12px 14px;
        background: rgba(19, 35, 58, 0.03);
        border-radius: 16px;
      }

      .path-list span {
        min-width: 124px;
        color: var(--accent);
        font-weight: 700;
        font-size: 0.9rem;
      }

      .path-list code {
        display: block;
        padding: 0;
        background: transparent;
        color: var(--text);
        word-break: break-word;
        white-space: normal;
      }

      #redoc {
        min-height: 720px;
        margin-top: 18px;
      }

      .note {
        margin-top: 18px;
        color: var(--muted);
        font-size: 0.92rem;
        line-height: 1.6;
      }

      @media (max-width: 980px) {
        .grid {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: static;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="hero">
        <div class="eyebrow">API documentation</div>
        <h1>RH Cursos API</h1>
        <p class="subtitle">
          Documento estático gerado a partir de <code>docs/api/openapi.yaml</code>.
          A spec continua sendo a fonte de verdade; esta página apenas publica e
          organiza o contrato para navegação humana.
        </p>
      </header>

      <div class="grid">
        <aside class="panel sidebar">
          <h2>Canônico</h2>
          <div class="meta">
            <div><strong>Spec:</strong> <code>docs/api/openapi.yaml</code></div>
            <div><strong>Build:</strong> <code>npm run docs:api:build</code></div>
            <div><strong>Lint:</strong> <code>npm run docs:api:lint</code></div>
            <div><strong>Drift gate:</strong> <code>npm run docs:api:check-drift</code></div>
          </div>
          <div class="links">
            <a href="/docs/api/README.md">API docs</a>
            <a href="/docs/api/openapi.yaml">OpenAPI YAML</a>
            <a href="/README.md">Project README</a>
          </div>
        </aside>

        <section class="panel doc">
          <h2>Superfície publicada</h2>
          <p class="summary">
            O resumo abaixo é derivado diretamente da spec versionada. O componente
            ReDoc tenta carregar em seguida para navegação completa.
          </p>
          <ul class="path-list">${pathSummaries}</ul>
          <div id="redoc"></div>
          <p class="note">
            Se o carregamento do bundle remoto falhar, o resumo canônico acima
            continua visível e o arquivo permanece rastreável por build.
          </p>
        </section>
      </div>
    </main>

    <script id="api-spec" type="application/json">${specJson}</script>
    <script>
      (function () {
        const spec = JSON.parse(document.getElementById("api-spec").textContent);
        const script = document.createElement("script");
        script.src = "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";
        script.async = true;
        script.onload = function () {
          if (window.Redoc) {
            window.Redoc.init(spec, { hideDownloadButton: false, scrollYOffset: 72 }, document.getElementById("redoc"));
          }
        };
        script.onerror = function () {
          const redoc = document.getElementById("redoc");
          redoc.innerHTML = "<p style='margin:0;color:#516173'>ReDoc indisponível no momento. Consulte a spec em <code>docs/api/openapi.yaml</code>.</p>";
        };
        document.head.appendChild(script);
      })();
    </script>
  </body>
</html>
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);

console.log(`✅ API docs geradas em ${outputPath}`);
