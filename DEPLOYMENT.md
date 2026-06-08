# Deployment — Site RH Cursos

> ⚠️ **Documento reorganizado.** A estratégia antiga (servidor Node via
> `server.js`/`install-node.sh`/`deploy.php` na Locaweb) foi **descontinuada**.

A arquitetura atual é **híbrida**:

- **Frontend**: Next.js em export estático, publicado na Locaweb via FTP.
- **Backend**: Supabase Edge Functions (leads, inscrições, auth admin, mutações).

## Guias

| Documento | Conteúdo |
|-----------|----------|
| [DEPLOY-STATIC.md](DEPLOY-STATIC.md) | Build estático + upload FTP para a Locaweb |
| [DEPLOY-HYBRID.md](DEPLOY-HYBRID.md) | Arquitetura híbrida + deploy das Edge Functions |
| [DNS-SETUP.md](DNS-SETUP.md) | Configuração de DNS |
| [SETUP-PROD.md](SETUP-PROD.md) | Variáveis e setup de produção |

## Pipelines

- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) — build estático → FTP Locaweb
- [.github/workflows/deploy-functions.yml](.github/workflows/deploy-functions.yml) — Edge Functions → Supabase
