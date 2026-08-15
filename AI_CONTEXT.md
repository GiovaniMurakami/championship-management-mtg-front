# AI Context — championship-management-mtg-front

> Documento de contexto para assistentes de IA. Leia antes de modificar o projeto.
> Versão do app: **1.2.33** | Idioma da UI e APIs: **português (BR)**

---

## 1. O que é este projeto

SPA React para **gerenciamento de torneios de Magic: The Gathering**, incluindo:

- Autenticação de usuários (JWT + refresh token)
- Construtor e CRUD de decks (validação via Scryfall)
- Torneios Swiss com top cut, pareamentos, resultados e check-in por rodada
- Ligas (rankings de jogadores, decks, cartas e times)
- Metagame público por formato (arquétipos, matchups, listas)
- Times (convites, solicitações de entrada)
- Dashboard admin, anúncios patrocinadores, upload de imagens (S3 presigned)
- Embedding em WordPress via iframe (`postMessage` + query params)

**Backend:** API REST própria (não está neste repositório).  
**Deploy:** AWS Amplify (`amplify.yml` → `dist/`).

---

## 2. Stack

| Tecnologia | Uso |
|---|---|
| React 19 | UI |
| Vite 7 | Build/dev |
| React Router 7 | Rotas (lazy-loaded) |
| TanStack React Query 5 | Cache de dados servidor |
| Tailwind CSS 4 | Estilos (`@tailwindcss/vite`) |
| Axios | HTTP (`httpClient.js`) |
| Ably | Realtime de torneios |
| Scryfall API | Dados de cartas MTG |
| Vitest + Testing Library | Testes |

**Sem TypeScript.** Todo o código é JavaScript (`.js`/`.jsx`).

---

## 3. Estrutura de pastas

```
src/
├── App.jsx                 # Shell: providers, Navbar, modais, bridges WordPress
├── main.jsx                # Entry point
├── index.css               # Reset + fontes + tokens Tailwind
├── routes/
│   └── AppRoutes.jsx       # Definição de todas as rotas (lazy)
├── pages/                  # Uma página por rota principal
├── components/
│   ├── auth/               # ProtectedRoute, AuthModal, EditProfileModal
│   ├── deck/               # DeckBuilder, CardSearch, HandSimulator, etc.
│   ├── tournament/         # MatchPanel, StandingsTable, OwnerControlPanel, etc.
│   ├── liga/               # Ranking sections
│   ├── metagame/           # Lista e detalhe de arquétipos
│   └── ui/                 # Navbar, Footer, Spinner, modais base, etc.
├── hooks/                  # Lógica de negócio reutilizável
├── context/
│   ├── AuthContext.jsx     # Auth + sessão (fonte única de useAuth)
│   └── ToastContext.jsx    # Toasts globais
├── services/
│   ├── httpClient.js       # Axios + interceptors (refresh, 401, 429)
│   ├── backendApi.js       # Todos os endpoints REST
│   ├── ablyService.js      # Cliente Ably + subscriptions
│   └── scryfallApi.js      # Busca de cartas
├── utils/                  # Funções puras (parsers, fluxo torneio, etc.)
├── constants/              # auth.js, tournament.js, ads.js, site.js
├── styles/uiClasses.js     # Classes Tailwind compartilhadas (BTN_*, INPUT_*)
└── test/                   # Vitest
```

**Barrel exports:** `components/index.js`, `hooks/index.js`, `pages/index.js`.

---

## 4. Convenções de código

### Padrão arquitetural
- **Páginas finas** → delegam para hooks e componentes
- **Hooks** concentram estado e side effects
- **Services** são funções puras de API (sem estado React)
- **Utils** são funções puras sem dependência de React

### Nomenclatura
- Componentes/páginas: `PascalCase` (`TournamentDetailPage.jsx`)
- Hooks: `useCamelCase` (`useTournamentDetail.js`)
- Services/utils: `camelCase` (`backendApi.js`, `parseDeckTxt.js`)
- Constantes exportadas: `UPPER_SNAKE` ou objetos descritivos
- Textos de UI: português BR
- Campos de API: português (`nome`, `senha`, `torneioId`, `mensagem`)

### Estilos
- Tailwind inline nas JSX; classes repetidas em `src/styles/uiClasses.js`
- Tema dark roxo/violeta; fonte display `Bebas_Neue` para títulos
- **Não** criar arquivos CSS por componente (exceto `index.css` global)

### Imports
- Preferir barrel exports quando existem (`from "../components"`, `from "../hooks"`)
- `useAuth` é re-exportado de `hooks/useAuth.js` → implementação em `context/AuthContext.jsx`

