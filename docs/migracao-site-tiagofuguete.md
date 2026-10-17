# Migração do site tiagofuguete.com.br → app Fuguete

Documento de levantamento (somente especificação — **sem implementação**).

Objetivo: trazer o site institucional WordPress (`tiagofuguete.com.br`) para dentro do SPA (`app.tiagofuguete.com.br`), com conteúdo **administrável** (não hardcoded), aproveitando o que o app já tem (artigos, galeria, torneios, anúncios).

---

## 1. O que existe hoje no WordPress

### 1.1 Navegação principal

| Item | URL WP | Destino atual |
|---|---|---|
| Home | `/` | Site WP |
| Hall Da Fama | `/hall-da-fama/` | Site WP |
| Decks | `/decks/` | Site WP (catálogo de arquétipos Pauper) |
| Artigos | `/blog/` | Site WP (posts) |
| Sobre mim | `/sobre-mim/` | Site WP |
| Parceiros | `/parceiros/` | Site WP |
| Torneios | `https://app.tiagofuguete.com.br/` | Já é o app |

Stack visual WP: tema escuro, logo foguete, ads (AdSense / blocks de anúncio), feed Instagram no rodapé, redes (YouTube, Twitch, X, e-mail, WhatsApp).

### 1.2 Home (`/`)

Blocos, de cima para baixo:

1. **Carrossel hero (4 slides)**  
   - Imagem de fundo full-bleed + título + texto + CTA.  
   - Slides observados:
     - “Bem-vindo ao meu universo Pauper!” → Sobre mim  
     - “Torneios Grátis” → Torneios / app  
     - “Seja um apoiador…” → Apoia-se  
     - “Me siga nas redes…” → Instagram  
   - Controles: prev/next + dots; autoplay.

2. **Vídeos YouTube** — “Vídeos de Pauper todos os dias!”  
   - Grade de thumbs (últimos vídeos do canal).  
   - CTA para o canal.

3. **Twitch embed** — “Transmissões e campeonatos ao vivo…”  
   - Player do canal `tiagofuguete`.

4. **Novidades / Artigos** — “Veja as novidades”  
   - Cards com capa + título + “Ler mais” (posts do blog).  
   - Paginação no WP.

5. **Parceiros do canal**  
   - Carrossel de logos.  
   - Link “Saiba mais” → `/parceiros/`.

6. **Footer** — redes + feed Instagram (“tiagofuguete”) + CTAs laterais (Trocar Cartas / Jogar Online / Álbuns de Fotos).

### 1.3 Hall da Fama (`/hall-da-fama/`)

- Intro: “Participe de nossos torneios FREE…”
- Cards de séries recorrentes:
  - **Fuguete Champ** — segunda 20h, Play Points + 9 TIX  
  - **Fuguete League** — quarta 20h, Play Points + 6 TIX  
  - **Tropical Pauper** — sábado 10h, Play Points + 6 TIX  
- Seção **Hall da Fama** (galeria / destaques de campeões — conteúdo visual).
- CTA “Novo no Magic Online? Comece por aqui!”.

### 1.4 Decks (`/decks/`)

- Grid grande (~50+) de arquétipos Pauper (Abzan Sisters, Grixis Affinity, Mono Red Madness, …).
- Cada card: imagem + nome + “Ver deck”.
- CTA para Apoia-se (conteúdo exclusivo / side guides).
- Conteúdo hoje é página estática / custom post no WP — **não** é o mesmo domínio de decks do app (`/decks` = decks do usuário).

### 1.5 Artigos (`/blog/`)

- Lista “Últimas postagens” com capa, título, resumo, “Read more”, paginação.
- Exemplos: Fuguete na Tenda, Downshift, Guias de side, SuperCup, etc.
- Posts individuais em URLs tipo `/AAAA/MM/DD/slug/`.

### 1.6 Sobre mim (`/sobre-mim/`)

- Título “Minha história no Magic” + foto + texto biográfico.
- Bloco Apoia-se (“Quero apoiar!”).
- Carrossel de fotos (“Isso é Magic, isso é Tiago Fuguete”) — ~7 slides.
- Lista de agradecimento aos apoiadores (“Obrigado!”).

### 1.7 Parceiros (`/parceiros/`)

