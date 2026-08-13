# Referências de fidelidade autocontidas

Estas referências são geradas a partir dos exports versionados `*.dc.html` por:

```bash
npm run fidelity:references
```

O gerador remove o runtime do design-tool, inclui os tokens CSS, incorpora a logo
como data URI, hidrata os placeholders com fixtures determinísticas de apresentação
e exporta as dez telas admin como arquivos isolados. O comando falha se permanecer
`{{ ... }}`, `support.js`, caminho `_ds/`, a URL relativa de upload, handlers inline,
declarações CSS malformadas, marcadores de estado sem valor reconhecido (incluindo
`checked`, `aria-pressed` e `data-hot`) ou componentes de referência vazios.

Os `*.dc.html` originais continuam sendo a fonte de rastreabilidade; os arquivos
deste diretório são a fonte executável usada pelo harness de captura.
Não edite os arquivos gerados manualmente: altere o export ou o gerador e execute
`npm run fidelity:references` novamente para reproduzir toda a coleção.
