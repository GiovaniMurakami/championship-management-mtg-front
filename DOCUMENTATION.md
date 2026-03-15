# MTG Championship Management Frontend - Documentação

## 📋 Visão Geral

Frontend React com Vite para gerenciamento de torneios e decks de Magic: The Gathering. A aplicação oferece autenticação, construção e gerenciamento de decks com validação de legalidade por formato, importação de decks, integração com a API Scryfall e atualizações em tempo real via Ably (WebSocket) para eventos de torneio.

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Navbar.jsx       # Header fixo com navegação e auth
│   ├── AuthModal.jsx    # Modal de login/cadastro
│   ├── EditProfileModal.jsx # Modal de edição de perfil
│   ├── Hero.jsx         # Seção hero da home
│   ├── TournamentSection.jsx # Grid de torneios na home
│   ├── TournamentCreateForm.jsx # Formulário de criação de torneio
│   ├── CardPreviewModal.jsx  # Preview flutuante de cartas
│   ├── CardSearch.jsx   # Busca com autocomplete
│   ├── DeckList.jsx     # Lista de cartas no deck
│   ├── DeckBuilder.jsx  # Formulário principal de deck
│   ├── DeckStats.jsx    # Estatísticas do deck (curva de mana, cores, tipos)
│   ├── HandSimulator.jsx # Simulador de mão inicial (7 cartas)
│   ├── Spinner.jsx      # Componente de loading spinner reutilizável
│   ├── Skeleton.jsx     # Componentes de skeleton loading (SkeletonCard, SkeletonTorneioCard, SkeletonTournamentDetail)
│   ├── ProtectedRoute.jsx # Guard de rotas autenticadas
│   ├── tournament/      # Componentes específicos de torneio
│   │   ├── MatchPanel.jsx       # Painel de partida atual
│   │   ├── PlayerProfile.jsx    # Perfil do jogador no torneio
│   │   ├── StandingsTable.jsx   # Tabela de classificação
│   │   ├── TournamentHeader.jsx # Cabeçalho do torneio
│   │   └── index.js             # Barrel exports
│   └── index.js         # Barrel exports
├── hooks/               # Custom hooks (lógica em React)
│   ├── useAuth.js       # Autenticação e sessão
│   ├── useDeckBuilder.js # Construção e validação de decks
│   ├── useCardSearch.js # Busca debounced de cartas
│   ├── useCardPreview.js # Gerenciar preview de cartas
│   ├── useMyDecks.js    # Listagem e gerenciamento dos decks do usuário
│   ├── useTournamentDetail.js # Estado completo de um torneio + Ably
│   └── index.js         # Barrel exports
├── pages/               # Componentes de página (rotas)
│   ├── Home.jsx         # Página inicial (pública)
│   ├── DeckBuilderPage.jsx # Construtor/editor de deck (protegida)
│   ├── MyDecksPage.jsx  # Lista de decks do usuário (protegida)
│   ├── TournamentPage.jsx  # Lista de torneios (protegida)
│   ├── TournamentDetailPage.jsx # Detalhe do torneio (protegida)
│   └── index.js         # Barrel exports
├── routes/              # Definição de rotas
│   ├── AppRoutes.jsx    # <Routes> com todas as rotas
│   └── index.js         # Barrel exports
├── services/            # Integrações com APIs
│   ├── httpClient.js    # Axios configurado com baseURL dinâmica
│   ├── backendApi.js    # Todos os endpoints do backend
│   ├── ablyService.js   # Cliente Ably e subscriptions de torneio
│   └── scryfallApi.js   # Busca de cartas (Scryfall)
├── utils/               # Funções utilitárias
│   ├── parseDeckTxt.js  # Parser de arquivo .txt de deck
│   └── deckPayload.js   # Formatação de payload de deck
├── constants/           # Constantes da aplicação
│   └── auth.js          # Chaves, tamanhos e timeouts
├── App.jsx              # Componente raiz (shell + modais)
├── App.css              # Estilos globais (design system)
├── main.jsx             # Entry point
└── index.css            # Reset global + fontes

