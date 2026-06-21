# Copywriting Output Quality Checklist

**Checklist ID:** COPY-CL-001
**Referenced by:** tasks/review.md
**Purpose:** Validate copywriting deliverables for quality before delivery to user.

[[LLM: INITIALIZATION INSTRUCTIONS

This checklist validates copywriting output specifically.

EXECUTION APPROACH:
1. For each category, verify every item against the deliverable
2. Mark items as [x] Pass, [ ] Fail, [N/A] Not Applicable
3. CRITICAL items block delivery; non-critical items are advisory

CRITICAL items are marked with (CRITICAL) suffix.]]

---

## 0. Anti-Slop & Voz (GATE — bloqueia entrega)

> Régua dos vícios de IA. Referência completa: `squads/copy-squad/data/voice-rules.md`. Qualquer item marcado como falha aqui bloqueia a entrega, mesmo que o resto do checklist passe.

- [ ] Texto em português nativo, sem cadência de tradução (CRITICAL)
- [ ] Sem travessão (—) decorativo usado como muleta (CRITICAL)
- [ ] Tabela e lista só onde o conteúdo é genuinamente paralelo; análise e recomendação em prosa (CRITICAL)
- [ ] Sem emoji de status ou decorativo (🔴🟠🟢 ✅❌ 🚀 🎯) (CRITICAL)
- [ ] Nenhuma citação fabricada atribuída a uma persona; método aplicado de forma assumida (CRITICAL)
- [ ] Sem fecho artificial de IA ("espero que ajude", "vamos lá", "pronto para começar?")
- [ ] Negrito reservado a uma ideia central por bloco, não espalhado
- [ ] Sem adjetivo de hype ou clichê de copy ("revolucionário", "não perca", "imagine se")
- [ ] Nenhum fato, número ou garantia inventado; o que não existe vira marcador a confirmar (CRITICAL)

---

## 1. Headline & Hook

- [ ] Headline stops the reader — creates curiosity, urgency, or bold promise (CRITICAL)
- [ ] Lead paragraph hooks within the first two sentences (CRITICAL)
- [ ] Headline is specific, not vague or generic
- [ ] Sub-headlines guide the reader through the piece
- [ ] Opening addresses the reader's pain or desire directly

## 2. Persuasion & Structure

- [ ] Every sentence compels the reader to read the next one (CRITICAL)
- [ ] Copy follows a logical persuasion framework (PAS, AIDA, or equivalent)
- [ ] Benefits are emphasized over features
- [ ] Specific details and numbers used instead of vague claims
- [ ] Social proof, authority, or credibility elements present where appropriate
- [ ] Objections anticipated and addressed

## 3. Offer & CTA

- [ ] The offer is crystal clear — reader knows exactly what they get (CRITICAL)
- [ ] Call to action is specific, urgent, and easy to follow (CRITICAL)
- [ ] Risk reversal present (guarantee, free trial, no-obligation language)
- [ ] Scarcity or urgency is logical and believable, not manufactured
- [ ] Value proposition is unmistakable

## 4. Voice & Readability

- [ ] Written in the target audience's language and reading level
- [ ] Conversational tone — reads like one person talking to another
- [ ] No jargon unless the audience expects it
- [ ] Short paragraphs, varied sentence length, easy to scan
- [ ] Active voice dominant; passive voice used only intentionally

## 5. Technical Quality

- [ ] Grammar, spelling, and punctuation are correct
- [ ] No unsubstantiated or legally risky claims
- [ ] Formatting appropriate for the medium (email, LP, ad, etc.)
- [ ] Length appropriate for the context and platform

## 6. Conversion Readiness

- [ ] Would YOU buy/click/act based on this copy? (CRITICAL)
- [ ] Emotional triggers are authentic, not manipulative
- [ ] The piece has a single, clear objective — no competing CTAs
- [ ] Bullets are loaded with benefits, not flat descriptions

---

## PASS/FAIL Criteria

**PASS:** All CRITICAL items [x] and fewer than 3 non-critical failures.
**REVISE:** All CRITICAL items [x] but 3+ non-critical failures.
**FAIL:** Any CRITICAL item unchecked.
