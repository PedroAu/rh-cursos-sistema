# Epic 14 Fase 2 Token Compliance Audit

Data: 2026-07-06
Escopo: `src/views/public/*` e `src/features/public-shell/components/*` tocados pela Fase 2.

## Resultado

- Excecoes permitidas/documentadas pela spec:
  - Gradientes decorativos em `About.tsx`, `Courses.tsx` e `Blog.tsx`.
  - Assets HTML de referencia (`RH Cursos Home.html`, `RH Cursos Agenda.html`) fora de `src/`.
- Ajustes semanticos temporarios aceitos por acessibilidade:
  - `Courses.tsx` e `Agenda.tsx` usam hexes escurecidos nos badges de status para cumprir contraste WCAG A/AA apos o gate `tests/a11y.spec.ts`.
- Pendencias reais para QA/cleanup futuro:
  - `InCompany.tsx` concentra grande volume de hex literals semanticos e de superficie.
  - `Login.tsx`, `Contact.tsx`, `SpecialistContact.tsx` e `public-mobile-navigation.tsx` ainda misturam tokens com cores literais.

## Arquivos com maior concentracao de hex literals

- `src/views/public/InCompany.tsx`
- `src/views/public/Login.tsx`
- `src/views/public/SpecialistContact.tsx`
- `src/features/public-shell/components/public-mobile-navigation.tsx`
- `src/views/public/Contact.tsx`

## Recomendacao

- Nao bloquear a validade da evidencia visual corrigida por esse ponto.
- Tratar a tokenizacao residual como debt de conformidade visual em review dedicado, porque parte dos literais atuais foi mantida para aderencia de spec ou para cumprir contraste minimo.
