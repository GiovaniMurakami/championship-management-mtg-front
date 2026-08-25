import { getCardTypeGroup } from "../../utils/cardTypeGroup";

// ── helpers ───────────────────────────────────────────────────────────────────

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Prefer CDN "normal" size for canvas (lighter + same art as large). */
export function toCanvasImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  return url.replace("/large/", "/normal/").replace("/png/", "/normal/");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function loadImageFromUrl(url, { crossOrigin = "anonymous", retries = 2 } = {}) {
  const src = toCanvasImageUrl(url);
  if (!src) return Promise.resolve(null);

  return (async () => {
    for (let left = retries; left >= 0; left -= 1) {
      const img = await new Promise((resolve) => {
        const image = new Image();
        if (crossOrigin) image.crossOrigin = crossOrigin;
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = src;
      });
      if (img) return img;
      if (left > 0) await delay(120);
    }
    return null;
  })();
}

async function fetchNamedCardImage(cardName) {
  const normalizedName = cardName?.trim().replace(/\s*\/\/\s*/g, " // ").replace(/\s+/g, " ");
  const candidates = [
    normalizedName,
    ...(normalizedName?.includes(" // ") ? normalizedName.split(" // ").map((face) => face.trim()) : []),
  ].filter(Boolean);

  try {
    let resp = null;

    for (const candidate of [...new Set(candidates)]) {
      const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(candidate)}&format=image&version=normal`;
      resp = await fetch(url);
      if (resp.ok) break;
      if (resp.status === 429) {
        await delay(800);
        resp = await fetch(url);
        if (resp.ok) break;
      }
    }

    if (!resp?.ok && normalizedName) {
      const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(normalizedName)}&format=image&version=normal`;
      resp = await fetch(url);
      if (resp.status === 429) {
        await delay(800);
        resp = await fetch(url);
      }
    }

    if (!resp?.ok) return null;

    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(blobUrl); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(null); };
      img.src = blobUrl;
    });
  } catch {
    return null;
  }
}

/**
 * Loads a card Image for canvas drawing.
 * Prefers an already-known Scryfall image URL (avoids rate limits); falls back to named API.
 */
export async function fetchCardImg(cardName, preferredUrl = "") {
  if (preferredUrl) {
    const fromUrl = await loadImageFromUrl(preferredUrl);
    if (fromUrl) return fromUrl;
  }
  return fetchNamedCardImage(cardName);
}

/** Run async work over items with a fixed concurrency pool. */
export async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  const poolSize = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: poolSize }, () => runWorker()));
  return results;
}

/**
 * Loads HTMLImageElement for each card entry using known URLs first.
 * @param {Array<{ nome: string, imagem?: string }>} cards
 * @param {{ concurrency?: number, onProgress?: (done: number, total: number) => void, isCancelled?: () => boolean }} options
 */
export async function loadCardImagesForDeck(cards, options = {}) {
  const { concurrency = 6, onProgress, isCancelled } = options;
  const total = cards.length;
  let done = 0;

  return mapWithConcurrency(cards, concurrency, async (card) => {
    if (isCancelled?.()) return null;
    const img = await fetchCardImg(card.nome, card.imagem || "");
    done += 1;
    onProgress?.(done, total);
    return img;
  });
}

const GROUP_ORDER = ["Creature", "Planeswalker", "Instant", "Sorcery", "Enchantment", "Artifact", "Other", "Land"];
const GROUP_COLOR = {
  Creature: "#6ee7b7", Planeswalker: "#fcd34d", Instant: "#60a5fa",
  Sorcery: "#f87171", Enchantment: "#c084fc", Artifact: "#94a3b8",
  Land: "#a78bfa", Other: "#e9d5ff",
};

function getTypeGroup(typeLine) {
  const group = getCardTypeGroup(typeLine);
  return GROUP_ORDER.includes(group) ? group : "Other";
}
const FMT_COLOR = {
  standard: "#93c5fd", modern: "#fdba74", pioneer: "#6ee7b7",
  legacy: "#c4b5fd", commander: "#fcd34d", commander500: "#f59e0b", pauper: "#cbd5e1",
};

// ── shared canvas helpers ─────────────────────────────────────────────────────