.env                      # Variáveis de ambiente (não commitar)
.env.example             # Exemplo de .env (commitar)
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# .env (local, não commitar)
VITE_ENVIRONMENT=development          # "development" ou "production"
VITE_USE_LOCALHOST=false              # true = usa VITE_BACKEND_DEV_URL como localhost
VITE_BACKEND_DEV_URL=https://...      # URL da API de desenvolvimento
VITE_BACKEND_PROD_URL=https://...     # URL da API de produção
VITE_ABLY_API_KEY=xxxx.yyyy:zzzz     # Chave de API do Ably (realtime)
```

### Resolução de Base URL (`httpClient.js`)

- `VITE_USE_LOCALHOST=true` → usa `VITE_BACKEND_DEV_URL` independente do ambiente
- `VITE_ENVIRONMENT=production` → usa `VITE_BACKEND_PROD_URL`
- Default → usa `VITE_BACKEND_DEV_URL`

---

## 🔐 Autenticação e Sessão

### useAuth Hook

Centraliza toda a lógica de autenticação, login, registro e persistência de sessão em LocalStorage.

**Estados retornados:**

- `token`: Bearer token JWT
- `usuario`: Dados do usuário (nome, email)
- `isAuthenticated`: Boolean (token && usuario)
- `showAuthModal`, `authTab`: Controle da modal de auth
- `authLoading`, `authMessage`: Feedback do formulário

**Funções:**

- `handleLogin(event)`: Faz POST /usuario/login
- `handleRegister(event)`: POST /usuario/cadastrar + login automático
- `clearAuth()`: Limpa token e remove do localStorage
- `openAuth(tab)`: Abre modal com aba selecionada ("login" ou "register")

---

## 🎴 Gerenciador de Decks

### useDeckBuilder Hook

Gerencia construção, validação e importação de decks.

**Estados:**

- `deckForm`: { nome, formato }
- `mainDeck`, `sideboard`: Array de cartas
- `deckLoading`: Flag durante cadastro
- `deckMessage`, `cardLimitMessage`, `illegalCardMessage`: Feedback
- `importLoading`, `importMessage`: Feedback de importação

**Validações:**

- Máximo 4 cópias por carta (excepto Basic Lands)
- Mínimo 60 cartas no maindeck
- Máximo 15 cartas no sideboard
- Legalidade de cartas por formato (Standard, Modern, Pioneer, Legacy, Commander, Pauper)

**Funções:**

- `addCardToDeck(card, section)`: Adiciona carta a "main" ou "side"
- `updateCardQuantity(section, nome, quantidade)`: Altera quantidade
- `removeCard(section, nome)`: Remove carta do deck
- `importDeckFromTxt(file)`: Parser e resolução de arquivo .txt
- `handleCreateDeck(event, token, deckId?, originalDeck?)`: Valida e submete deck ao backend (cria ou edita)

---

## 📚 Gerenciador de Decks do Usuário

### useMyDecks Hook

Busca e expõe todos os decks do usuário autenticado.

**Estados:**

- `decks`: Array de decks
- `loading`: Flag durante carregamento
- `message`: Mensagem de erro, se houver

**Funções:**

- `fetchDecks()`: Recarrega a lista de decks

---

## 🏆 Torneios

### TournamentPage (`/torneios`)

Lista todos os torneios disponíveis. O usuário pode se inscrever e o organizador pode iniciar o torneio. Usa Ably para manter a lista atualizada em tempo real (sem polling).

### TournamentDetailPage (`/torneios/:id`)

Detalhe completo de um torneio: standings, partidas da rodada atual, ações de checkin, escolha de deck e registro de resultado. Toda a lógica de estado fica em `useTournamentDetail`.

### useTournamentDetail Hook

Centraliza o estado de um torneio específico, integrando chamadas HTTP e eventos Ably.

**Estados:**

- `torneio`: Dados gerais do torneio
- `standings`: Array de participantes com pontuação
- `partidas`: Partidas da rodada atual
- `loading`, `actionLoading`: Flags de carregamento
- `error`, `successMsg`: Feedback ao usuário
- `selectedDeckId`: Deck selecionado para o torneio
- `currentPlayer`: Entrada do jogador logado nos standings
- `myMatch`: Partida atual do jogador logado
- `decks`: Decks disponíveis do usuário (via `useMyDecks`)

**Funções:**

- `loadTournament()`: Recarrega dados do torneio
- `loadStandings()`: Recarrega standings e partidas
- `handleCheckin()`: POST checkin no torneio
- `handleEscolherDeck(deckId)`: POST deck escolhido
- `handleRegistrarResultado(partidaId, resultado)`: POST resultado de partida

**Eventos Ably escutados:**

- `rodada_iniciada` → `loadTournament()` + `loadStandings()`
- `resultado_registrado` → `loadStandings()`
- `standings_atualizados` → `loadStandings()`
- `torneio_finalizado` → `loadTournament()` + `loadStandings()`
- `participante_inscrito` → `loadTournament()`
- `checkin_realizado` → `loadTournament()`

---

## 📡 Realtime com Ably

### ablyService.js

Gerencia o cliente Ably (singleton) e subscriptions por torneio.

**`getAblyClient()`**
- Cria o cliente `Realtime` uma única vez (singleton) usando `VITE_ABLY_API_KEY`
- Loga mudanças de estado de conexão no console: `[Ably] Conexão: initialized → connected`

**`subscribeToTournament(torneioId, callbacks)`**
- Obtém/cria o canal `torneio-{torneioId}`
- Loga mudanças de estado do canal
- Registra listeners para os eventos: `rodada_iniciada`, `resultado_registrado`, `standings_atualizados`, `torneio_finalizado`, `participante_inscrito`, `checkin_realizado`
- Cada listener loga o payload recebido antes de chamar o callback
- Retorna o objeto `channel` (necessário para unsubscribe)

**`unsubscribeFromTournament(channel)`**
- Chama `channel.unsubscribe()` e loga a ação

**Debugando Ably:**
- Todos os eventos aparecem no console com prefixo `[Ably]`
- Para ver mensagens brutas: DevTools → Network → aba **WS** → conexão `realtime.ably.io` → **Messages**
- Para monitorar no dashboard: [app.ably.com](https://app.ably.com) → Dev Console

---

## 🔍 Busca e Preview de Cartas

### useCardSearch Hook

Busca debounced (300ms) via Scryfall com limite de 8 sugestões.

**Estados:**

- `mainSearch`, `sideSearch`: Texto de busca
- `mainSuggestions`, `sideSuggestions`: Array de cartas encontradas
- `searchError`: Mensagem de erro caso a busca falhe

### useCardPreview Hook

Gerencia modal flutuante de preview de carta ao hover.

**Estados:**

- `previewCard`: Objeto { nome, imagem, ... } ou null

---

## 📥 Importação de Decks

### Parser de TXT - `parseDeckTxt(content)`

Aceita dois formatos:

**Formato 1: Bloco separado por linha em branco**

```
4 Battle Screech
2 Eagles of the North
...
[linha em branco]
2 Destroy Evil
3 Dust to Dust
```

**Formato 2: Com cabeçalhos explícitos**

```
Main Deck
4 Battle Screech
...

