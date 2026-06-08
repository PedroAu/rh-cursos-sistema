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

## Limitações

⚠️ Sem servidor backend (APIs dinâmicas)
⚠️ Conteúdo estático apenas
⚠️ Sem autenticação de servidor
⚠️ Sem acesso a banco de dados

Se precisar de funcionalidades dinâmicas, considere:
- APIs externas (Supabase, Firebase, etc)
- Alternativas: Vercel, Netlify, Render
