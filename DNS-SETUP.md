# Configuração DNS - rhcursos.com.br

**Data:** 2026-06-07  
**Domínio:** rhcursos.com.br  
**Provedor Hospedagem:** Locaweb  
**IP do Servidor:** 187.45.240.111  
**Registrador:** Registro.br

---

## ✅ Checklist de Configuração

- [ ] **Passo 1:** Apontar nameservers no Registro.br para Locaweb
- [ ] **Passo 2:** Configurar registros DNS na Locaweb
- [ ] **Passo 3:** Verificar propagação DNS
- [ ] **Passo 4:** Configurar SSL/HTTPS (Let's Encrypt)
- [ ] **Passo 5:** Testar acesso ao site

---

## 🔧 Passo 1: Apontar Nameservers no Registro.br

### Instruções:

1. Acesse **[sistema.registro.br](https://sistema.registro.br)**
2. Faça login com suas credenciais
3. Selecione o domínio **rhcursos.com.br**
4. Clique em **"Editar zona de DNS"** ou **"Configurar Nameservers"**
5. Remova nameservers antigos (se houver)
6. Adicione os nameservers da Locaweb:

```
ns1.locaweb.com.br
ns2.locaweb.com.br
```

7. **Salve as alterações**

⏱️ **Tempo de propagação:** 24-48 horas (pode ser mais rápido)

---

## 🔧 Passo 2: Configurar Registros DNS na Locaweb

Depois que o domínio aponta para Locaweb (Passo 1), configure:

### Acessar painel Locaweb:

1. Entre em **Painel Locaweb** → Seção **Hospedagem**
2. Localize seu domínio **rhcursos.com.br**
3. Clique em **"Gerenciar DNS"** ou **"Editar Zona DNS"**

### Registros a configurar:

| Tipo | Nome/Host | Valor | TTL | Observação |
|------|-----------|-------|-----|-----------|
| **A** | @ | 187.45.240.111 | 3600 | Raiz do domínio |
| **A** | www | 187.45.240.111 | 3600 | Subdomínio www |
| **MX** | @ | mail.locaweb.com.br | 3600 | Prioridade: 10 |
| **TXT** | @ | v=spf1 include:locaweb.com.br ~all | 3600 | SPF (opcional, para email) |

### ⚠️ Importante:

- **Não use CNAME** para a raiz (@) — use apenas **A record**
- Se houver conflito entre www e raiz, deixe **apenas o A record do @**
- A Locaweb geralmente já configura MX automaticamente

---

## 🔍 Passo 3: Verificar Propagação DNS

Aguarde algumas horas e teste com estes comandos:

```bash
# Verificar propagação global
# Acesse: https://www.whatsmydns.net/?q=rhcursos.com.br

# Ou via terminal (macOS/Linux):

# Verificar A record (raiz)
dig rhcursos.com.br +short
# Esperado: 187.45.240.111

# Verificar www
dig www.rhcursos.com.br +short
# Esperado: 187.45.240.111

# Verificar nameservers
nslookup -type=NS rhcursos.com.br
# Esperado: ns1.locaweb.com.br, ns2.locaweb.com.br

# Verificar MX (email)
dig rhcursos.com.br MX +short
# Esperado: 10 mail.locaweb.com.br
```

---

## 🔒 Passo 4: Configurar SSL/HTTPS (Let's Encrypt)

A Locaweb geralmente oferece **SSL gratuito via Let's Encrypt**.

### Na Locaweb:

1. Painel → Seu domínio
2. Procure por **"Certificado SSL"** ou **"HTTPS"**
3. Clique em **"Instalar certificado Let's Encrypt"** (gratuito)
4. Selecione:
   - [x] rhcursos.com.br
   - [x] www.rhcursos.com.br
5. Solicite e aguarde instalação (geralmente 15-30 minutos)

### Redirecionamento automático:

Após SSL instalado, configure redirecionamento de HTTP → HTTPS:

1. No painel Locaweb, localize **"Redirecionamentos"** ou **.htaccess**
2. Adicione regra para forçar HTTPS:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## ✅ Passo 5: Testar Acesso ao Site

Após conclusão dos passos anteriores:

```bash
# 1. Verificar conectividade
curl -I https://rhcursos.com.br
# Esperado: HTTP/2 200

# 2. Verificar www
curl -I https://www.rhcursos.com.br
# Esperado: HTTP/2 200 (ou redirecionado)

# 3. Verificar certificado SSL
openssl s_client -connect rhcursos.com.br:443
# Procure por "CN = rhcursos.com.br"
```

---

## 🚨 Troubleshooting

### Domínio não resolve:

```bash
# Verificar se nameservers foram atualizados
nslookup -type=NS rhcursos.com.br 8.8.8.8

# Se ainda apontar para nameservers antigos:
# - Aguarde mais tempo (até 48h)
# - Ou limpe cache DNS:
#   macOS: sudo dscacheutil -flushcache
#   Linux: sudo systemctl restart systemd-resolved
```

### HTTPS não funciona:

- Verifique se certificado foi instalado (Painel Locaweb)
- Aguarde propagação do DNS (24h)
- Teste com: `https://www.ssl-checker.com/sslchecker`

### Email não funciona:

- Verifique MX record
- Configura SPF no Registro.br (TXT record)

---

## 📅 Timeline Esperada

| Ação | Tempo |
|------|-------|
| Alteração nameservers (Registro.br) | Imediato (processamento 24-48h) |
| Propagação DNS global | 24-48 horas |
| SSL/HTTPS ativo | 15-30 minutos após instalação |
| **Site completamente online** | **~48 horas** |

---

## 📞 Suporte

Se encontrar problemas:

- **Locaweb:** suporte@locaweb.com.br | Chat no painel
- **Registro.br:** https://www.registro.br/suporte
- **DNS global:** https://www.whatsmydns.net/

---

**Próximos passos após DNS ativo:**
1. ✅ Testar acesso ao site
2. ✅ Configurar email (se necessário)
3. ✅ Monitorar uptime/performance
4. ✅ Configurar backup automático (Locaweb oferece)
