# 🎨 Plano de Refatoração de Design — Trust Keith System
**Objetivo:** Implementar completamente o design system Trust Keith com máxima economia de tokens

---

## 📊 Estado Atual vs. Alvo

| Aspecto | Atual | Alvo | Status |
|---------|-------|------|--------|
| **Colors** | Híbrido (EA + novos) | Trust Keith (teal/blue) | ⚠️ Parcial |
| **Typography** | Material Design 3 | Trust Keith (Quincy/Merriweather/Inter) | ⚠️ Parcial |
| **Components** | Material + custom | Trust Keith unified | ⚠️ Em Progresso |
| **Tokens** | ~150 variáveis | ~80 variáveis (otimizado) | 🔴 Não iniciado |
| **Cobertura** | ~40% do projeto | 100% do projeto | 🔴 Não iniciado |

---

## 🎯 Fase 1: Consolidação de Tokens (Semana 1)

### 1.1 Refatorar `tokens.tailwind.js` para Trust Keith

**Novo arquivo:** `src/design-tokens/tokens.tailwind.js`

```javascript
export const tokens = {
  // CORES — Palette Trust Keith completa
  colors: {
    // Brand (Teal-Navy)
    'trust-keith-teal': '#235875',
    'keith-dark-blue': '#194359',
    
    // UI (Bright Blue)
    'bright-blue': '#4285f4',
    'bright-blue-dark': '#2459b3',
    
    // Neutrals (7-step scale)
    'text-primary': '#222525',      // h1-h4, body
    'text-secondary': '#4f5057',    // muted labels
    'surface-light': '#fafafa',     // subtle backgrounds
    'surface-neutral': '#ebebeb',   // nav, borders, dividers
    'surface-white': '#ffffff',     // cards, primary surface
    
    // Semantic
    'success': '#068466',
    'danger': '#ea384c',
    'error': '#ea384c',
    
    // Warm Accents
    'cream-light': '#fffaf4',
    'cream-dark': '#c3b6aa',
    
    // Legacy (kept for gradual migration)
    // ... existing EA tokens mapped to equivalents
  },

  // TYPOGRAPHY — Trust Keith hierarchy
  fontSize: {
    // Display (Quincy CF 700)
    'display-hero': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-large': ['2.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
    'section-heading': ['2rem', { lineHeight: '1.25' }],
    
    // Subheading (Merriweather 300/400)
    'subheading-large': ['1.5rem', { lineHeight: '1.35', fontFamily: 'Merriweather' }],
    'subheading': ['1.25rem', { lineHeight: '1.4', fontFamily: 'Merriweather' }],
    
    // Body (Inter 400)
    'body-large': ['1.0625rem', { lineHeight: '1.45' }],
    'body': ['1rem', { lineHeight: '1.5' }],
    'body-small': ['0.875rem', { lineHeight: '1.4' }],
    
    // UI (Inter 500)
    'button': ['0.875rem', { lineHeight: '1.2', fontWeight: '500' }],
    'button-small': ['0.75rem', { lineHeight: '1.1', fontWeight: '500' }],
    'link': ['0.875rem', { lineHeight: '1.2', fontWeight: '500' }],
    
    // Captions (Inter 400)
    'caption': ['0.75rem', { lineHeight: '1.2' }],
    'caption-small': ['0.6875rem', { lineHeight: '1.1' }],
  },

  fontFamily: {
    'sans': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    'serif': 'Merriweather, Georgia, serif',
    'display': 'Quincy CF, serif',
  },

  fontWeight: {
    'light': '300',
    'normal': '400',
    'medium': '500',
    'bold': '700',
  },

  // SPACING — 4px base unit
  spacing: {
    'xs': '0.25rem',   // 4px
    'sm': '0.5rem',    // 8px
    'md': '1rem',      // 16px
    'lg': '1.5rem',    // 24px
    'xl': '2rem',      // 32px
    '2xl': '3rem',     // 48px
    '3xl': '4rem',     // 64px
  },

  // BORDER RADIUS — Trust Keith scale
  borderRadius: {
    'none': '0px',
    'input': '0px',        // Utilitarian inputs
    'button': '6px',       // Functional buttons
    'glass': '16px',       // Glass card variant
    'card': '24px',        // Primary cards
    'pill': '100rem',      // Badges, fully rounded
  },

  // SHADOWS — Dual-layer glass effect
  boxShadow: {
    'none': 'none',
    'ambient': '0 4px 16px rgba(0, 0, 0, 0.08)',  // Glass variant
    'standard': '0 2px 16px rgba(0, 0, 0, 0.02), 0 16px 64px rgba(0, 0, 0, 0.5)',  // Primary cards
    'focus': '0.125rem solid #4d65ff',  // Focus ring (bright blue)
  },

  // LINE HEIGHT
  lineHeight: {
    'tight': '1.1',
    'snug': '1.2',
    'normal': '1.4',
    'relaxed': '1.5',
    'loose': '1.6',
  },
};

export default tokens;
```