function drawBg(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);
  bg.addColorStop(0, "#0b0618");
  bg.addColorStop(0.5, "#0f0820");
  bg.addColorStop(1, "#080414");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.011)";
  for (let gx = 40; gx < w; gx += 46)
    for (let gy = 40; gy < h; gy += 46) {
      ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill();
    }
}

function drawTopAccent(ctx, w) {
  const bar = ctx.createLinearGradient(0, 0, w, 0);
  bar.addColorStop(0, "rgba(167,79,255,0)");
  bar.addColorStop(0.3, "rgba(167,79,255,0.9)");
  bar.addColorStop(0.7, "rgba(255,215,0,0.65)");
  bar.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, w, 5);
}

function drawWatermark(ctx, canvasW, canvasH) {
  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(canvasW * 0.075)}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.rotate(-Math.PI / 6);
  const step = Math.round(canvasW * 0.38);
  for (let dy = -canvasH; dy <= canvasH; dy += step)
    for (let dx = -canvasW; dx <= canvasW; dx += step)
      ctx.fillText("FUGUETE", dx, dy);
  ctx.restore();
}

function drawFooter(ctx, canvasW, canvasH, footerH, brandImage, centered = false) {
  const fy = canvasH - footerH;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, fy, canvasW, footerH);
  const line = ctx.createLinearGradient(0, fy, canvasW, fy);
  line.addColorStop(0, "rgba(167,79,255,0)");
  line.addColorStop(0.2, "rgba(167,79,255,0.6)");
  line.addColorStop(0.8, "rgba(255,215,0,0.45)");
  line.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = line;
  ctx.fillRect(0, fy, canvasW, 1.5);

  const brandText = "TIAGO FUGUETE";
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.textAlign = "left";
  const iconSize = 30;
  const iconGap = brandImage ? 9 : 0;
  const signatureW = ctx.measureText(brandText).width + (brandImage ? iconSize + iconGap : 0);
  const signatureX = centered ? (canvasW - signatureW) / 2 : 20;
  if (brandImage) {
    ctx.drawImage(brandImage, signatureX, fy + (footerH - iconSize) / 2, iconSize, iconSize);
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillText(brandText, signatureX + (brandImage ? iconSize + iconGap : 0), fy + footerH / 2 + 8);

  ctx.fillStyle = "#3d2470";
  ctx.font = "16px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(new Date().toLocaleDateString("pt-BR"), canvasW - 20, fy + footerH / 2 + 6);
  ctx.textAlign = "left";
}

function drawTypeBadges(ctx, canvasW, y, barH, typeCnt) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, y, canvasW, barH);
  ctx.strokeStyle = "rgba(167,79,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, y + barH); ctx.lineTo(canvasW, y + barH); ctx.stroke();

  const badgeH = Math.max(24, Math.round(barH * 0.58));
  const badgeY = y + Math.round((barH - badgeH) / 2);
  ctx.font = `bold ${Math.max(14, Math.round(barH * 0.36))}px Arial, sans-serif`;
  const active = GROUP_ORDER.filter(g => typeCnt[g] > 0);
  const bws = active.map(g => ctx.measureText(`${g}  ${typeCnt[g]}`).width + 28);
  const total = bws.reduce((s, w) => s + w, 0) + (active.length - 1) * 10;
  let sx = Math.round((canvasW - total) / 2);
  for (let i = 0; i < active.length; i++) {
    const g = active[i]; const col = GROUP_COLOR[g];
    const lw = bws[i];
    ctx.fillStyle = `${col}20`; rr(ctx, sx, badgeY, lw, badgeH, 12); ctx.fill();
    ctx.strokeStyle = `${col}55`; ctx.lineWidth = 0.8;
    rr(ctx, sx, badgeY, lw, badgeH, 12); ctx.stroke();
    ctx.fillStyle = col;
    ctx.fillText(`${g}  ${typeCnt[g]}`, sx + 14, badgeY + Math.round(badgeH * 0.68));
    sx += lw + 10;
  }
}