- Headline de orgulho / comunidade.
- Faixa de cupom **FUGUETE05** (5% off).
- Grid “Nossos patrocinadores” — logos clicáveis (~13+ lojas: Mineral, Mont, Muka, Dungeon, Glorin, CardTrader, TCG InBox, Capi Cards, …).
- CTA “Ainda não é parceiro?” + contato (WhatsApp bit.ly / e-mail).

---

## 2. O que o app já tem (estado atual)

| Capacidade | Situação no app |
|---|---|
| Torneios | Home `/` = lista de torneios; realtime, etc. |
| Artigos | `/artigos` + editor + aprovação admin — **domínio próprio (API)** |
| Galeria de fotos | `/galeria` — upload admin, thumbs, paginação |
| Sobre mim | `/sobre-mim` — **conteúdo estático** em `LandingSobreMimPage.jsx` |
| Parceiros | `/parceiros` — **lista hardcoded** em `LandingParceirosPage.jsx` |
| Landing home estilo WP | `LandingPage.jsx` existe (carrossel/YouTube/Twitch/posts/parceiros **hardcoded**), mas **não está roteada** (`/` = torneios) |
| Decks “Meus decks” (catálogo Pauper) | `LandingDecksPage.jsx` existe (hardcoded → links WP); rota `/decks` hoje é **MyDecksPage** (decks do usuário) |
| Hall da Fama | **Não existe** no app |
| Anúncios de site | API `site/anuncios` + `anuncio-diario` (cards/banners com métricas) — **não** é o mesmo que “parceiros” |
| Embed WP | App ainda pensado para ser embutido no WP (`torneios` via iframe) |

Conclusão: o app já cobre bem **torneios + artigos + galeria**. Decisões de produto fechadas (§5). Falta implementar: **landing em `/`**, **torneios em `/torneios`**, carrossel/parceiros CRUD, migração de posts, Hall Top 8 automático, visual alinhado ao app.

---

## 3. Requisitos explícitos do produto (desta conversa)

1. **Carrossel inicial editável** — admin escolhe fotos (e, idealmente, título/texto/CTA/ordem/ativo).  
2. **Parceiros com cadastro e exclusão** — CRUD admin (nome, logo, link, ordem, cupom opcional).  
3. **Artigos no site** — usar o módulo `/artigos` já existente (listagem na home + página dedicada).  
4. **“E tudo mais”** — espelhar as seções relevantes do WP, com conteúdo gerenciável onde fizer sentido.

---

## 4. Proposta de mapeamento (site no app)

### 4.1 Estrutura de rotas (decidida)

| Rota app | Função | Origem WP |
|---|---|---|
| `/` | **Landing institucional** (hero + vídeos + live + artigos + parceiros) | `/` |
| `/torneios` | Lista de torneios (hoje em `/`) | link “Torneios” |
| `/artigos` | Blog (já existe) | `/blog/` |
| `/parceiros` | Página de parceiros (dinâmica) | `/parceiros/` |
| `/sobre-mim` | Bio + galeria + apoiadores | `/sobre-mim/` |
| `/hall-da-fama` | Compilado de imagens Top 8 (mais recente primeiro) | `/hall-da-fama/` |
| `/galeria` | Álbuns / fotos de eventos (já existe) | “Álbuns de Fotos” |
| `/decks` | Decks do **usuário Fuguete** (já existe — MyDecks) | link “Decks” da landing |

Nav da landing aponta Decks → `/decks` (decks do usuário), não para o catálogo estático de arquétipos do WP.

### 4.2 Home — blocos e fontes de dados

| Bloco | Fonte desejada | Admin |
|---|---|---|
| Hero carousel | Nova entidade `slidesHome` (API) | CRUD: imagem, título, texto, CTA label/url, ordem, ativo |
| YouTube | API YouTube (já há `useYouTubeVideos`) | Config: channel id / qtd |
| Twitch | Embed (já na `LandingPage`) | Config: channel + parent domains |
| Novidades | `GET /artigos` (já existe) | Editor de artigos atual |
| Parceiros (carrossel) | Nova entidade `parceiros` | CRUD parceiros |
| Footer / redes | Config site ou constants | Opcional: editável |

### 4.3 Parceiros (CRUD)

**Modelo sugerido**

```
Parceiro {
  id, nome, logoUrl, linkUrl,
  cupom?, ordem, ativo,
  criadoEm, atualizadoEm
}
```