### IDs
- Usar `normalizeId()` (`src/utils/normalizeId.js`) ao comparar IDs de API (string vs number)

### Ações assíncronas
- Usar `useActionGuard(ms)` para evitar double-click em botões de ação
- Feedback via `useToast()` (`addToast`) ou estados locais `error`/`successMsg`

---

## 5. Providers e estado global

```
BrowserRouter
  └── QueryClientProvider (staleTime: 30s, retry: 1)
        └── AuthProvider
              └── ToastProvider
                    └── AppContent
```

### AuthContext (`src/context/AuthContext.jsx`)
- `token`, `usuario`, `isAuthenticated`, `isAdmin` (`usuario.role === "admin"`)
- Sessão em `localStorage` chave `cmmtg.auth` (`AUTH_STORAGE_KEY`)
- Eventos customizados do `httpClient`:
  - `auth:logout` — token expirado
  - `auth:tokenRefreshed` — refresh bem-sucedido
  - `auth:rateLimited` — HTTP 429

### ProtectedRoute (`src/components/auth/ProtectedRoute.jsx`)
- Aguarda `authInitialized` antes de decidir
- Se não autenticado: abre `AuthModal` automaticamente
- `requireAdmin` bloqueia não-admins com mensagem estática
- Usado só em rotas de **ação** (criar/editar) e admin — leitura de decks/torneios/ligas/times é pública

`requireAuth(action)` em `AuthContext`: abre o modal e, após login/cadastro, retoma a ação (ex.: inscrever-se).

---

## 6. Rotas (estado atual)

Definidas em `src/routes/AppRoutes.jsx`. Todas lazy-loaded com `<Suspense>`.

| Rota | Proteção | Página |
|---|---|---|
| `/` | público (leitura) | `TournamentPage` (lista de torneios = home) |
| `/decks` | público (leitura) | `MyDecksPage` |
| `/decks/criar` | auth | `DeckBuilderPage` (criar) |
| `/editar-deck/:id` | público (leitura); edição só se dono/admin autenticado | `DeckBuilderPage` (editar/visualizar) |
| `/torneios/criar` | auth + admin | `TournamentCreatePage` |
| `/torneios/:id` | público (leitura) | `TournamentDetailPage` |
| `/torneio/ingressar/:token` | público | `TournamentJoinPage` |
| `/dashboard` | auth + admin | `DashboardPage` (anúncios) |
| `/dashboard/bloqueios` | auth + admin | `DashboardBloqueiosPage` |
| `/termos-de-uso` | público | `TermosDeUsoPage` |
| `/privacidade` | público | `PrivacidadePage` (LGPD) |
| `/times`, `/times/:id` | público (leitura) | Time pages |
| `/times/criar`, `/times/:id/editar` | auth | Time create/edit |
| `/ligas`, `/ligas/:id` | público (leitura) | Liga pages |
| `/metagame`, `/metagame/:formato/:slug` | público | Metagame (slug não é UUID) |
| `/ligas/criar`, `/ligas/:id/editar` | auth + admin | Liga create/edit |
| `/ferramentas/*` | público | Contador de vida / Calculadora Swiss |
| `/esqueci-senha`, `/reset-senha` | público | Reset senha |
| `/blog`, `/sobre-mim`, `/parceiros` | público (layout bare) | Landing pages |
| `*` | — | `NotFoundPage` |

**Redirects:** `/torneio` → `/`, `/torneios` → `/`, rotas antigas `/landing-page/*`.

**Layout bare** (`App.jsx`): rotas `/blog`, `/sobre-mim`, `/parceiros` renderizam sem Navbar/Footer.

---

## 7. Mapa de arquivos críticos por feature