Sideboard
2 Destroy Evil
```

**Regras:**

- Linhas começam com quantidade: `4 Card Name`
- Ignora linhas em branco e cabeçalhos
- Normaliza acentos e case (e.g., "CARD NAME" = "Card Name")

### Fluxo de Importação

1. Usuário seleciona arquivo `.txt`
2. Parser extrai linhas de cartas
3. Para cada carta, busca **exatamente** por nome no Scryfall (`/cards/named?exact=`)
4. Resolve metadados: imagem, type_line, legalidades
5. Preenche `mainDeck` e `sideboard` automaticamente
6. Feedback: `"Deck importado com sucesso."` (auto-limpa em 3s)

---

## 🎨 Validação Visual de Formulário

### Nome do Deck

- **Campo obrigatório** (verificação no submit)
- **Vazio:** borda vermelha + animação `shake` (420ms)
- **Feedback:**
  - Borda: `rgba(255, 98, 124, 0.95)`
  - Shadow glow: `rgba(255, 98, 124, 0.2)`
- **Auto-reset ao digitar**

### Formato

- **Campo obrigatório** com seleção vazia no início
- **Placeholder:** "Selecione um formato"
- **Vazio no submit:** borda vermelha + `shake`
- **Comportamento idêntico ao nome**

### Animação Shake

```css
@keyframes field-shake {
  0%, 100%: translateX(0)
  20%: translateX(-6px)
  40%: translateX(6px)
  60%: translateX(-4px)
  80%: translateX(4px)
}
```

---

## 🛣️ Rotas

### Definição em `src/routes/AppRoutes.jsx`

```
/                    → Home (pública)              [Hero + seção de torneios]
/decks               → DeckBuilderPage (protegida) [Criar novo deck]
/editar-deck/:id     → DeckBuilderPage (protegida) [Editar deck existente]
/meus-decks          → MyDecksPage (protegida)     [Lista de decks do usuário]
/torneios            → TournamentPage (protegida)  [Lista de torneios]
/torneios/:id        → TournamentDetailPage (prot) [Detalhe e ações do torneio]
/*                   → Navigate to /              [Fallback]
```

### Proteção de Rotas

- `<ProtectedRoute>` verifica `isAuthenticated`
- Se não autenticado: redireciona para `/`

---

## 🎯 Endpoints do Backend

### Autenticação

`POST /usuario/login`

```json
{
  "email": "user@example.com",
  "senha": "senha123"
}
```

Retorna: `{ token, usuario: { nome, email } }`

`POST /usuario/cadastrar`

```json
{
  "nome": "João",
  "email": "joao@example.com",
  "senha": "senha123"
}
```

### Deck

`POST /deck/cadastrar`
Headers: `Authorization: Bearer {token}`

```json
{
  "nome": "Izzet Phoenix",
  "formato": "modern",
  "maindeck": [
    { "nome": "Battle Screech", "quantidade": 4 }
  ],
  "sideboard": [
    { "nome": "Destroy Evil", "quantidade": 2 }
  ]
}
```

`GET /deck/listar`
Headers: `Authorization: Bearer {token}`

`PUT /deck/:deckId`
Headers: `Authorization: Bearer {token}`
Body: mesmo formato do cadastrar

`DELETE /deck/:deckId`
Headers: `Authorization: Bearer {token}`

### Usuário

`PUT /usuario/atualizar`
Headers: `Authorization: Bearer {token}`

### Torneios

`POST /torneio/criar`
Headers: `Authorization: Bearer {token}`

`GET /torneio/listar`
Headers: `Authorization: Bearer {token}`

`GET /torneio/:torneioId`
Headers: `Authorization: Bearer {token}`

`POST /torneio/:torneioId/inscrever`
Headers: `Authorization: Bearer {token}`

`POST /torneio/:torneioId/deck`
Headers: `Authorization: Bearer {token}`
Body: `{ "deckId": "..." }`

`POST /torneio/:torneioId/checkin`
Headers: `Authorization: Bearer {token}`

`POST /torneio/:torneioId/iniciar`
Headers: `Authorization: Bearer {token}`

`POST /torneio/:torneioId/proxima-rodada`
Headers: `Authorization: Bearer {token}`

`POST /torneio/:torneioId/drop`
Headers: `Authorization: Bearer {token}`
Body: `{ "jogadorId": "..." }` (omitir para auto-drop)

`GET /torneio/:torneioId/standings`
Headers: `Authorization: Bearer {token}`

`POST /torneio/partida/:partidaId/resultado`
Headers: `Authorization: Bearer {token}`
Body: `{ "resultado": "..." }`

---

## 🎪 Design System

### Cores (CSS Variables)

```css
--bg-1: #08060f /* Background principal */ --brand-2: #c795ff
  /* Roxo/Violeta de marca */ --text-main: #f5edff /* Texto principal */
  --text-soft: #bfb0d9 /* Texto secundário */ --line: rgba(199, 149, 255, 0.22)
  /* Bordas */;
