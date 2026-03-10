# Changelog - Adições Implementadas

## v1.0.0 - Arquitetura Completa e Funcionalidades Core

### 🏗️ Arquitetura e Refatoração

#### Componentização

- Criado 8 componentes reutilizáveis em `src/components/`:
  - `Navbar.jsx` - Header fixo com navegação e auth
  - `AuthModal.jsx` - Modal de login/cadastro com abas
  - `Hero.jsx` - Seção hero da home
  - `TournamentSection.jsx` - Grid de 3 torneios mockados
  - `CardPreviewModal.jsx` - Preview flutuante de carta
  - `CardSearch.jsx` - Busca com autocomplete
  - `DeckList.jsx` - Lista de cartas do deck
  - `DeckBuilder.jsx` - Formulário principal (maindeck+sideboard)
  - `ProtectedRoute.jsx` - Guard de rotas autenticadas

#### Custom Hooks

- Criado 4 hooks em `src/hooks/` para separação de lógica:
  - `useAuth.js` - Autenticação (login, registro, sessão)
  - `useDeckBuilder.js` - Construção e validação de decks
  - `useCardSearch.js` - Busca debounced de cartas (300ms)
  - `useCardPreview.js` - Gerenciar preview flutuante

#### Separação de Responsabilidades

- `src/routes/AppRoutes.jsx` - Definição isolada de rotas
- `src/pages/` - Componentes de página (Home.jsx, DeckBuilderPage.jsx)
- `src/services/` - Integrações (backendApi.js, scryfallApi.js)
- `src/utils/` - Funções utilitárias
- `src/constants/` - Constantes da aplicação

Resultado: `App.jsx` reduzido de 380+ linhas para ~70 linhas (shell + orquestração)

---

### 🔐 Autenticação

- **Sistema de Login/Registro** com validação backend
- **Persistência de Sessão** em localStorage (chave: `cmmtg.auth`)
- **Modal flutuante** na navbar com abas selecionáveis
- **Proteção de rotas** via `<ProtectedRoute>` do React Router

---

### 🎴 Construtor de Decks

#### Validações Implementadas

- **Máximo 4 cópias** por carta (exceptions: Basic Lands = ilimitadas)
- **Detecção automática** de Basic Lands via Scryfall `type_line`
- **60+ cartas obrigatório** no maindeck
- **15 cartas máximo** no sideboard
- **Legalidade por formato**: Standard, Modern, Pioneer, Legacy, Commander, Pauper
- Validação ocorre:
  - No adicionar carta
  - No editar quantidade
  - Antes de enviar ao backend

#### Busca de Cartas

- Integração com **Scryfall API** (`/cards/search`)
- Debounce de 300ms para evitar excess requests
- 8 sugestões máximas por busca
- Metadados capturados: nome, imagem, set, legalidades, tipo

#### Preview Flutuante

- Modal fixa no canto inferior direito (300px)
- Ativa no `onMouseEnter`, desativa no `onMouseLeave`
- Mostra imagem + nome da carta
- Z-index: 70 (acima de modais)

---

### 📥 Importação de Decks via .txt

#### Parser `parseDeckTxt.js`

- Suporta dois formatos:
  1. **Separado por linha em branco:**
     ```
     4 Battle Screech
     2 Eagles of the North
     [linha em branco]
     2 Destroy Evil
     ```
  2. **Com cabeçalhos explícitos:**
     ```
     Main Deck
     4 Card...
     Sideboard
     2 Card...
     ```

- **Normalização**: Remove acentos, case-insensitive

#### Fluxo de Importação

1. Usuário clica "Importar deck (.txt)"
2. Seleciona arquivo `.txt`
3. Parser extrai linhas (quantidade + nome)
4. Busca **cada carta exatamente** no Scryfall (`/cards/named?exact=`)
5. Resolve metadados (imagem, legalidades, tipo)
6. Preenche maindeck e sideboard automaticamente
7. Feedback: `"Deck importado com sucesso."` → auto-limpa em 3s

#### Tratamento de Erros

- Validação de extensão `.txt`
- Feedback se nenhuma carta for encontrada
- Feedback se cartas não existirem no Scryfall

---

### 🎨 Validação Visual de Formulário

#### Nome do Deck

- **Obrigatório** na submissão
- **Vazio → Feedback visual:**
  - Borda: `rgba(255, 98, 124, 0.95)` (vermelho)
  - Glow: `rgba(255, 98, 124, 0.2)`
  - Animação: `shake` (420ms)
- **Auto-reset:** Remove feedback ao digitar

#### Formato

- **Começar vazio** (sem valor default)
- **Placeholder:** "Selecione um formato"
- **Vazio→ shake + borda vermelha** (mesmo que nome)
- **Comportamento:** Obrigatório na submissão

#### Animação Shake

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

### 📱 Navegação com React Router

#### Rotas

