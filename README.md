# MTG Championship Management - Frontend

SPA para organizar campeonatos, decks, ligas, times e metagame de Magic: The Gathering. O frontend consome a API do repositório `championship-management-mtg` e oferece atualização em tempo real durante torneios.

Versão atual: **1.2.41**

## Estado atual

O produto possui os fluxos principais implementados:

- autenticação JWT com renovação de sessão e recuperação de senha;
- criação, importação, edição, estatísticas e geração de imagens de decks;
- torneios Swiss com Top Cut, check-in, pareamentos, resultados e standings em tempo real;
- ingresso por link, anfitrião delegado e controles administrativos;
- ligas, rankings, times e perfis públicos;
- metagame por formato, arquétipos, listas e matchups;
- comunidade, parceiros, anúncios e páginas legais;
- contador de vida e calculadora Swiss/Top 8;
- exportação de Top 8 para imagem, story e vídeo.

## Stack

| Tecnologia | Uso |
|---|---|
| React 19 | Interface e composição de componentes |
| Vite 7 | Desenvolvimento e build |
| React Router 7 | Rotas lazy-loaded e proteção de páginas |
| TanStack React Query 5 | Cache e sincronização de dados do servidor |
| Tailwind CSS 4 | Tokens e estilos utilitários |
| Radix UI Primitives | Dialog, Tabs, Tooltip, Checkbox e Switch acessíveis |
| Lucide React | Ícones da interface |
| Axios | Cliente HTTP e renovação de token |
| Ably | Atualizações de torneios em tempo real |
| Scryfall API | Busca e dados de cartas |
| Vitest + Testing Library | Testes unitários e de componentes |

O projeto usa JavaScript e JSX, sem TypeScript.

## Requisitos

- Node.js 22 recomendado;
- npm;
- backend local ou remoto configurado;
- credenciais das integrações necessárias ao fluxo testado.

## Desenvolvimento local

```bash
npm install
cp .env.example .env
npm run dev
```

Por padrão, o Vite abre em `http://localhost:5173`.

Para usar a API local:

```env
VITE_ENVIRONMENT=development
VITE_USE_LOCALHOST=true
VITE_BACKEND_DEV_URL=http://localhost:3000
```

Consulte [.env.example](./.env.example) para Ably, YouTube, URL pública, WordPress e AdSense. Variáveis `VITE_*` são incorporadas ao bundle; não coloque segredos privados nelas.

## Scripts

```bash
npm run dev       # servidor Vite com HMR
npm run test      # suíte Vitest
npm run lint      # ESLint
npm run build     # build de produção em dist/
npm run preview   # preview local do build
```

## Estrutura

```text
src/
|-- components/       # auth, deck, liga, metagame, tournament e UI compartilhada
|-- context/          # autenticação e toasts
|-- hooks/            # estado e lógica reutilizável
|-- pages/            # páginas associadas às rotas
|-- routes/           # AppRoutes e guards
|-- services/         # backend, Ably e Scryfall
|-- styles/           # classes e documentação do design system
|-- test/             # testes Vitest
|-- utils/            # regras e transformações puras
|-- App.jsx           # shell e providers
`-- main.jsx          # entrada da aplicação
```

## Rotas principais

| Rota | Área |
|---|---|
| `/` | listagem de torneios |
| `/torneios/:id` | operação e acompanhamento do torneio |
| `/decks`, `/decks/criar` | decks e construtor |
| `/ligas`, `/ligas/:id` | ligas e rankings |
| `/times`, `/times/:id` | times |
| `/metagame` | visão consolidada do metagame |
| `/comunidade` | posts da comunidade |
| `/usuarios/:id` | perfil público |
| `/dashboard` | administração de anúncios |
| `/ferramentas/*` | contador de vida e calculadora Swiss |

Rotas de criação, edição e administração usam `ProtectedRoute`; parâmetros UUID usam `UuidParamGuard`.

## Sistema de UI

Tokens semânticos ficam em `src/index.css`, classes recorrentes em `src/styles/uiClasses.js` e componentes reutilizáveis em `src/components/ui`.

Os primitives do Radix são encapsulados por componentes locais (`BaseModal`, `Tabs`, `Tooltip`, `Checkbox` e `Switch`). Novas telas devem consumir essas wrappers para preservar tema, foco, teclado e APIs internas. Ícones de comandos devem usar Lucide quando disponíveis.

Consulte [DOCUMENTATION.md](./DOCUMENTATION.md), [AI_CONTEXT.md](./AI_CONTEXT.md) e [src/styles/DESIGN_SYSTEM.md](./src/styles/DESIGN_SYSTEM.md).

## Build e deploy

O build gera `dist/` e o deploy está configurado para AWS Amplify em `amplify.yml`. As rotas da SPA precisam redirecionar para `index.html` no ambiente de hospedagem.

## Licença

Projeto privado.
