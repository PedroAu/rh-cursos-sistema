# Story: Aplicar marca e dados reais da RH Cursos

## Status
Ready for Review

## Contexto
O site em publicacao deve usar a logo real da RH Cursos, favicon da marca e dados institucionais reais nos pontos de contato e identidade visual.

## Acceptance Criteria
- [x] Aplicar a logo real nos espacos destinados a marca.
- [x] Criar favicon e icones da aplicacao a partir da logo.
- [x] Substituir placeholders de telefone, WhatsApp, e-mail, CNPJ e endereco por dados reais da RH Cursos.
- [x] Rodar `npm run lint`.
- [x] Rodar `npm run typecheck`.
- [x] Rodar `npm run build`.

## Dev Notes
- Fonte dos dados publicos: site oficial da RH Cursos e cadastros publicos consultados em 04/06/2026.
- A logo foi copiada do arquivo local indicado pelo usuario.

## File List
- `app/icon.png`
- `app/apple-icon.png`
- `app/layout.tsx`
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/images/brand/rh-cursos-logo-azul.png`
- `src/lib/company.ts`
- `src/lib/app-store.tsx`
- `src/components/layout/public-layout.tsx`
- `src/components/layout/dashboard-shell.tsx`
- `src/views/public/Contact.tsx`
- `src/views/public/About.tsx`
