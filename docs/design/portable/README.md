# Trust Keith Portable Theme

Este diretório transforma a extração crua em artefatos mais fáceis de consumir em outro projeto.

Arquivos:

- `trustkeith.tokens.json`: tokens normalizados para pipelines próprios.
- `trustkeith-theme.css`: variáveis CSS prontas para importar globalmente.
- `trustkeith-tailwind-preset.cjs`: preset de `theme.extend` para Tailwind.
- `TrustKeithHeroCard.tsx`: componente React de exemplo usando os tokens.

Uso rápido:

```ts
// tailwind.config.ts
import trustKeith from "./outputs/design-md/trustkeith/portable/trustkeith-tailwind-preset.cjs";

export default {
  presets: [trustKeith]
};
```

```tsx
import "./outputs/design-md/trustkeith/portable/trustkeith-theme.css";
import { TrustKeithHeroCard } from "./outputs/design-md/trustkeith/portable/TrustKeithHeroCard";
```

Notas:

- `Quincy CF` parece ser fonte de marca; confirme licenciamento/disponibilidade antes de produção.
- Os tokens de acessibilidade do extrator vieram fracos, então trate este pacote como baseline curado, não como sistema final auditado.