function drawCmcBars(ctx, deck, cardDataMap, bxStart, topY, bw, barH) {
  const LABEL_PAD = 16; // espaço para o número acima da barra (evita cortar na borda)
  const trackTop = topY + LABEL_PAD;
  const trackH = Math.max(8, barH - LABEL_PAD);
  const cmcDist = {};
  for (const c of deck.maindeck || []) {
    const v = Math.min(Math.floor(cardDataMap[c.nome]?.cmc ?? 0), 7);
    cmcDist[v] = (cmcDist[v] || 0) + (c.quantidade || 1);
  }
  const cmcMax = Math.max(...Object.values(cmcDist), 1);
  for (let i = 0; i <= 7; i++) {
    const cnt = cmcDist[i] || 0;
    const bh = cnt > 0 ? Math.max(4, Math.round((cnt / cmcMax) * trackH)) : 0;
    const bx = bxStart + i * (bw + 4);
    const by2 = trackTop + trackH - bh;
    ctx.fillStyle = "rgba(100,60,180,0.1)"; rr(ctx, bx, trackTop, bw, trackH, 3); ctx.fill();
    if (bh > 0) {
      const g = ctx.createLinearGradient(bx, by2, bx, by2 + bh);
      g.addColorStop(0, "#c084fc"); g.addColorStop(1, "#7c3aed");
      ctx.fillStyle = g; rr(ctx, bx, by2, bw, bh, 3); ctx.fill();
      ctx.font = "bold 12px Arial, sans-serif"; ctx.fillStyle = "#e9d5ff"; ctx.textAlign = "center";
      ctx.fillText(cnt, bx + bw / 2, by2 - 3);
    }
    ctx.font = "12px Arial, sans-serif"; ctx.fillStyle = "#4b2d8a"; ctx.textAlign = "center";
    ctx.fillText(i === 7 ? "7+" : String(i), bx + bw / 2, trackTop + trackH + 14);
  }
  ctx.textAlign = "left";
}

function drawCardOnCanvas(ctx, img, x, y, w, h, borderRgba) {
  if (img) {
    ctx.save(); rr(ctx, x, y, w, h, 5); ctx.clip();
    ctx.drawImage(img, x, y, w, h); ctx.restore();
  } else {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, "#2a175a"); g.addColorStop(1, "#180a32");
    ctx.fillStyle = g; rr(ctx, x, y, w, h, 5); ctx.fill();
  }
  ctx.strokeStyle = borderRgba || "rgba(255,255,255,0.13)";
  ctx.lineWidth = 1; rr(ctx, x, y, w, h, 5); ctx.stroke();
}

/** Escolhe grade e tamanho de carta para preencher a caixa disponível. */
function layoutPilesInBox(availW, availH, pileCount, pileLen, gapX = 10, gapY = 12) {
  let best = null;
  const maxRows = Math.min(pileCount, 12);
  for (let rows = 1; rows <= maxRows; rows++) {
    const cols = Math.ceil(pileCount / rows);
    const gapXTotal = (cols - 1) * gapX;
    const gapYTotal = (rows - 1) * gapY;
    if (gapXTotal >= availW || gapYTotal >= availH) continue;

    const maxCardW = Math.floor((availW - gapXTotal) / cols);
    if (maxCardW < 40) continue;

    const maxPileH = Math.floor((availH - gapYTotal) / rows);
    const stackRatio = 0.12;
    let cardH = Math.floor(maxPileH / (1 + (pileLen - 1) * stackRatio));
    let cardW = Math.round(cardH / 1.4);
    if (cardW > maxCardW) {
      cardW = maxCardW;
      cardH = Math.round(cardW * 1.4);
    }
    if (cardH < 48 || cardW < 34) continue;

    let stackOffset = pileLen > 1
      ? Math.max(10, Math.min(Math.round(cardH * stackRatio), Math.floor((maxPileH - cardH) / (pileLen - 1))))
      : 0;
    let pileH = cardH + (pileLen - 1) * stackOffset;

    const usedW = cols * cardW + gapXTotal;
    const usedH = rows * pileH + gapYTotal;
    const scale = Math.min(availW / usedW, availH / usedH, 1.35);
    if (scale > 1.01) {
      cardW = Math.floor(cardW * scale);
      cardH = Math.round(cardW * 1.4);
      stackOffset = pileLen > 1 ? Math.max(10, Math.round(cardH * stackRatio)) : 0;
      while (
        (cols * cardW + gapXTotal > availW ||
          rows * (cardH + (pileLen - 1) * stackOffset) + gapYTotal > availH) &&
        cardW > 34
      ) {
        cardW -= 1;
        cardH = Math.round(cardW * 1.4);
        stackOffset = pileLen > 1 ? Math.max(10, Math.round(cardH * stackRatio)) : 0;
      }
      pileH = cardH + (pileLen - 1) * stackOffset;
    }

    const fillW = (cols * cardW + gapXTotal) / availW;
    const fillH = (rows * pileH + gapYTotal) / availH;
    const fill = fillW * fillH;
    const area = cardW * cardH;
    const score = area * (0.55 + 0.45 * fill);
    if (!best || score > best.score) {
      best = { score, rows, cols, cardW, cardH, stackOffset, pileH, gapX, gapY };
    }
  }
  return best;
}