**Ações:**
- [ ] Backup do arquivo atual: `cp src/design-tokens/tokens.tailwind.js src/design-tokens/tokens.tailwind.old.js`
- [ ] Escrever novo arquivo com mapeamento Trust Keith
- [ ] Testar compilação Tailwind
- [ ] Audit de cores não utilizadas no novo sistema

**Impacto de tokens:** 150 → **80 tokens** (-47%)

---

### 1.2 Atualizar `tailwind.config.ts` para usar Trust Keith

**Arquivo:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";
import tokens from './src/design-tokens/tokens.tailwind.js'

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  
  theme: {
    container: {
      center: true,
      padding: tokens.spacing,
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      }
    },
    
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      lineHeight: tokens.lineHeight,
    }
  },
  
  plugins: []
};

export default config;
```

**Ações:**
- [ ] Remover tokens legados (EA) não mapeados
- [ ] Manter container padding usando tokens
- [ ] Verificar import path está correto

---

### 1.3 Gerar `globals.css` com CSS Variables

**Arquivo:** `src/styles/globals.css`

```css
/* Trust Keith Design System — Global CSS Variables */

:root {
  /* Colors */
  --color-trust-keith-teal: #235875;
  --color-keith-dark-blue: #194359;
  --color-bright-blue: #4285f4;
  --color-bright-blue-dark: #2459b3;
  
  --color-text-primary: #222525;
  --color-text-secondary: #4f5057;
  
  --color-surface-white: #ffffff;
  --color-surface-neutral: #ebebeb;
  --color-surface-light: #fafafa;
  
  --color-success: #068466;
  --color-danger: #ea384c;
  
  --color-cream-light: #fffaf4;
  --color-cream-dark: #c3b6aa;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Merriweather', Georgia, serif;
  --font-display: 'Quincy CF', serif;
  
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  
  /* Border Radius */
  --radius-input: 0px;
  --radius-button: 6px;
  --radius-glass: 16px;
  --radius-card: 24px;
  --radius-pill: 100rem;
  
  /* Shadows */
  --shadow-ambient: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-standard: 0 2px 16px rgba(0, 0, 0, 0.02), 0 16px 64px rgba(0, 0, 0, 0.5);
  
  /* Depth Levels */
  --z-dropdown: 1000;
  --z-sticky: 100;
  --z-modal: 2000;
  --z-toast: 3000;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Typography Hierarchy */
h1, .display-hero {
  font-family: var(--font-display);
  font-size: 3.75rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

h2, .display-large {
  font-family: var(--font-display);
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h3, .section-heading {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.25;
}

h4, .subheading-large {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1.35;
}

body {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-text-primary);
  background-color: var(--color-surface-white);
}

small, .caption, .caption-small {
  font-size: 0.75rem;
  line-height: 1.2;
  color: var(--color-text-secondary);
}

/* Common Utilities */
.surface-card {
  background: var(--color-surface-white);
  border: 1px solid var(--color-surface-neutral);
  border-radius: var(--radius-card);
  padding: 2rem;
  box-shadow: var(--shadow-standard);
}

.button-primary {
  background: var(--color-trust-keith-teal);
  color: white;
  padding: 1.25rem 1.25rem;
  border-radius: var(--radius-button);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button-primary:hover {
  background: var(--color-keith-dark-blue);
}

.button-primary:focus-visible {
  outline: var(--shadow-focus);
}

/* Link Styling */
a {
  color: var(--color-bright-blue);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-bright-blue-dark);
}

a:focus-visible {
  outline: 2px solid var(--color-bright-blue);
  outline-offset: 2px;
}
```

**Ações:**
- [ ] Criar arquivo novo com todas as variáveis
- [ ] Verificar que não há conflitos com estilos existentes
- [ ] Testar compilação CSS

---

## 🏗️ Fase 2: Refatoração de Componentes (Semanas 2-3)

### 2.1 Componentes Base (Atomic Design)

**Priority:** HIGH

Componentes a criar/refatorar:
- `src/components/ui/Button.tsx` — Primary, Secondary, Ghost, Danger
- `src/components/ui/Card.tsx` — Standard, Glass variant
- `src/components/ui/Input.tsx` — Text input com Trust Keith styling
- `src/components/ui/Badge.tsx` — Status badges, pills
- `src/components/ui/Typography.tsx` — Heading, Paragraph, Caption wrappers
- `src/components/ui/Link.tsx` — Styled links com estados de foco

**Economia esperada:** 40 componentes duplicados → **10 componentes base reutilizáveis**

**Exemplo:** `Button.tsx`

```typescript
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  [key: string]: any;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const variantClass = {
    primary: 'bg-trust-keith-teal text-white hover:bg-keith-dark-blue',
    secondary: 'bg-surface-neutral text-text-primary hover:bg-opacity-80 border border-surface-neutral',
    ghost: 'text-text-primary hover:opacity-75',
    danger: 'bg-danger text-white hover:bg-opacity-90',
  }[variant];
  
  const sizeClass = {
    sm: 'px-3 py-2 text-button-small rounded-button',
    md: 'px-5 py-3 text-button rounded-button',
    lg: 'px-6 py-4 text-body rounded-button',
  }[size];
  
  return (
    <button 
      className={`${variantClass} ${sizeClass} font-medium transition-colors focus-visible:outline-2 outline-offset-2 outline-bright-blue ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

**Ações:**
- [ ] Criar biblioteca de componentes base
- [ ] Documentar cada componente com exemplos
- [ ] Testar acessibilidade (a11y)
- [ ] Adicionar variantes de estado (hover, focus, disabled, loading)

---

### 2.2 Layout Components

**Priority:** HIGH

- `Header.tsx` — Nav bar com Trust Keith styling
- `Card.tsx` — Primary + Glass variants
- `Container.tsx` — Max-width wrapper com spacing
- `Section.tsx` — Spacing logic para seções
- `Grid.tsx` — Responsive grid (3-col desktop, 2-col tablet, 1-col mobile)

**Ações:**
- [ ] Mapear componentes layout existentes
- [ ] Refatorar para usar tokens
- [ ] Testar responsividade

---

### 2.3 Form Components

**Priority:** MEDIUM

- `FormField.tsx` — Label, input, error, hint (reutilizável)
- `TextInput.tsx` — Email, text, password
- `Select.tsx` — Dropdown com keyboard navigation
- `Textarea.tsx` — Multi-line input
- `Checkbox.tsx` e `Radio.tsx` — Form controls

**Ações:**
- [ ] Verificar componentes de formulário existentes
- [ ] Adicionar suporte a erro inline
- [ ] Testar com screen readers

---

## 📄 Fase 3: Aplicação em Páginas (Semanas 3-4)

### 3.1 Public Pages

**Files to refactor:**

```
src/views/public/
  ├── Home.tsx
  ├── Cursos.tsx
  ├── Agenda.tsx
  ├── Blog.tsx
  ├── InCompany.tsx
  ├── Contato.tsx
  └── Login.tsx
```

**Checklist por página:**
- [ ] Replace placeholders com labels persistentes
- [ ] Aplicar Trust Keith spacing (padding, margins)
- [ ] Usar componentes base reutilizáveis
- [ ] Testar responsividade (mobile-first)
- [ ] Verificar contraste WCAG AA
- [ ] Rodar `npm run lint` e `npm run typecheck`

#### 3.1.1 Home 100/100

**Fonte de referência:** `public/images/RH Cursos Home.html`

**Objetivo:** a Home deve atingir paridade visual e funcional com o HTML de referência, cobrindo hero, blocos intermediários, CTA final e a relação entre conteúdo e shell público.

**Escopo obrigatório da Home:**
1. Hero com badge, headline, subtítulo, dois CTAs, chips de apoio e card lateral de próximas turmas.
2. Bloco de diferenciais.
3. Bloco de trilhas de conhecimento.
4. Bloco de formatos de atendimento.
5. Bloco de processo em 3 passos.
6. Bloco de credibilidade/prova social.
7. FAQ.
8. CTA final.

**Critério de 100/100 para a Home:**
- A composição geral da página reproduz a hierarquia do mock, não apenas a primeira dobra.
- A largura útil, espaçamentos, blocos, bordas e pesos visuais batem com o HTML de referência em desktop.
- O mobile preserva a mesma ordem de narrativa sem overflow, sobreposição ou cards comprimidos.
- A copy final da Home é de produto e conversão; nenhum bloco exibe texto de bastidor sobre a própria implementação.
- Os dados dinâmicos continuam vindo de `useAppStore`, mas o layout não depende de placeholders visuais.
- Header e footer entram no critério quando interferem diretamente na fidelidade da Home, já que o mock mostra a navegação completa.

**Validação exigida:**
- Screenshot desktop da Home completa.
- Screenshot mobile da Home completa.
- Snapshot do hero continua existindo, mas deixa de ser o único gate visual.
- Comparação manual contra `public/images/RH Cursos Home.html` antes de aceitar o resultado como concluído.
- `npm run lint`, `npm run typecheck`, `npm run build` e smoke test das rotas públicas continuam verdes.

**Exemplo de refatoração:**

**Antes:**
```tsx
<input type="email" placeholder="Seu email" />
<button className="bg-blue-500 px-4 py-2 rounded">Enviar</button>
```

**Depois:**
```tsx
<FormField label="Email" required>
  <TextInput type="email" placeholder="exemplo@email.com" />
</FormField>
<Button variant="primary">Enviar</Button>
```

---

### 3.2 Admin Pages

**Files to refactor:**

```
src/views/admin/
  ├── AdminResourcePage.tsx
  ├── AdminDashboard.tsx
  └── admin/
      └── data-table.tsx
```

**Ações:**
- [ ] Padronizar tabelas com Trust Keith
- [ ] Melhorar densidade visual com tokens
- [ ] Aplicar estados de loading/skeleton
- [ ] Testar com dados reais

---

## 🎯 Fase 4: Quality Gates & Deployment (Semana 4)

### 4.1 Testing

**Command:** `npm run test`

- [ ] Componentes renderizam corretamente
- [ ] Tokens aplicados ao DOM
- [ ] Estados (hover, focus, disabled) funcionam
- [ ] Responsividade em breakpoints

**Command:** `npm run typecheck`

- [ ] TypeScript sem erros
- [ ] Props de componentes tipadas

**Command:** `npm run lint`

- [ ] ESLint passou
- [ ] Nenhuma classe Tailwind duplicada
- [ ] CSS sem valores hardcoded

---

### 4.2 Visual Review

**Checklist:**
- [ ] Desktop (1280px+) — alinhamento, spacing, tipografia
- [ ] Tablet (768px-1024px) — reflow, navegação
- [ ] Mobile (<768px) — touch targets 44px+, padding 16px

**Color Contrast:**
- [ ] WCAG AA em todas as combinações de text/background
- [ ] Ferramenta: https://webaim.org/resources/contrastchecker/

**Keyboard Navigation:**
- [ ] Tab order lógico
- [ ] Focus ring visível (bright blue `#4d65ff`)
- [ ] Modais fecham com ESC
- [ ] Skip link funciona

---

### 4.3 Deployment

```bash
# 1. Verify everything locally
npm run build
npm run test
npm run lint
npm run typecheck

# 2. Create PR with changes
git checkout -b refactor/trust-keith-design
git add .
git commit -m "refactor: implement Trust Keith design system"
git push origin refactor/trust-keith-design

# 3. QA review and merge
# 4. Deploy to production
```

---

## 📈 Economia de Tokens

| Métrica | Antes | Depois | Economia |
|---------|-------|--------|----------|
| **CSS Variables** | 150+ | 80 | **-47%** |
| **Tailwind Config** | 120 tokens | 40 tokens | **-67%** |
| **Component Types** | 40+ | 10 base + variants | **-75%** |
| **CSS File Size** | ~45KB | ~28KB | **-38%** |
| **Build Time** | ~3.2s | ~2.1s | **-34%** |
| **Maintenance** | 40+ files | 15 files | **-62%** |

---

## 🚨 Riscos & Mitigações

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| Regressão visual | ALTA | Screenshotting baseline, visual diff tools |
| Componentes antigos quebram | ALTA | Keep old components in `legacy/` durante transição |
| Performance issues | MÉDIA | Audit CSS file size, bundle analysis |
| Accessibilidade reduz | MÉDIA | Playwright a11y tests, manual audit |

---

## ✅ Success Criteria

1. ✅ Todos os componentes reutilizam tokens Trust Keith
2. ✅ Nenhuma classe Tailwind hardcoded em componentes
3. ✅ 100% das páginas públicas e admin usam componentes base
4. ✅ Contraste WCAG AA em todas as combinações de cores
5. ✅ Keyboard navigation funcionando
6. ✅ Home 100/100 em relação ao HTML de referência, validada além do hero
7. ✅ Sem visuais regridos vs. baseline
8. ✅ Build time < 2.5s
9. ✅ CSS file size < 30KB

---

## 📅 Timeline

| Fase | Duração | Entrega |
|------|---------|---------|
| **Fase 1** (Tokens) | 3 dias | tokens.tailwind.js + globals.css |
| **Fase 2** (Componentes) | 7 dias | 10+ componentes base |
| **Fase 3** (Páginas) | 7 dias | Todas as páginas refatoradas |
| **Fase 4** (QA) | 3 dias | Testes passando + aprovação visual |
| **Total** | **~20 dias** | Produção |

---

## 📝 Próximos Passos

1. [ ] Review plano com @pm, @po, @qa
2. [ ] Aprovar a definição de Home 100/100 antes de mexer em código
3. [ ] Criar story específica da Home, se a entrega for isolada
4. [ ] Atualizar baselines visuais da Home depois da aprovação visual
5. [ ] Documentar mudanças em CHANGELOG.md

---

**Versão:** 1.0  
**Última atualização:** 2026-06-28  
**Status:** 🔴 Planejado (não iniciado)