| Feature | Onde mexer |
|---|---|
| Nova rota | `routes/AppRoutes.jsx` + nova page em `pages/` |
| Auth/login | `context/AuthContext.jsx`, `components/auth/` (exclusão de conta soft-delete; `UsuarioExcluidoTag`) |
| Deck builder | `hooks/useDeckBuilder.js`, `components/deck/`, `utils/parseDeckTxt.js`, `utils/deckPayload.js` |
| Lista de torneios | `pages/TournamentPage.jsx` |
| Detalhe de torneio | `hooks/useTournamentDetail.js`, `pages/TournamentDetailPage.jsx`, `components/tournament/` (auto-drop em `PlayerProfile`) |
| Standings | `StandingsTable.jsx` (largura full / sem clip lateral; sem scroll vertical interno; story Top 8: jogadores + data acima do 1º, recorde V-D no card) |
| Usuário excluído | `components/ui/UsuarioExcluidoTag.jsx` + flags `excluido` nos payloads |
| Fluxo de rodadas/top cut | `utils/tournamentFlow.js`, `hooks/useTournamentQueries.js` |
| Realtime Ably | `services/ablyService.js`, handlers em `useTournamentDetail` e `TournamentPage` |
| Ligas | `pages/Liga*.jsx`, `components/liga/`, endpoints `/liga/*` em `backendApi.js` |
| Metagame | `pages/Metagame*.jsx`, `components/metagame/`, `GET /metagame` em `backendApi.js` (admin escolhe `cartaRepresentativa` no detalhe do arquétipo) |
| Times | `pages/Time*.jsx`, endpoints `/time/*` em `backendApi.js` |
| Admin/dashboard | `pages/DashboardPage.jsx`, `pages/DashboardBloqueiosPage.jsx` |
| WordPress embed | `utils/externalNavigation.js`, bridges em `App.jsx` |
| HTTP/errors | `services/httpClient.js` |
| Todos endpoints REST | `services/backendApi.js` |
| Classes UI compartilhadas | `styles/uiClasses.js` |
| Formatos/status torneio | `constants/tournament.js` |

---

## 8. Backend API (resumo)

Base URL resolvida em `httpClient.js`:
- `VITE_USE_LOCALHOST=true` → `VITE_BACKEND_DEV_URL`
- `VITE_ENVIRONMENT=production` → `VITE_BACKEND_PROD_URL`
- default → `VITE_BACKEND_DEV_URL`

**Importante:** interceptor retorna `response.data` diretamente (não `response`).

### Grupos de endpoints (`backendApi.js`)

```
Auth:     POST /usuario/login, /cadastrar, /refresh-token, /logout
          POST /usuario/reset-senha/solicitar, /confirmar
          PUT  /usuario/atualizar
          DELETE /usuario/conta         (soft-delete; confirmação = nome)
          GET  /usuario/listar          (admin — busca usuários para anfitrião)
          PUT  /usuario/:id/bloqueio-torneios (admin)

Decks:    POST /deck/cadastrar
          GET  /deck/listar, /deck/:id
          PUT  /deck/:id
          DELETE /deck/:id

Torneios: POST /torneio/criar, /:id/inscrever
          POST /:id/checkin, /deck, /iniciar, /proxima-rodada, /refazer-rodada
          POST /:id/drop, /gerar-link-ingresso
          POST /ingressar/:token          (body: { deckId })
          POST /partida/:id/resultado, /confirmar, /contestar
          PUT  /partida/:id/ajustar
          PATCH /partida/:id/mesa
          PUT  /:id/rodada/:rodada/pareamentos
          PUT  /:id/anfitriao             (admin — define anfitrião do torneio)
          GET  /torneio/listar, /:id, /:id/standings, /:id/partidas, /:id/meu-historico
          PUT  /torneio/:id
          DELETE /torneio/:id

Ligas:    CRUD /liga/* + GET /liga/:id/ranking
          (`jogador.nome` = nick MOL)

Metagame: GET /metagame?formato=&dias=30
          GET /metagame/:formato/:slug?dias=30   (público; sem JWT)
          (`usuario.nome` = nick MOL)

Decks:    CRUD /deck/* — `usuario.nome` em listar/buscar = nick MOL

Times:    CRUD /time/* + entrar, sair, convite, solicitar, aprovar, rejeitar

Site:     GET/PUT /site/anuncios, POST /site/anuncios/:id/clique

Imagens:  POST /imagem/upload-url → uploadParaS3 (PUT direto no S3)
```

**Fuso horário:** campos `horario`, `criadoEm`, `rodadaIniciadaEm` vêm da API em **Brasília (UTC-3)**. Use `src/utils/brasiliaTime.js` para exibir/formatar no front.

**Permissões no torneio:** dono, admin global ou **anfitrião** (`anfitriaoId`) podem gerenciar o torneio (`canManageTournament` no front).

Erros do backend: campo `mensagem` ou `message`; validação Zod em `errors[]`/`erros[]`.

---

## 9. Ably (realtime)

Canal por torneio: `torneio-{torneioId}`

Eventos (`ablyService.js`):
```
rodada_iniciada, resultado_registrado,
torneio_finalizado, participante_inscrito, checkin_realizado,
deck_inserido, resultado_contestado, torneio_iniciado, jogador_dropou,
resultado_ajustado, corte_iniciado, jogador_ingressou,
total_rodadas_alterado, rodada_refeita
```

