---
name: championship-mtg-front
description: >-
  Develop the championship-management-mtg-front SPA (React 19, Vite, Tailwind,
  TanStack Query, Ably, Scryfall). Use when changing pages, hooks, UI, auth,
  decks, tournaments UI, metagame, articles pages, or backendApi.js.
---

# Championship MTG — Frontend

Read root `AI_CONTEXT.md` first. **JavaScript only** — do not add TypeScript unless asked. UI copy: Portuguese BR.

## Architecture

```
pages (thin) → hooks (state/effects) → services (API) / utils (pure)
```

- Auth: `AuthContext` + `ProtectedRoute` (modal login, no `/login` page; wait `authInitialized`; skip modal while `authRefreshing`)
- Session key: `localStorage` `cmmtg.auth`
- All REST calls: `src/services/backendApi.js` via `httpClient.js` (returns **data**, not Axios response)
- Critical tournament file: `src/hooks/useTournamentDetail.js` — change carefully
- `/editar-deck/:id` is public; non-owner gets `forcedReadOnly` after load
- Compare IDs with `normalizeId()`
- Scryfall: central queue in `scryfallApi.js` (~110 ms spacing, collection batches of 75) — do not bypass for bulk names
## UI conventions

- Tailwind inline; repeated classes in `styles/uiClasses.js`
- Public UI from `components/ui` (Radix wrappers: BaseModal, Tabs, Tooltip, Checkbox, Switch)
- Lucide for icons; design tokens in `index.css` / `DESIGN_SYSTEM.md`
- Dark purple brand; avoid inventing a second design system
- Prefer literal accented badges over CSS `uppercase` (breaks “VOCÊ”)
- `SelectField` stays native — no custom select without explicit a11y/mobile work
## Routes

Lazy routes in `AppRoutes.jsx`. New routes: add page + consider `externalNavigation.js` for WordPress iframe.

Short ids:

| Entity | Helper | Pattern |
|---|---|---|
| Torneio | `tournamentUrl.js` | `/torneios/{5}-{slug}` |
| Deck | `deckUrl.js` | `/editar-deck/{5}-{slug}` |
| Artigo | `artigoUrl.js` | `/artigos/{5}-{slug}` |

`UuidParamGuard` accepts UUID or `allowSlug` / `allowTournamentSlug` (`xxxxx-slug`).

## Deck lists

Group by type with `utils/deckTypeGroups.js` / `DeckList.jsx` (Criaturas, Terrenos, Mágicas instantâneas, …). Keep qty steppers in builder. Cards need `typeLine` from Scryfall/hydrate.

## Realtime

Subscribe only when logged in and inside the Ably window (~15 min before `horario` until not `finalizado`; `em_andamento` stays on). Always `unsubscribeFromTournament` in effect cleanup. Tolerate missing Ably key (`getAblyClient()` → null).
## Commands

```bash
npm run dev      # :5173
npm test
npm run build
```

Verify UI in the browser after visual/flow changes.

## Do not

- Redux/Zustand (Context + React Query is enough)
- CSS modules / styled-components
- Duplicate endpoints outside `backendApi.js`
- Access `response.data.data` after `httpClient`
- Commit without being asked

## More

- Decisions: [decisions.md](decisions.md)
- Share / OG / Amplify: skill `championship-mtg-share-og`
- Workspace pairing: skill `championship-mtg-workspace`
