# Deploy Estático - Hospedagem Locaweb

## Como Funciona

O Next.js agora está configurado para fazer **export estático**:
- Gera arquivos HTML/CSS/JS puros (sem Node.js necessário)
- Compatível com qualquer hospedagem HTTP
- Sem necessidade de runtime Node.js

## Passos para Deploy

### 1. Build Local (seu computador)

```bash
npm run build
```

Isso vai gerar a pasta `out/` com todos os arquivos estáticos.

### 2. Upload via FTP

Faça upload da pasta `out/` para a Locaweb:

```bash
# Via FTP client (FileZilla, etc)
Local: ./out/*
Remote: /home/rhcursos2/public_html/
```

### 3. Pronto!

Acesse: `https://www.rhcursos.com.br`

## Arquivos Deployados

```
/home/rhcursos2/public_html/
├── index.html          (página inicial)
├── courses/
│   └── index.html      (página de cursos)
├── admin/
│   └── index.html      (área administrativa)
├── _next/              (assets otimizados)
├── public/             (imagens, fontes, etc)
└── ... (outros arquivos estáticos)
```

## Vantagens

✅ Sem Node.js
✅ Funciona em qualquer hospedagem
✅ Muito rápido (arquivos estáticos)
✅ Sem dependências no servidor
✅ FTP simples

## Backend no modelo híbrido

O frontend é estático, mas o backend **não** foi descartado: as operações
dinâmicas (leads, inscrições, login admin e mutações administrativas) são
servidas por **Supabase Edge Functions**.

➡️ Ver [DEPLOY-HYBRID.md](DEPLOY-HYBRID.md) para a arquitetura completa,
as 4 functions e o processo de deploy do backend.

> As antigas rotas `app/api/*` não funcionam no export estático (são
> descartadas no build) — por isso a lógica vive nas Edge Functions.