Auth Ably: preferir `VITE_ABLY_AUTH_URL` em produção; fallback `VITE_ABLY_API_KEY`.

Conexão só com usuário **logado**, a partir de **15 min antes do `horario`** e enquanto o status não for `finalizado` (`em_andamento` entra na hora). Sem canais ativos o cliente Realtime é fechado. Inscrições/check-in muito antes do horário continuam via REST.

**Sempre** fazer `unsubscribeFromTournament(channel)` no cleanup do `useEffect`.

---

## 10. Scryfall

`src/services/scryfallApi.js` — busca de cartas para deck builder.

- Busca autocomplete: debounce 300ms (`SEARCH_DEBOUNCE_MS`)
- Import de deck: resolução exata por nome (`/cards/named?exact=`)
- Legalidade validada por formato em `useDeckBuilder`

Limites de deck (`constants/auth.js`):
- Maindeck: mín. 60 cartas
- Sideboard: máx. 15 cartas
- Cópias: máx. 4 (basic lands ilimitadas)

---

## 11. Torneio — lógica de negócio

### Status (`constants/tournament.js`)
- `inscricoes_abertas`, `em_andamento`, `finalizado`

### Formatos
`standard`, `modern`, `pioneer`, `pauper`, `commander`, `commander500`

### Fluxo Swiss + Top Cut (`utils/tournamentFlow.js`)
- `getTournamentNextAction(torneio)` → próxima ação do organizador
- `isEliminationPhase(torneio)` → fase de bracket
- `shouldRequestNextRoundCheckin(torneio)` → check-in obrigatório entre rodadas
- Rodadas Swiss: `ceil(log2(jogadores))`, limitado por `maxRodadas`

### Permissões no torneio
- `isOwner` = criador do torneio
- `isAnfitriao` = `anfitriaoId` do torneio
- `canManageTournament` = `isOwner || isAdmin || isAnfitriao`
- Painel do organizador: `OwnerControlPanel.jsx`

### Confirmação de resultados
- Lógica em `utils/matchConfirmations.js` e `utils/matchDisplay.js`
- Jogadores confirmam resultados mutuamente; contestação disponível

### Auto-drop do participante
- `handleSelfDrop` em `useTournamentDetail.js` → `POST /torneio/:id/drop`
- UI em `PlayerProfile`: cancelar inscrição (abertas) ou dropar (em andamento), com confirmação em 2 passos
- Perfil também aparece durante `em_andamento` quando o usuário está inscrito

### Conta excluída / LGPD
- Soft-delete no backend; front mostra tag `UsuarioExcluidoTag` / `UsuarioNomeExibicao`
- Copy de exclusão em `EditProfileModal` e política em `constants/privacyPolicy.js` (`/privacidade`)
- Banner LGPD de cookies: `CookieConsentBanner`; AdSense após a escolha — personalizado se aceitar ads, NPA se recusar (`utils/cookieConsent.js`)

### Acentuação em badges
- Evitar `uppercase` CSS em textos com acento (pode virar “VOCE”); preferir literal acentuado (`VOCÊ`, `CAPITÃO`, etc.)

---

## 12. WordPress / navegação externa

Arquitetura:
- **WordPress** (`tiagofuguete.com.br`) — site principal; embute o app em iframe
- **Este front** (`app.tiagofuguete.com.br`) — SPA React deste repositório

`src/utils/externalNavigation.js`:
- `APP_PUBLIC_URL` (`VITE_APP_URL`) — links compartilhados e acesso direto ao app
- `WORDPRESS_EMBED_URL` (`VITE_WORDPRESS_EMBED_URL`) — página WordPress com iframe (default `tiagofuguete.com.br/torneios`)
- Query params na `/` ainda são resolvidos para rotas internas (`?torneioId=`, `?ligaId=`, `?appPath=`, etc.)
- `App.jsx` sincroniza rotas com o parent WordPress via `postMessage` (`APP_ROUTE_CHANGED`, `APP_NAVIGATE`, etc.)
- `ScrollToTop` em `App.jsx` volta o scroll ao topo a cada mudança de `pathname`

Ao adicionar rotas novas, considerar se precisam de suporte em `resolveExternalNavigationTarget()`.

---

## 13. Variáveis de ambiente

```bash
VITE_ENVIRONMENT=development|production
VITE_USE_LOCALHOST=true|false
VITE_BACKEND_DEV_URL=http://localhost:3000
VITE_BACKEND_PROD_URL=https://api...
VITE_ABLY_AUTH_URL=...          # preferido em prod
VITE_ABLY_API_KEY=...           # dev fallback
VITE_YOUTUBE_CHANNEL_ID=...
VITE_YOUTUBE_API_KEY=...
VITE_SITE_PASSWORD=...          # gate opcional
VITE_APP_URL=...                # URL publica do front (default app.tiagofuguete.com.br)
VITE_WORDPRESS_EMBED_URL=...    # pagina WordPress com iframe (default tiagofuguete.com.br/torneios)
```

