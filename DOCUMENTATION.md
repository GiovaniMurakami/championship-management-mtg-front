# MTG Championship Management Frontend - Documentação

## 📋 Visão Geral

Frontend React com Vite para gerenciamento de torneios e decks de Magic: The Gathering. A aplicação oferece autenticação, construção de decks com validação de legalidade por formato, importação de decks e integração com a API Scryfall.

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Navbar.jsx       # Header fixo com navegação e auth
│   ├── AuthModal.jsx    # Modal de login/cadastro
│   ├── Hero.jsx         # Seção hero da home
│   ├── TournamentSection.jsx # Grid de torneios mockados
│   ├── CardPreviewModal.jsx  # Preview flutuante de cartas
│   ├── CardSearch.jsx   # Busca com autocomplete
│   ├── DeckList.jsx     # Lista de cartas no deck
│   ├── DeckBuilder.jsx  # Formulário principal de deck
│   ├── ProtectedRoute.jsx # Guard de rotas autenticadas
│   └── index.js         # Barrel exports
├── hooks/               # Custom hooks (lógica em React)
│   ├── useAuth.js       # Autenticação e sessão
│   ├── useDeckBuilder.js # Construção e validação de decks
│   ├── useCardSearch.js # Busca debounced de cartas
│   ├── useCardPreview.js # Gerenciar preview de cartas
│   └── index.js         # Barrel exports
├── pages/               # Componentes de página (rotas)
│   ├── Home.jsx         # Página inicial (pública)
│   ├── DeckBuilderPage.jsx # Página de construtor (protegida)
│   └── index.js         # Barrel exports
├── routes/              # Definição de rotas
│   ├── AppRoutes.jsx    # <Routes> com todas as rotas
│   └── index.js         # Barrel exports
├── services/            # Integrações com APIs
│   ├── backendApi.js    # Endpoints do backend local
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
VITE_API_BASE_URL=http://localhost:3000
```

```bash
# .env.example (commitar)
VITE_API_BASE_URL=http://localhost:3000
```

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
- `handleCreateDeck(event, token)`: Valida e submete deck ao backend

---

## 🔍 Busca e Preview de Cartas

### useCardSearch Hook

Busca debounced (300ms) via Scryfall com limite de 8 sugestões.

**Estados:**

- `mainSearch`, `sideSearch`: Texto de busca
- `mainSuggestions`, `sideSuggestions`: Array de cartas encontradas

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
/              → Home (pública)     [Hero + Torneios]
/decks         → DeckBuilder (protegida) [Construtor de decks]
/*             → Navigate to /      [Fallback]
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
    { "nome": "Battle Screech", "quantidade": 4 },
    ...
  ],
  "sideboard": [
    { "nome": "Destroy Evil", "quantidade": 2 },
    ...
  ]
}
```

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
- `.feedback`: Box de mensagem (sucesso/aviso)
- `.feedback.limit-warning`: Laranja/vermelho claro
- `.feedback.illegal-warning`: Vermelho intenso com borda

---

## 📱 Responsividade

### Breakpoint Principal

`@media (max-width: 950px)`:

- Navbar: esconde nav, botões em dropdown
- Grid: `1fr` em vez de `2 colunas`
- Deck list: ajusta tamanho de input de quantidade

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
      └── DeckBuilderPage (protegida)
          └── DeckBuilder + CardSearch x2 + DeckList x2
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

- Adicionar classes em `src/App.css`
- Respeitar variáveis de cor (`var(--brand-2)`)
- Testar responsividade em `@media (max-width: 950px)`

---

## ✅ Checklist de Funcionalidades

- [x] Autenticação (login/registro)
- [x] Construção de decks com busca de cartas
- [x] Validação de máx 4 cópias (exceto basic lands)
- [x] Validação de legalidade por formato
- [x] Importação de decks via arquivo .txt
- [x] Preview flutuante de cartas ao hover
- [x] Proteção de rotas (deck builder privado)
- [x] Design dark/roxo responsivo
- [x] Modais flutuantes de auth e preview
- [x] Validação visual com shake (nome, formato)
- [x] Auto-limpeza de mensagens de sucesso
- [x] Integração Scryfall para metadados de cartas

---

## 📞 Suporte

Para mais informações sobre APIs específicas, consulte:

- [Scryfall API](https://scryfall.com/docs/api)
- [React Hooks](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite](https://vitejs.dev)
