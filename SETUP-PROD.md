# Setup Simples - Produção

## Opção 1: Via SSH (MAIS FÁCIL - Recomendado)

Se você tem acesso SSH ao servidor:

```bash
cd /app
bash scripts/setup-prod.sh
```

Pronto! O script vai:
1. Instalar Node.js (se necessário)
2. Instalar dependências (`npm ci`)
3. Fazer build da aplicação (`npm run build`)
4. Iniciar a aplicação (`npm start`)

---

## Opção 2: Sem PHP, Apenas Node.js

Se o servidor não tem PHP funcionando:

### 2a. Instalar Node.js (se não tiver)
```bash
cd /app
bash install-node.sh
```

### 2b. Instalar dependências
```bash
cd /app
./.node/bin/npm ci --only=production
```

### 2c. Iniciar a aplicação
```bash
cd /app
./.node/bin/npm start
```

---

## Opção 3: Verificação Rápida

Verifique se o Node.js está rodando:

```bash
ps aux | grep "npm start"
```

Se ver `npm start` na lista, a aplicação está rodando! ✅

---

## Logs

Verifique os logs em:
```bash
cat /tmp/app.log
```

---

## Porta

A aplicação roda na **porta 3000** por padrão. Verifique com:
```bash
netstat -tlnp | grep 3000
```

Se a Locaweb usa outra porta, configure `PORT=xxxx npm start`.