Copiar de `.env.example`. **Nunca commitar `.env`.**

---

## 14. Testes

```bash
npm test          # vitest run
npm run lint      # eslint
```

Testes em `src/test/`:
- API: `backendApi.test.js`, `backendApi.torneioMutations.test.js`, `backendApi.metagame.test.js`, `scryfallApi.test.js`
- Utils: `deckColors.test.js`, `cardTypeGroup.test.js`, `tournamentFlow.test.js`, `externalNavigation.test.js`
- UI: `ScrollToTop.test.jsx`, `ExpandableText.test.jsx`, `OwnerControlPanel.test.jsx`, `Navbar.*.test.jsx`
- Setup: `src/test/setupTests.js`

Config de teste embutida em `vite.config.js` (ambiente jsdom). Sem limiar global de cobertura; o backend é quem tem `coverageThreshold`.

---

## 15. Build e deploy

```bash
npm run dev       # localhost:5173
npm run build     # dist/
npm run preview
```

- Chunks manuais: `ably`, `story-export` (mp4-muxer)
- Amplify injeta vars `VITE_*` no build via `env | grep VITE_`

---

## 16. Gotchas e armadilhas

1. **README.md e DOCUMENTATION.md estão parcialmente desatualizados** — use este arquivo e o código como fonte de verdade.
2. **`httpClient` já desestrutura `response.data`** — não acesse `.data` novamente nos callers.
3. **`useTournamentDetail.js` é o arquivo mais complexo** — mudanças pequenas podem ter efeitos colaterais em Ably + React Query + estado local.
4. **Comparar IDs sempre com `normalizeId()`** — backend pode retornar string ou number.
5. **Rotas protegidas abrem modal de login** — não redirecionam para `/login` (não existe página de login dedicada).
6. **Home é `/`** e mostra torneios, não um hero landing — landing pages são `/blog`, `/sobre-mim`, `/parceiros`.
7. **Não adicionar TypeScript** sem solicitação explícita — projeto é JS puro.
8. **Não criar commits** a menos que o usuário peça.
9. **Classes Tailwind longas** — reutilizar constantes de `uiClasses.js` quando o padrão já existe.
10. **Ably sem key configurada** — `getAblyClient()` retorna `null`; código deve tolerar ausência de realtime.
11. **`uppercase` CSS remove acentos** — em badges (“VOCÊ”, “CAPITÃO”, “ANFITRIÃO”, etc.) use o literal acentuado e evite a classe `uppercase`.

---

## 17. Diretrizes para assistentes de IA

### Ao implementar features
1. Ler código adjacente antes de escrever — seguir convenções existentes
2. Mudança mínima necessária — não refatorar código não relacionado
3. Nova API → adicionar em `backendApi.js`, usar via hook ou página
4. Nova rota → `AppRoutes.jsx` + page + considerar `externalNavigation.js`
5. Feedback ao usuário → `useToast` ou padrão existente na página
6. Testes → só adicionar se solicitado ou se cobrem comportamento real

### Ao debugar
1. Verificar `.env` e URL do backend
2. Verificar token em `localStorage` (`cmmtg.auth`)
3. Torneio não atualiza → checar Ably + handlers em `useTournamentDetail`
4. 401 → fluxo de refresh em `httpClient.js`
5. 429 → evento `auth:rateLimited` → toast

### O que evitar
- Introduzir bibliotecas de estado global (Redux, Zustand) — já usa Context + React Query
- Criar páginas de login separadas — auth é modal
- Duplicar endpoints fora de `backendApi.js`
- CSS modules ou styled-components — projeto usa Tailwind
- Documentação extra não solicitada

---

## 18. Referências cruzadas

| Documento | Conteúdo |
|---|---|
| `AI_CONTEXT.md` (este) | Contexto para IA — fonte primária do frontend |
| `championship-management-mtg/AI_CONTEXT.md` | Contexto do backend (API REST pareada) |
| `DOCUMENTATION.md` | Docs detalhadas (parcialmente desatualizadas) |
| `README.md` | Quick start (desatualizado em rotas/features) |
| `.env.example` | Variáveis de ambiente |

---

*Última revisão: agosto/2026 — alinhado com v1.2.33 (metagame mostra a primeira lista do arquétipo)*