**API (esboço)**

- `GET /parceiros` — público  
- `POST /parceiros` — admin  
- `PUT /parceiros/:id` — admin  
- `DELETE /parceiros/:id` — admin  

Upload de logo via fluxo S3/presign já existente (`imagens/…`, preferir WebP).

**UI**

- Página pública `/parceiros` (grid + cupom global opcional + CTA contato).  
- Dashboard admin: listar / criar / editar / excluir / reordenar.  
- Home consome a mesma lista (carrossel dos ativos).

**Nota:** não misturar com `anuncios` (cards/banners com clique). Parceiro = logo de patrocinador; anúncio = peça promocional metricada.

### 4.4 Carrossel home (CRUD)

**Modelo sugerido**

```
SlideHome {
  id, imagemUrl, titulo, texto?,
  ctaTexto?, ctaUrl?,
  ordem, ativo
}
```

**API (esboço)**

- `GET /site/home-slides` — público (só ativos, ordenados)  
- `PUT /site/home-slides` — admin (salvar lista completa, padrão anúncios)  
  ou CRUD item a item  

**UI admin**

- Escolher/trocar foto (upload).  
- Editar textos e link.  
- Ativar/desativar, ordenar, excluir.  
- Preview do carrossel.

### 4.5 Artigos

- Home: últimos N artigos publicados (`listarArtigos`).  
- Página `/artigos` e `/artigos/:id` já prontas.  
- **Migrar todos os posts** do WP → API (HTML, capas, slugs, datas, autores).  
- Redirects 301 de URLs WP `/AAAA/MM/DD/slug` → `/artigos/{shortId}-{slug}` (quando houver cutover de domínio).

### 4.6 Sobre mim

Hoje estático. Preferência: CMS leve (`conteudoSobreMim`): bio, foto, galeria, apoiadores, link Apoia-se — no visual do design system do app de torneios.

### 4.7 Hall da Fama (decidido)

Não é um hall manual de “campeões”. É um **compilado das imagens de Top 8** geradas ao finalizar torneios.

**Fluxo**

1. Torneio é encerrado / finalizado.  
2. O sistema **gera a imagem de Top 8** (reaproveitar o fluxo atual de story Top 8 no front — `Top8StoryModal` / canvas).  
3. A imagem é **salva no S3** e registrada no Hall (Dynamo).  
4. `/hall-da-fama` lista essas imagens, **mais recente primeiro**.  
5. Admin pode gerenciar via **CRUD** (excluir, ocultar, eventualmente reordenar/republicar).

**Modelo sugerido**

```
HallTop8 {
  id, torneioId, torneioNome?,
  imagemUrl,
  criadoEm,   // ordenação desc
  ativo       // soft-hide
}
```

**API (esboço)**

- `GET /hall-da-fama` — público, paginado, `criadoEm` desc, só `ativo`.  
- `POST /hall-da-fama` — interno/admin (após gerar imagem no encerramento) ou endpoint dedicado no fluxo de finalizar torneio.  
- `DELETE` / `PATCH` (ativo) — admin.

**Integração**

- Hook no encerrar/finalizar torneio (ou passo explícito “Publicar Top 8 no Hall”) para não perder o artefato.  
- UI hall: grade de imagens clicáveis (lightbox / link ao torneio).

### 4.8 Decks na landing

Link **Decks** da landing/nav = `/decks` do app (**decks do usuário Fuguete** / MyDecks).  
O catálogo estático de arquétipos do WP (`LandingDecksPage` / `/decks/` WP) **não** é o destino da nav; fica fora do escopo principal (pode arquivar ou redirecionar depois).

### 4.9 Ads (AdSense)

Manter AdSense no site novo. Slots sugeridos (encaixe no layout do app, sem poluir o hero):

| Slot | Onde | Nota |
|---|---|---|
| `home-below-hero` | Home, logo abaixo do carrossel | Alto inventário, não cobre CTA |
| `home-between-sections` | Entre YouTube e Twitch (ou Twitch e artigos) | Separador natural |
| `artigos-lista` | Lista `/artigos`, após N cards | Feed nativo / retângulo |
| `artigo-conteudo` | Dentro do artigo, após intro / antes dos comentários | In-article |
| `parceiros-topo` ou `hall-topo` | Abaixo do título das páginas secundárias | Opcional |

