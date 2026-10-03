# Decisões do frontend (ADR curto)

## ADR-F01 — JS puro + Tailwind 4

**Decisão:** Sem TypeScript; estilos Tailwind (Vite plugin), sem CSS modules.

## ADR-F02 — Auth por modal

**Decisão:** Sem página `/login`. `ProtectedRoute` / `requireAuth` abrem `AuthModal` e retomam a ação.

## ADR-F03 — Home = lista de torneios

**Decisão:** `/` é `TournamentPage`. Landings bare (sem Navbar/Footer) são só `/sobre-mim` e `/parceiros`. **`/artigos` usa o shell normal.** `/blog/*` redireciona para `/artigos/*`.
## ADR-F04 — WordPress embed

**Decisão:** Site WP embute o SPA; `externalNavigation.js` + `postMessage` sincronizam rotas. Links públicos usam `APP_PUBLIC_URL` (`app.tiagofuguete.com.br`).

## ADR-F05 — Slugs curtos

**Decisão:** Torneios, decks e artigos usam `{5 primeiros do UUID}-{slug}` nas URLs canônicas. UUID completo continua válido.

## ADR-F06 — Deck agrupado por tipo

**Decisão:** Builder (criar/editar/visualizar) agrupa por `typeLine` (mesma ordem do drawer). Sem `typeLine`, lista fica plana até hidratar.

## ADR-F07 — Artigos = Blog renomeado

**Decisão:** Rotas `/artigos/*`; redirects de `/blog/*`. Markup Scryfall/Cards Realm no conteúdo; editores com aprovação admin.

## ADR-F08 — Amplify Hosting

**Decisão:** Build `amplify.yml` → `dist/`. Open Graph de torneio/artigo **não** vem do `index.html` estático — precisa de rewrite 200 para a API (ver skill `championship-mtg-share-og`).

## ADR-F09 — React Query + Context

**Decisão:** Server state via TanStack Query; sessão/toast via Context. Não adicionar store global sem pedido.