```

### Tipografia

- **Títulos:** Bebas Neue
- **Corpo:** Space Grotesk

### Componentes Padrão

- `.btn.primary`: Gradient roxo
- `.btn.secondary`: Transparente com borda
- `.btn.ghost`: Sem fundo
- `.btn.danger`: Fundo vermelho translúcido (para ações destrutivas)
- `.btn.danger-solid`: Gradient vermelho sólido (confirmação de exclusão)
- `.feedback`: Box de mensagem (sucesso/aviso)
- `.feedback.limit-warning`: Laranja/vermelho claro
- `.feedback.illegal-warning`: Vermelho intenso com borda

### Loading Components

- `<Spinner size={36} text="Mensagem">`: Spinner animado reutilizável com texto opcional
- `<Skeleton width height radius>`: Bloco base com shimmer animation
- `<SkeletonCard>`: Placeholder para cards de deck (MyDecksPage)
- `<SkeletonTorneioCard>`: Placeholder para cards de torneio (TournamentPage)
- `<SkeletonTournamentDetail>`: Placeholder para layout de detalhe de torneio

Todos os skeletons usam `@keyframes skeleton-shimmer` com gradiente translúcido.

---

## 📱 Responsividade

### Breakpoints

| Breakpoint | Escopo |
|------------|--------|
| `950px` | Navbar (hamburger menu), Deck Builder (single column), card pickers, form layout |
| `900px` | Tournament detail (single column grid), skeleton layout |
| `768px` | Tournament list (single column cards), tournament create form |
| `640px` | Card preview modal (hidden on mobile) |
| `600px` | My Decks (single column), Hero, Banner grid, TD page refinements, DeckStats, HandSimulator |
| `480px` | Tournament list (compact), TD table, Deck builder (compact), Auth modal, general `main` padding |

### Estratégia

- Todas as páginas usam `padding-top: 7.5rem` (ou equivalente em mobile) para respeitar a navbar fixa
- Grids convertem para `1fr` em telas pequenas
- Botões ficam full-width em mobile
- Cards e modais ajustam padding
- Skeleton components adaptam layout no breakpoint `900px`

---

## 🔄 Fluxo de Dados

```
App (hooks centralizados)
  ├── useAuth
  ├── useDeckBuilder
  ├── useCardSearch
  ├── useCardPreview
  │
  └── AppRoutes
      ├── Home (pública)
      ├── DeckBuilderPage (protegida)  → useDeckBuilder + useCardSearch
      ├── MyDecksPage (protegida)      → useMyDecks
      ├── TournamentPage (protegida)   → backendApi + ablyService (per-torneio)
      └── TournamentDetailPage (prot.) → useTournamentDetail
              ├── backendApi (HTTP)
              ├── useMyDecks
              └── ablyService (WebSocket) → canal torneio-{id}
