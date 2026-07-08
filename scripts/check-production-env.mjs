#!/usr/bin/env node

const REQUIRED_VARS = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "URL pública do projeto Supabase",
    validate(value) {
      return /^https?:\/\//i.test(value);
    }
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    description: "Anon/publishable key do Supabase",
    validate(value) {
      return value.length >= 20;
    }
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    description: "URL pública do app",
    validate(value) {
      return /^https?:\/\//i.test(value);
    }
  },
  {
    name: "AUTH_SESSION_SECRET",
    description: "Segredo de sessão",
    validate(value) {
      return value.length >= 32;
    }
  }
];

const PLACEHOLDER_PATTERNS = [
  /example\.supabase\.co/i,
  /your-project-ref/i,
  /your-secure-password/i,
  /your-32-char-secret-key-here/i,
  /placeholder/i,
  /change-me/i,
  /seu-projeto/i,
  /seu-segredo/i
];

function fail(message) {
  console.error(`\n❌ ${message}`);
  process.exit(1);
}

function isPlaceholder(value) {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

const issues = [];

for (const entry of REQUIRED_VARS) {
  const value = (process.env[entry.name] ?? "").trim();

  if (!value) {
    issues.push(`- ${entry.name}: ausente (${entry.description})`);
    continue;
  }

  if (isPlaceholder(value) || !entry.validate(value)) {
    issues.push(`- ${entry.name}: valor inválido ou placeholder (${entry.description})`);
  }
}

if (issues.length > 0) {
  fail([
    "Configuração de produção incompleta. Defina as variáveis abaixo no deploy frontend:",
    ...issues,
    "",
    "Corrija os secrets/variáveis no GitHub Actions ou no provedor do Worker e tente novamente."
  ].join("\n"));
}

console.log("✅ Ambiente de produção validado: Supabase e auth estão configurados.");
