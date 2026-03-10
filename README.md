# MTG Championship Management - Frontend

Frontend React moderno para gerenciamento de campeonatos e decks de Magic: The Gathering.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

### Configuração de Ambiente

```bash
cp .env.example .env
```

Edite `.env` com a URL do backend:

```
VITE_API_BASE_URL=http://localhost:3000
```

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação

- Login com email/senha
- Registro de novo usuário
- Sessão persistente (localStorage)
- Modal flutuante na navbar

### 🎴 Construtor de Decks

- Busca de cartas pelo Scryfall em tempo real
- Validação automática:
  - Máximo 4 cópias por carta (unlimited básicas)
  - 60+ cartas no maindeck
  - 15 cartas max no sideboard
- Legalidade por formato (Standard, Modern, Pioneer, Legacy, Commander, Pauper)
- Preview flutuante ao hover

### 📥 Import de Decks

- Upload de arquivo `.txt`
- Formatos suportados:

  ```
  4 Card Name
  2 Another Card

  1 Sideboard Card
  ```

- Resolução automática via Scryfall

### 🎨 Design

- Dark mode roxo/violeta
- Responsivo (mobile-first)
- Animações suaves e feedback visual
- Validação visual com shake (nome e formato obrigatórios)

---

## 📁 Estrutura

```
src/
├── components/     # UI reutilizáveis
├── hooks/          # Lógica compartilhada (React)
├── pages/          # Páginas das rotas
├── routes/         # Definição de rotas
├── services/       # Integrações (backend, Scryfall)
├── utils/          # Funções auxiliares
├── constants/      # Constantes da app
└── App.jsx         # Shell principal
```

Veja [DOCUMENTATION.md](./DOCUMENTATION.md) para arquitetura completa e guia de desenvolvimento.

---

## 🔗 APIs

### Backend Local

```
POST /usuario/login
POST /usuario/cadastrar
POST /deck/cadastrar (requer Bearer token)
```

### Scryfall (externa)

```
GET https://api.scryfall.com/cards/search?q=...
GET https://api.scryfall.com/cards/named?exact=...
```

---

## 📦 Build & Deploy

```bash
npm run dev       # Dev server com HMR
npm run build     # Build production (dist/)
npm run preview   # Preview local do build
npm run lint      # ESLint check
```

---

## 🎯 Tecnologias

- **React 19** - UI framework
- **Vite 7** - Build tool (dev server rápido)
- **React Router 7** - Navegação e proteção de rotas
- **Scryfall API** - Dados de cartas MTG
- **CSS Puro** - Design system dark/roxo

---

## 🛣️ Rotas

- `/` - Home (pública) - Hero + Torneios
- `/decks` - Construtor de Decks (protegida, requer login)

---

## 📝 Próximos Passos

- [ ] Integração com backend real
- [ ] Página "Meus Decks"
- [ ] Histórico de torneios
- [ ] Sistema de ratings
- [ ] Suporte a mobile app

---

## 📄 Licença

Privado - Championship Management

---

**Veja [DOCUMENTATION.md](./DOCUMENTATION.md) para documentação detalhada da arquitetura, hooks, e guias de desenvolvimento.**
