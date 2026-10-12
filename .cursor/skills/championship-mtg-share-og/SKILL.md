---
name: championship-mtg-share-og
description: >-
  Open Graph / WhatsApp / Amplify share previews for tournaments and articles.
  Use when share links miss cover/banner, og:image is empty, Amplify rewrites,
  /torneios or /artigos crawlers, or HTML share routes on the API.
---

# Championship MTG — Share / Open Graph

Crawlers (WhatsApp, etc.) do **not** run the SPA. They need HTML meta tags from the first response.

## Correct pipeline

1. User shares `https://app.tiagofuguete.com.br/torneios/{5}-{slug}` or `/artigos/{5}-{slug}`
2. **Amplify rewrite 200** proxies to API share route (URL bar stays on app domain)
3. API builds HTML with `og:title`, `og:image`, `twitter:card=summary_large_image`, SPA bootstrap script
4. Browser loads React; crawler keeps the meta tags

## Amplify rules (Hosting → Rewrites)

Source of example: `amplify-rewrites.example.json`. **Must exist in the Amplify console**, not only in the repo.

Order matters — entity rewrites **before** SPA fallback:

```json
[
  {
    "source": "/torneios/<*>",
    "target": "https://ol5gj7iduc.execute-api.us-east-1.amazonaws.com/dev/torneio/share/<*>?v=2",
    "status": "200"
  },
  {
    "source": "/artigos/<*>",
    "target": "https://ol5gj7iduc.execute-api.us-east-1.amazonaws.com/dev/artigo/share/<*>?v=2",
    "status": "200"
  },
  {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>",
    "target": "/index.html",
    "status": "200"
  }
]
```

App id: `d32mjk9mbam2cb`. Domain CloudFront: `d1g7b5c48vw1d4.cloudfront.net`.

Update via CLI (profile with access):

```bash
aws amplify get-app --app-id d32mjk9mbam2cb --query app.customRules
aws amplify update-app --app-id d32mjk9mbam2cb --custom-rules '...'
```

## API routes

| Entity | SEO JSON | Share HTML |
|---|---|---|
| Torneio | `GET /torneio/:id/seo` | `GET /torneio/:id/share` (+ `/torneio/share/:id`) |
| Artigo | `GET /artigo/:id/seo` | `GET /artigo/:id/share` (+ `/artigo/share/:id`) |

Images: tournament `bannerUrl`; article `capaUrl`. Shared HTML helper: `montarHtmlCompartilhamento` in the tournament share route file.

When Amplify proxies, `Host` / `X-Forwarded-Host` is `app.tiagofuguete.com.br` → canonical URLs use that host. Direct API calls without that host fall back to `FRONTEND_URL` (may be wrong for OG URL — proxy is required for production shares).

## Diagnose missing cover

1. `curl -sI` the public URL — if `server: AmazonS3` and tiny `index.html`, **rewrite missing or CDN cache**
2. `curl` API `/artigo/.../seo` or `/torneio/.../seo` — confirm `image` is non-null
3. `curl` API `/.../share/...` — confirm `og:image` in HTML
4. Query string `?nocache=1` bypasses some CDN cache; redeploy Amplify branch if stale HTML stuck
5. WhatsApp caches previews — resend link after fix

## Front helpers

- `tournamentPath` / `deckPath` / `artigoPath`
- `buildTournamentExternalUrl` / `buildDeckExternalUrl` in `externalNavigation.js`
- Cover upload for articles uses OG banner dimensions in `bannerUpload.js`