export function buildVisualCanvas(deck, cardDataMap, ownerName, ratio = "16x9", brandImage = null) {
  const MAX_PILE = 4;
  const HEADER_H = 96;
  const STATS_H = 40;
  const FOOTER_H = 48;
  const PAD = 16;
  const PILE_GAP_X = 10;
  const PILE_GAP_Y = 12;

  const is169 = ratio === "16x9";
  const CANVAS_W = is169 ? 1280 : 1080;
  const hasSide = (deck.sideboard || []).length > 0;
  const SIDE_W = is169 && hasSide ? 200 : 0;
  const MAIN_X = PAD;
  const MAIN_W = CANVAS_W - SIDE_W - MAIN_X - (is169 && hasSide ? 10 : PAD);

  const sideCards = deck.sideboard || [];
  const sideSlots = [];
  for (const card of sideCards)
    for (let i = 0; i < Math.min(card.quantidade || 1, MAX_PILE); i++)
      sideSlots.push({ nome: card.nome, img: cardDataMap[card.nome]?.img });
  const sidePiles = [];
  for (let i = 0; i < sideSlots.length; i += MAX_PILE) sidePiles.push(sideSlots.slice(i, i + MAX_PILE));

  const sorted = [...(deck.maindeck || [])].sort((a, b) =>
    (cardDataMap[a.nome]?.cmc ?? 0) - (cardDataMap[b.nome]?.cmc ?? 0) || a.nome.localeCompare(b.nome)
  );
  const allSlots = [];
  for (const card of sorted)
    for (let i = 0; i < Math.min(card.quantidade || 1, MAX_PILE); i++)
      allSlots.push({ nome: card.nome, img: cardDataMap[card.nome]?.img, typeLine: cardDataMap[card.nome]?.typeLine });
  const piles = [];
  for (let i = 0; i < allSlots.length; i += MAX_PILE) piles.push(allSlots.slice(i, i + MAX_PILE));
  const totalPiles = Math.max(piles.length, 1);
  const maxPileLen = Math.max(1, ...piles.map((p) => p.length));

  let CARD_W, CARD_H, STACK_OFFSET, PILE_H, pilesPerRow, nRows, CANVAS_H;
  let mainGapX = PILE_GAP_X;
  let mainGapY = PILE_GAP_Y;
  let mainOriginX = MAIN_X;
  let mainOriginY = 0;
  let SC9W = 0, SC9H = 0, SC9VS = 0, SIDE916_H = 0;
  let sideLayout = null;

  if (is169) {
    CANVAS_H = 720;
    const AVAIL_H = CANVAS_H - HEADER_H - STATS_H - FOOTER_H - PAD * 2;
    const AVAIL_W = MAIN_W;
    const layout = layoutPilesInBox(AVAIL_W, AVAIL_H, totalPiles, maxPileLen) || {
      rows: 1, cols: totalPiles, cardW: 60, cardH: 84, stackOffset: 14, pileH: 84, gapX: PILE_GAP_X, gapY: PILE_GAP_Y,
    };
    nRows = layout.rows;
    pilesPerRow = layout.cols;
    CARD_W = layout.cardW;
    CARD_H = layout.cardH;
    STACK_OFFSET = layout.stackOffset;
    PILE_H = layout.pileH;
    mainGapX = layout.gapX;
    mainGapY = layout.gapY;

    const usedW = Math.min(totalPiles, pilesPerRow) * CARD_W + (Math.min(totalPiles, pilesPerRow) - 1) * mainGapX;
    const usedH = nRows * PILE_H + (nRows - 1) * mainGapY;
    mainOriginX = MAIN_X + Math.max(0, Math.floor((AVAIL_W - usedW) / 2));
    mainOriginY = HEADER_H + STATS_H + PAD + Math.max(0, Math.floor((AVAIL_H - usedH) / 2));

    if (hasSide && sidePiles.length > 0) {
      const sideAvailW = SIDE_W - 16;
      const sideAvailH = AVAIL_H;
      const sideMaxLen = Math.max(1, ...sidePiles.map((p) => p.length));
      const sideCols = sidePiles.length <= 2 ? 1 : 2;
      const sideRows = Math.ceil(sidePiles.length / sideCols);
      const gapX = 6;
      const gapY = 8;
      const gapXTotal = (sideCols - 1) * gapX;
      const gapYTotal = (sideRows - 1) * gapY;
      let cw = Math.floor((sideAvailW - gapXTotal) / sideCols);
      let ch = Math.round(cw * 1.4);
      let so = sideMaxLen > 1 ? Math.max(10, Math.round(ch * 0.12)) : 0;
      let ph = ch + (sideMaxLen - 1) * so;
      while (sideRows * ph + gapYTotal < sideAvailH * 0.92) {
        const nextW = cw + 2;
        const nextH = Math.round(nextW * 1.4);
        const nextSo = sideMaxLen > 1 ? Math.max(10, Math.round(nextH * 0.12)) : 0;
        const nextPh = nextH + (sideMaxLen - 1) * nextSo;
        if (sideCols * nextW + gapXTotal > sideAvailW) break;
        if (sideRows * nextPh + gapYTotal > sideAvailH) break;
        cw = nextW; ch = nextH; so = nextSo; ph = nextPh;
      }
      while (sideRows * ph + gapYTotal > sideAvailH && cw > 30) {
        cw -= 1;
        ch = Math.round(cw * 1.4);
        so = sideMaxLen > 1 ? Math.max(10, Math.round(ch * 0.12)) : 0;
        ph = ch + (sideMaxLen - 1) * so;
      }
      const sUsedW = sideCols * cw + gapXTotal;
      const sUsedH = sideRows * ph + gapYTotal;
      sideLayout = {
        rows: sideRows, cols: sideCols, cardW: cw, cardH: ch, stackOffset: so, pileH: ph, gapX, gapY,
        originX: CANVAS_W - SIDE_W + Math.max(4, Math.floor((SIDE_W - 8 - sUsedW) / 2)),
        originY: HEADER_H + STATS_H + PAD + Math.max(0, Math.floor((sideAvailH - sUsedH) / 2)),
      };
    }
  } else {
    pilesPerRow = Math.min(7, Math.max(3, Math.ceil(totalPiles / 3)));
    nRows = Math.ceil(totalPiles / pilesPerRow);
    const layout = layoutPilesInBox(MAIN_W, Math.max(900, nRows * 280), totalPiles, maxPileLen);
    if (layout) {
      pilesPerRow = layout.cols;
      nRows = layout.rows;
      CARD_W = layout.cardW;
      CARD_H = layout.cardH;
      STACK_OFFSET = layout.stackOffset;
      PILE_H = layout.pileH;
      mainGapX = layout.gapX;
      mainGapY = layout.gapY;
    } else {
      CARD_W = Math.floor((MAIN_W - (pilesPerRow - 1) * PILE_GAP_X) / pilesPerRow);
      CARD_H = Math.round(CARD_W * 1.4);
      STACK_OFFSET = Math.max(14, Math.round(CARD_H * 0.12));
      PILE_H = CARD_H + (maxPileLen - 1) * STACK_OFFSET;
    }
    SC9W = Math.round(CARD_W * 0.78);
    SC9H = Math.round(CARD_H * 0.78);
    SC9VS = Math.max(12, Math.round(SC9H * 0.18));
    const SC9_MAX_PILE_H = SC9H + (MAX_PILE - 1) * SC9VS;
    SIDE916_H = sideCards.length > 0 ? SC9_MAX_PILE_H + 56 : 0;
    const mainH = nRows * PILE_H + (nRows - 1) * mainGapY;
    CANVAS_H = HEADER_H + STATS_H + PAD + mainH + SIDE916_H + FOOTER_H + PAD;
    const mainCols = Math.min(totalPiles, pilesPerRow);
    const mainUsedW = mainCols * CARD_W + Math.max(0, mainCols - 1) * mainGapX;
    mainOriginX = Math.max(PAD, Math.floor((CANVAS_W - mainUsedW) / 2));
    mainOriginY = HEADER_H + STATS_H + PAD;
  }

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W; canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  drawBg(ctx, CANVAS_W, CANVAS_H);
  drawTopAccent(ctx, CANVAS_W);

  ctx.font = "bold 38px Arial, sans-serif"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
  let dName = deck.nome || "Deck";
  while (ctx.measureText(dName).width > CANVAS_W - (is169 ? 350 : 260) && dName.length > 1) dName = dName.slice(0, -1);
  if (dName !== deck.nome) dName += "…";
  ctx.fillText(dName, MAIN_X + 4, 42);
  const fc = FMT_COLOR[deck.formato] || "#beafd7";
  const fl = deck.formato ? deck.formato.charAt(0).toUpperCase() + deck.formato.slice(1) : "";
  ctx.font = "18px Arial, sans-serif"; ctx.fillStyle = fc;
  ctx.fillText(fl, MAIN_X + 4, 68);
  ctx.fillStyle = "#9d74e8";
  ctx.fillText(`  ·  por ${ownerName || "—"}`, MAIN_X + 4 + ctx.measureText(fl).width, 68);

  drawCmcBars(ctx, deck, cardDataMap, CANVAS_W - 230, 14, 22, 52);

  const typeCnt = {};
  for (const c of deck.maindeck || []) {
    const tg = getTypeGroup(cardDataMap[c.nome]?.typeLine);
    typeCnt[tg] = (typeCnt[tg] || 0) + (c.quantidade || 1);
  }
  drawTypeBadges(ctx, CANVAS_W, HEADER_H, STATS_H, typeCnt);

  if (is169 && SIDE_W > 0) {
    const DX = CANVAS_W - SIDE_W - 4;
    const dvg = ctx.createLinearGradient(DX, HEADER_H, DX, CANVAS_H - FOOTER_H);
    dvg.addColorStop(0, "rgba(167,79,255,0)"); dvg.addColorStop(0.1, "rgba(167,79,255,0.35)");
    dvg.addColorStop(0.9, "rgba(167,79,255,0.35)"); dvg.addColorStop(1, "rgba(167,79,255,0)");
    ctx.strokeStyle = dvg; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(DX, HEADER_H); ctx.lineTo(DX, CANVAS_H - FOOTER_H); ctx.stroke();
  }

  const startY = mainOriginY;
  for (let row = 0; row < nRows; row++) {
    const rowPiles = piles.slice(row * pilesPerRow, (row + 1) * pilesPerRow);
    const rowY = startY + row * (PILE_H + mainGapY);
    const rowUsedW = rowPiles.length * CARD_W + Math.max(0, rowPiles.length - 1) * mainGapX;
    const fullRowW = Math.min(totalPiles, pilesPerRow) * CARD_W + (Math.min(totalPiles, pilesPerRow) - 1) * mainGapX;
    const rowStartX = mainOriginX + Math.max(0, Math.floor((fullRowW - rowUsedW) / 2));
    for (let pi = 0; pi < rowPiles.length; pi++) {
      const pile = rowPiles[pi];
      const pileX = rowStartX + pi * (CARD_W + mainGapX);
      for (let s = 0; s < pile.length; s++) {
        const gColor = GROUP_COLOR[getTypeGroup(pile[s].typeLine)] || "#e9d5ff";
        drawCardOnCanvas(ctx, pile[s].img, pileX, rowY + s * STACK_OFFSET, CARD_W, CARD_H, `${gColor}40`);
      }
    }
  }

  if (sideCards.length > 0) {
    if (is169 && sideLayout) {
      const { cardW: SCW, cardH: SCH, stackOffset: SVS, cols: sCols, gapX: sGapX, gapY: sGapY, pileH: sPileH, originX, originY } = sideLayout;
      ctx.save();
      ctx.translate(CANVAS_W - 10, originY + Math.min(80, sPileH)); ctx.rotate(Math.PI / 2);
      ctx.font = "bold 13px Arial, sans-serif"; ctx.fillStyle = "#5b3d8f"; ctx.textAlign = "center";
      ctx.fillText("SIDEBOARD", 0, 0); ctx.restore();
      for (let pi = 0; pi < sidePiles.length; pi++) {
        const pile = sidePiles[pi];
        const col = pi % sCols;
        const row = Math.floor(pi / sCols);
        const cx = originX + col * (SCW + sGapX);
        const cy = originY + row * (sPileH + sGapY);
        for (let s = 0; s < pile.length; s++)
          drawCardOnCanvas(ctx, pile[s].img, cx, cy + s * SVS, SCW, SCH, "rgba(167,79,255,0.35)");
        if (pile.length > 1) {
          const bdx = cx + SCW - 10, bdy = cy + SCH + (pile.length - 1) * SVS - 10;
          ctx.fillStyle = "rgba(0,0,0,0.88)";
          ctx.beginPath(); ctx.arc(bdx + 8, bdy + 8, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fcd34d"; ctx.font = "bold 9px Arial, sans-serif";
          ctx.textAlign = "center"; ctx.fillText(`×${pile.length}`, bdx + 8, bdy + 11); ctx.textAlign = "left";
        }
      }
    } else if (!is169) {
      const sideY = CANVAS_H - FOOTER_H - SIDE916_H + 14;
      const dg = ctx.createLinearGradient(PAD, sideY - 14, CANVAS_W - PAD, sideY - 14);
      dg.addColorStop(0, "rgba(167,79,255,0)"); dg.addColorStop(0.15, "rgba(167,79,255,0.35)");
      dg.addColorStop(0.85, "rgba(167,79,255,0.35)"); dg.addColorStop(1, "rgba(167,79,255,0)");
      ctx.strokeStyle = dg; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD, sideY - 14); ctx.lineTo(CANVAS_W - PAD, sideY - 14); ctx.stroke();
      ctx.font = "bold 15px Arial, sans-serif"; ctx.fillStyle = "#6b4a9e"; ctx.textAlign = "center";
      ctx.fillText("SIDEBOARD", CANVAS_W / 2, sideY);
      ctx.textAlign = "left";
      const pilesY = sideY + 20;
      const SC9GAP = 10;
      const sideRowW = sidePiles.length * SC9W + Math.max(0, sidePiles.length - 1) * SC9GAP;
      const sideStartX = PAD + Math.max(0, Math.floor((CANVAS_W - 2 * PAD - sideRowW) / 2));
      for (let pi = 0; pi < sidePiles.length; pi++) {
        const pile = sidePiles[pi];
        const pileX = sideStartX + pi * (SC9W + SC9GAP);
        for (let s = 0; s < pile.length; s++)
          drawCardOnCanvas(ctx, pile[s].img, pileX, pilesY + s * SC9VS, SC9W, SC9H, "rgba(167,79,255,0.35)");
        if (pile.length > 1) {
          const br = 8;
          const bdx = pileX + SC9W - br - 2, bdy = pilesY + SC9H + (pile.length - 1) * SC9VS - br - 2;
          ctx.fillStyle = "rgba(0,0,0,0.88)";
          ctx.beginPath(); ctx.arc(bdx + br, bdy + br, br, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fcd34d"; ctx.font = "bold 8px Arial, sans-serif";
          ctx.textAlign = "center"; ctx.fillText(`×${pile.length}`, bdx + br, bdy + br + 3); ctx.textAlign = "left";
        }
      }
    }
  }

  drawWatermark(ctx, CANVAS_W, CANVAS_H);
  drawFooter(ctx, CANVAS_W, CANVAS_H, FOOTER_H, brandImage, !is169);
  return canvas;
}

