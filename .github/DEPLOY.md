# 🚀 Configuração de Deploy Automático (GitHub Actions → Locaweb SSH)

## 📋 Pré-requisitos

1. **Acesso SSH ao servidor Locaweb**
   - Host FTP/SSH da Locaweb
   - Usuário SSH
   - Chave privada SSH (RSA)

2. **PM2 instalado no servidor**
   ```bash
   npm install -g pm2
   ```

3. **Estrutura de diretórios no servidor**
   ```
   ~/app/                    # Diretório da aplicação
   ~/backups/                # Diretórios de backup
   ~/.ssh/authorized_keys    # Chaves públicas configuradas
   ```

## 🔐 Configuração de Secrets no GitHub

### 1. Gere uma chave SSH (se ainda não tiver)
```bash
ssh-keygen -t rsa -b 4096 -f deploy_key -N ""
```

### 2. Copie a chave pública para o servidor
```bash
cat deploy_key.pub | ssh usuario@host.locaweb.com.br 'cat >> ~/.ssh/authorized_keys'
```

### 3. Adicione os Secrets no GitHub
Vá para: `https://github.com/seu-usuario/seu-repositorio/settings/secrets/actions`

Clique em **"New repository secret"** e adicione:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `SSH_HOST` | `seu-host.locaweb.com.br` | Host SSH/FTP da Locaweb |
| `SSH_USER` | `seu_usuario` | Usuário SSH |
| `SSH_PRIVATE_KEY` | Conteúdo de `deploy_key` | Chave privada RSA (cat deploy_key) |

### 4. Configure o ambiente de produção (opcional, mas recomendado)
Vá para: `https://github.com/seu-usuario/seu-repositorio/settings/environments`

Crie um novo environment chamado `production` com:
- Deployment branches: `main`
- Required reviewers: (opcional - para aprovar deploys)

## 📊 O que o Workflow Faz

### Build & Test (Ubuntu)
- ✅ Faz checkout do código
- ✅ Instala dependências
- ✅ Executa type check
- ✅ Executa linting
- ✅ Faz build da aplicação
- ✅ Armazena artifacts de build

### Deploy (SSH para Locaweb)
1. **Backup**
   - Cria backup completo antes de fazer deploy
   - Mantém os últimos 10 backups
   - Localização: `~/backups/backup-YYYYMMDD-HHMMSS/`

2. **Deploy**
   - Faz pull do código mais recente
   - Instala dependências
   - Faz build
   - Para a aplicação gracefully com PM2
   - Reinicia com PM2
   - Valida que a build foi criada

3. **Health Check**
   - Espera 5 segundos para a app iniciar
   - Testa curl em `http://localhost:3000`
   - Mostra status final do PM2

4. **Limpeza**
   - Remove backups antigos (mantém últimos 10)
   - Exibe status final da aplicação

## 🔍 Monitorar Deploys

### No GitHub
- Vá para a aba **"Actions"** do repositório
- Clique no workflow "Deploy to Locaweb"
- Veja os logs em tempo real

### No Servidor
```bash
# Ver logs da aplicação
pm2 logs site-rh-cursos

# Ver status
pm2 list

# Ver histórico de backups
ls -lh ~/backups/
```

## 🆘 Troubleshooting

### SSH Connection Timeout
**Erro:** `Connection timed out`
- Verifique se o host SSH está correto
- Confira se a porta SSH está aberta (padrão: 22)

### Permission Denied
**Erro:** `Permission denied (publickey)`
- Verifique se a chave pública está em `~/.ssh/authorized_keys`
- Confirme permissões: `chmod 600 ~/.ssh/authorized_keys`

### Build Fails
**Erro:** `npm run build` falha no servidor
- Execute manualmente: `cd ~/app && npm run build`
- Verifique dependências: `npm list`
- Confira espaço em disco: `df -h`

### Health Check Fails
**Erro:** `curl: (7) Failed to connect`
- Verifique se a app está rodando: `pm2 list`
- Veja logs: `pm2 logs site-rh-cursos`
- Confira se está listening em `:3000`

### Revert para Backup Anterior
```bash
# Listar backups
ls -lh ~/backups/

# Restaurar
rm -rf ~/app/*
cp -r ~/backups/backup-YYYYMMDD-HHMMSS/* ~/app/
cd ~/app
npm ci
npm run build
pm2 restart site-rh-cursos
```

## 📝 Customização

### Mudar porta da aplicação
No arquivo `deploy.yml`, procure:
```yaml
if curl -f http://localhost:3000 > /dev/null 2>&1; then
```
Mude `:3000` para a porta correta.

### Mudar diretório da aplicação
No arquivo `deploy.yml`, procure:
```bash
APP_DIR="~/app"
```
Mude para o caminho correto no seu servidor.

### Mudar nome da aplicação PM2
No arquivo `deploy.yml`, procure:
```bash
pm2 restart site-rh-cursos
```
Mude `site-rh-cursos` para o nome da sua aplicação.

### Disparar deploy manualmente
Vá para a aba **"Actions"** → **"Deploy to Locaweb"** → **"Run workflow"** → **"Run workflow"**

## 🔒 Segurança

- ✅ Chaves privadas armazenadas como Secrets do GitHub (criptografadas)
- ✅ SSH usa autenticação por chave (não senha)
- ✅ Backups automáticos antes de cada deploy
- ✅ Health checks validam deploy bem-sucedido
- ✅ Apenas branch `main` faz deploy automático

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Locaweb Help Center](https://ajuda.locaweb.com.br/)