Respeitar consentimento de cookies (`cookieConsent`) já existente no app antes de carregar tags de anúncio.

### 4.10 Visual / design

**Revisar** a landing e páginas institucionais para **bater com o design system do app de torneios** (tokens, tipografia, Navbar/LandingHeader unificados, cards, cores brand). Não copiar o look WordPress 1:1.

---

## 5. Decisões (fechadas)

| # | Tema | Decisão |
|---|---|---|
| 1 | Home | `/` = landing institucional; lista de torneios em **`/torneios`** |
| 2 | Domínio `tiagofuguete.com.br` → SPA | **Momentaneamente não** (WP continua; app evolui em paralelo) |
| 3 | AdSense | **Sim** — slots em §4.9 |
| 4 | Decks na landing | Aponta para **`/decks` do usuário** (Fuguete), não catálogo WP |
| 5 | Posts WP | **Migrar todos** para a API de artigos |
| 6 | Hall da Fama | Compilado de **imagens Top 8** geradas ao finalizar torneio + CRUD; ordem **mais recente primeiro** |
| 7 | Visual | **Revisar** para o design system do app de torneios |

---

## 6. Escopo sugerido por fases (sem implementar agora)

### Fase 1 — Rotas + base administrável

- `/` → landing; `/torneios` → lista atual.  
- Slides do carrossel (CRUD + escolher fotos).  
- Parceiros (CRUD).  
- Home consumindo slides + parceiros + artigos da API.  
- Visual alinhado ao app.

### Fase 2 — Conteúdo + migração

- Migrar **todos** os posts WP → artigos.  
- Sobre mim no design do app (CMS leve ou híbrido).  
- Slots AdSense (§4.9) + consentimento.  
- Nav Decks → `/decks` do usuário.

### Fase 3 — Hall da Fama Top 8

- Persistência da imagem Top 8 ao finalizar torneio.  
- Página `/hall-da-fama` (grade, mais recente primeiro).  
- CRUD admin (excluir / ocultar).

---

## 7. Já reaproveitável no código

| Peça | Arquivo / área |
|---|---|
| Mock da home WP | `src/pages/LandingPage.jsx` (referência visual; slides/posts hardcoded) |
| Header landing | `src/components/ui/LandingHeader.jsx` |
| Parceiros estáticos | `src/pages/LandingParceirosPage.jsx` |
| Sobre mim estático | `src/pages/LandingSobreMimPage.jsx` |
| Decks do usuário | `MyDecksPage` (`/decks`) — destino do link Decks da landing |
| Artigos | `BlogPage` / `BlogArticlePage` / API artigos |
| Story Top 8 (canvas) | `Top8StoryModal` / geradores de imagem — base do Hall |
| Upload imagem | `obterPresignedUrl` + S3 (mesmo fluxo galeria/banner) |
| Site config Dynamo | `SiteConfigGateway` (padrão anúncios — estender ou criar entidades irmãs) |
| YouTube | `useYouTubeVideos` |
| Consent ads | `cookieConsent` / AdSense helpers |

---

## 8. Critérios de pronto (produto)

- `/` = landing; `/torneios` = lista de torneios.  
- Admin troca fotos/textos do carrossel sem deploy.  
- Admin cadastra/exclui parceiros; home e `/parceiros` refletem na hora.  
- Novidades da home = artigos do app; posts WP migrados.  
- Ao finalizar torneio, imagem Top 8 entra no `/hall-da-fama` (mais recente primeiro).  
- Visual institucional alinhado ao design system do app.  
- Cutover de `tiagofuguete.com.br` **ainda não** (fase futura).

---

## 9. Referências rápidas do site atual

- Home: https://tiagofuguete.com.br/  
- Blog: https://tiagofuguete.com.br/blog/  
- Parceiros: https://tiagofuguete.com.br/parceiros/  
- Sobre mim: https://tiagofuguete.com.br/sobre-mim/  
- Hall: https://tiagofuguete.com.br/hall-da-fama/  
- Decks (catálogo WP — fora do escopo da nav): https://tiagofuguete.com.br/decks/  
- Torneios (app): https://app.tiagofuguete.com.br/  

Última atualização: decisões de produto fechadas (out/2026).