```

---

## 📝 Mensagens Com Auto-Limpeza

**Sucesso (limpam em 3s):**

- `"Deck importado com sucesso."`
- `"Deck cadastrado com sucesso."`

**Erro (permanecem visíveis):**

- `"Nenhuma carta válida foi encontrada no arquivo."`
- `"As seguintes cartas não são legais em {formato}: ..."`

---

## 🚀 Scripts

```bash
npm run dev      # Inicia dev server (hot reload)
npm run build    # Build production
npm run lint     # ESLint
npm run preview  # Preview local do build
```

---

## 🛠️ Desenvolvimento

### Adicionar Nova Rota

1. Criar componente em `src/pages/NovaPage.jsx`
2. Adicionar `<Route>` em `src/routes/AppRoutes.jsx`
3. Importar em `AppRoutes`

### Adicionar Novo Hook

1. Criar `src/hooks/useNovoHook.js`
2. Exportar em `src/hooks/index.js`
3. Usar em componentes via `import { useNovoHook } from "@/hooks"`

### Estilizar Novo Componente

- Adicionar classes em `src/App.css` (não usar inline styles)
- Respeitar variáveis de cor (`var(--brand-2)`, `var(--line)`, `var(--text-soft)`, etc.)
- Adicionar breakpoints mobile em `@media (max-width: 600px)` e `@media (max-width: 480px)`
- Para loading states, usar `<Spinner>` ou `<Skeleton*>` components
- Prefixar classes por contexto: `ds-` (DeckStats), `hs-` (HandSimulator), `td-` (Tournament Detail), `my-deck-` (My Decks)

---

## ✅ Checklist de Funcionalidades

- [x] Autenticação (login/registro)
- [x] Edição de perfil do usuário
- [x] Construção de decks com busca de cartas
- [x] Edição e exclusão de decks existentes
- [x] Listagem de decks do usuário
- [x] Validação de máx 4 cópias (exceto basic lands)
- [x] Validação de legalidade por formato
- [x] Importação de decks via arquivo .txt
- [x] Preview flutuante de cartas ao hover
- [x] Simulador de mão inicial
- [x] Estatísticas do deck (curva de mana, cores, tipos)
- [x] Proteção de rotas (deck builder e torneios privados)
- [x] Design dark/roxo responsivo
- [x] Modais flutuantes de auth e preview
- [x] Validação visual com shake (nome, formato)
- [x] Auto-limpeza de mensagens de sucesso
- [x] Integração Scryfall para metadados de cartas
- [x] Criação e listagem de torneios
- [x] Inscrição, checkin e escolha de deck no torneio
- [x] Início de torneio pelo organizador
- [x] Registro de resultado de partida
- [x] Tabela de standings em tempo real
- [x] Drop de jogador
- [x] Realtime via Ably WebSocket (7 eventos de torneio)
- [x] Skeleton loading screens (MyDecksPage, TournamentPage, TournamentDetailPage)
- [x] Spinner reutilizável
- [x] Responsividade mobile completa (6 breakpoints)
- [x] CSS sem inline styles (classes CSS dedicadas)
- [x] Error handling em busca de cartas

---

## 📞 Suporte

Para mais informações sobre APIs específicas, consulte:

- [Scryfall API](https://scryfall.com/docs/api)
- [React Hooks](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite](https://vitejs.dev)
