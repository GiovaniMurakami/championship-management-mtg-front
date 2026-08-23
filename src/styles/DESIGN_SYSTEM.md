# Sistema visual

Os tokens globais ficam em `src/index.css`, dentro de `@theme`. Componentes devem usar
nomes semânticos em vez de cores ou medidas arbitrárias.

## Cores

- Fundo: `canvas`, `bg-1`, `bg-2`.
- Superfícies: `surface`, `surface-raised`, `surface-soft`, `surface-hover`.
- Marca: `brand`, `brand-strong`, `brand-deep`, `brand-soft`.
- Texto: `text-main`, `text-soft`, `text-muted`, `text-subtle`.
- Bordas: `line`, `line-soft`, `line-strong`.
- Estado: `success`, `warning`, `danger`, `danger-soft`.

Exemplo: prefira `bg-surface text-text-main border-line` a valores hexadecimais.
Cores próprias de cartas, medalhas, mana e exportações de imagem podem continuar
literais, pois pertencem ao conteúdo e não à interface.

## Arredondamento

- `rounded-md`: controles pequenos, chips retangulares e itens internos.
- `rounded-lg`: botões, campos e controles comuns.
- `rounded-xl`: cards e painéis.
- `rounded-2xl`: destaques, modais e grandes agrupamentos.
- `rounded-full`: avatares, indicadores circulares e pills.

Não use raios arbitrários em novos componentes.

## Componentes compartilhados

Classes reutilizáveis de formulários, botões e cards ficam em `uiClasses.js`.
Antes de criar um novo conjunto de classes, reutilize ou estenda uma variante existente.
Estados de foco devem permanecer visíveis, e ações desabilitadas devem combinar
`disabled:opacity-50` com `disabled:cursor-not-allowed`.