- `/` → Home (pública): Hero + Torneios mockados
- `/decks` → DeckBuilderPage (protegida): Construtor de decks
- `/*` → Fallback: Redireciona para `/`

#### Componentes

- `BrowserRouter` em App.jsx (raiz)
- `<Link>` para navegação (Navbar)
- `<Navigate>` para fallback e redirecionamento

#### Proteção

- `<ProtectedRoute isAuthenticated={...}>` wraps componentes privados
- Redireciona para `/` se não autenticado

---

### 🎯 Mensagens com Auto-Limpeza

Mensagens de **sucesso** desaparecem automaticamente após 3 segundos (`MESSAGE_DISPLAY_MS`):

- `"Deck importado com sucesso."`
- `"Deck cadastrado com sucesso."`

Mensagens de **erro** permanecem visíveis:

- `"Nenhuma carta válida foi encontrada no arquivo."`
- `"As seguintes cartas não são legais em {formato}: ..."`
- Limites de quantidade/tamanho do deck

---

### 🎨 Design System

#### Cores (CSS Variables)

```css
--bg-1: #08060f /* Background */ --brand-2: #c795ff /* Roxo de marca */
  --text-main: #f5edff /* Texto principal */ --text-soft: #bfb0d9
  /* Texto secundário */ --line: rgba(199, 149, 255, 0.22) /* Bordas */;
```

#### Tipografia

- **Títulos:** Bebas Neue (Google Fonts)
- **Corpo:** Space Grotesk (Google Fonts)

#### Componentes

- `.btn.primary` - Gradient roxo
- `.btn.secondary` - Borda + fundo transparente
- `.btn.ghost` - Apenas cor de texto
- `.feedback` - Box de mensagem
- `.format-pill` - Badge de formato (roxo)

#### Responsividade

- `@media (max-width: 950px)`:
  - Navbar: Esconde nav, menu em dropdown
  - Grids: Colapsam para 1 coluna
  - DeckList: Botões de remover em 2ª linha

---

### 📚 Documentação

#### Arquivos Criados

- **DOCUMENTATION.md** - Guia técnico completo (arquitetura, hooks, APIs)
- **README.md** - Guia rápido (setup, funcionalidades, tecnologias)

---

### 📦 Tooling e Qualidade

#### Linting

- ESLint com regras padrão + React
- Zero warnings na build final

#### Build

- Vite (3s build time, <80KB gzipped JS)
- CSS otimizado (2.6KB gzipped)

#### Git

- `.gitignore` atualizado com:
  - `.env`, `.env.*` (excepto `.env.example`)
  - `node_modules`, `dist`, `dist-ssr`
  - `.cache`, `.eslintcache`, `.vite`
  - `coverage` (para testes futuros)

---

### 🚀 Tecnologias Usadas

- **React 19** - UI framework
- **Vite 7** - Build tool
- **React Router 7** - Navegação
- **Scryfall API** - Dados de cartas
- **CSS Puro** - Sem framework (design system manual)

---

## Resumo de Arquivos Criados/Modificados

### Novos

```
src/
├── hooks/useAuth.js
├── hooks/useCardPreview.js
├── hooks/useCardSearch.js
├── hooks/useDeckBuilder.js
├── hooks/index.js
├── pages/Home.jsx
├── pages/DeckBuilderPage.jsx
├── pages/index.js
├── routes/AppRoutes.jsx
├── routes/index.js
├── utils/parseDeckTxt.js
├── constants/auth.js
├── components/ProtectedRoute.jsx
DOCUMENTATION.md
```

### Modificados

```
src/App.jsx           (refatorado: 380→70 linhas)
src/main.jsx          (removido BrowserRouter duplicado)
src/App.css           (estilos novos: validação, shake, select customizado)
src/services/scryfallApi.js  (novo: buscarCartaPorNome)
src/components/DeckBuilder.jsx (novo: validação visual)
src/components/Navbar.jsx (Link em vez de <a>)
README.md             (substituído com doc real)
.gitignore            (adicionado: .env, coverage, caches)
```

---

## ✅ Checklist de Conclusão

- [x] Refatoração completa de App.jsx
- [x] 4 custom hooks para lógica centralizada
- [x] 8 componentes reutilizáveis
- [x] Sistema de autenticação com persistência
- [x] Construção de decks com validações
- [x] Importação de decks via .txt
- [x] Busca de cartas com Scryfall
- [x] Preview flutuante de cartas
- [x] Proteção de rotas (React Router)
- [x] Validação visual com shake
- [x] Auto-limpeza de mensagens de sucesso
- [x] Design system dark/roxo responsivo
- [x] Documentação técnica completa
- [x] .gitignore atualizado
- [x] Build otimizado (~80KB gzipped)

---

**Projeto pronto para desenvolvimento de features adicionais com arquitetura sólida e bem documentada.**
