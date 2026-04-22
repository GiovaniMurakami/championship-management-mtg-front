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

export async function fetchCardImg(cardName) {
  try {
    const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}&format=image&version=normal`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
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

function getTypeGroup(typeLine) {
  if (!typeLine) return "Other";
  if (typeLine.includes("Creature")) return "Creature";
  if (typeLine.includes("Land")) return "Land";
  if (typeLine.includes("Planeswalker")) return "Planeswalker";
  if (typeLine.includes("Instant")) return "Instant";
  if (typeLine.includes("Sorcery")) return "Sorcery";
  if (typeLine.includes("Enchantment")) return "Enchantment";
  if (typeLine.includes("Artifact")) return "Artifact";
  return "Other";
}

const GROUP_ORDER = ["Creature", "Planeswalker", "Instant", "Sorcery", "Enchantment", "Artifact", "Other", "Land"];
const GROUP_COLOR = {
  Creature: "#6ee7b7", Planeswalker: "#fcd34d", Instant: "#60a5fa",
  Sorcery: "#f87171", Enchantment: "#c084fc", Artifact: "#94a3b8",
  Land: "#a78bfa", Other: "#e9d5ff",
};
const FMT_COLOR = {
  standard: "#93c5fd", modern: "#fdba74", pioneer: "#6ee7b7",
  legacy: "#c4b5fd", commander: "#fcd34d", pauper: "#cbd5e1",
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

function drawFooter(ctx, canvasW, canvasH, footerH) {
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

  const brandGrad = ctx.createLinearGradient(16, fy, 160, fy);
  brandGrad.addColorStop(0, "#a855f7");
  brandGrad.addColorStop(1, "#7c3aed");
  ctx.fillStyle = brandGrad;
  ctx.font = "bold 18px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FUGUETE", 20, fy + footerH / 2 + 7);

  ctx.fillStyle = "#3d2470";
  ctx.font = "12px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(new Date().toLocaleDateString("pt-BR"), canvasW - 20, fy + footerH / 2 + 5);
  ctx.textAlign = "left";
}

function drawTypeBadges(ctx, canvasW, y, barH, typeCnt) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, y, canvasW, barH);
  ctx.strokeStyle = "rgba(167,79,255,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, y + barH); ctx.lineTo(canvasW, y + barH); ctx.stroke();

  ctx.font = "bold 11px Arial, sans-serif";
  const active = GROUP_ORDER.filter(g => typeCnt[g] > 0);
  const bws = active.map(g => ctx.measureText(`${g}  ${typeCnt[g]}`).width + 20);
  const total = bws.reduce((s, w) => s + w, 0) + (active.length - 1) * 8;
  let sx = Math.round((canvasW - total) / 2);
  for (let i = 0; i < active.length; i++) {
    const g = active[i]; const col = GROUP_COLOR[g];
    const lw = bws[i];
    ctx.fillStyle = `${col}20`; rr(ctx, sx, y + 9, lw, 20, 10); ctx.fill();
    ctx.strokeStyle = `${col}55`; ctx.lineWidth = 0.8;
    rr(ctx, sx, y + 9, lw, 20, 10); ctx.stroke();
    ctx.fillStyle = col; ctx.fillText(`${g}  ${typeCnt[g]}`, sx + 10, y + 23);
    sx += lw + 8;
  }
}

function drawCmcBars(ctx, deck, cardDataMap, bxStart, topY, bw, barH) {
  const cmcDist = {};
  for (const c of deck.maindeck || []) {
    const v = Math.min(Math.floor(cardDataMap[c.nome]?.cmc ?? 0), 7);
    cmcDist[v] = (cmcDist[v] || 0) + (c.quantidade || 1);
  }
  const cmcMax = Math.max(...Object.values(cmcDist), 1);
  for (let i = 0; i <= 7; i++) {
    const cnt = cmcDist[i] || 0;
    const bh = cnt > 0 ? Math.max(4, Math.round((cnt / cmcMax) * barH)) : 0;
    const bx = bxStart + i * (bw + 4);
    const by2 = topY + barH - bh;
    ctx.fillStyle = "rgba(100,60,180,0.1)"; rr(ctx, bx, topY, bw, barH, 3); ctx.fill();
    if (bh > 0) {
      const g = ctx.createLinearGradient(bx, by2, bx, by2 + bh);
      g.addColorStop(0, "#c084fc"); g.addColorStop(1, "#7c3aed");
      ctx.fillStyle = g; rr(ctx, bx, by2, bw, bh, 3); ctx.fill();
      ctx.font = "bold 9px Arial, sans-serif"; ctx.fillStyle = "#e9d5ff"; ctx.textAlign = "center";
      ctx.fillText(cnt, bx + bw / 2, by2 - 2);
    }
    ctx.font = "9px Arial, sans-serif"; ctx.fillStyle = "#4b2d8a"; ctx.textAlign = "center";
    ctx.fillText(i === 7 ? "7+" : String(i), bx + bw / 2, topY + barH + 11);
  }
  ctx.textAlign = "left";
}

// ── VISUAL canvas (landscape 1280px, pile-based accumulation) ─────────────────

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

export function buildVisualCanvas(deck, cardDataMap, ownerName, ratio = "16x9") {
  const MAX_PILE = 4;
  const HEADER_H = 80;
  const STATS_H = 32;
  const FOOTER_H = 40;
  const PAD = 16;
  const PILE_GAP_X = 10;
  const PILE_GAP_Y = 16;

  const is169 = ratio === "16x9";
  const CANVAS_W = is169 ? 1280 : 1080;
  const SIDE_W = is169 ? 188 : 0;
  const MAIN_X = PAD;
  const MAIN_W = CANVAS_W - SIDE_W - MAIN_X - PAD;

  // sideboard slots → piles
  const sideCards = deck.sideboard || [];
  const sideSlots = [];
  for (const card of sideCards)
    for (let i = 0; i < Math.min(card.quantidade || 1, MAX_PILE); i++)
      sideSlots.push({ nome: card.nome, img: cardDataMap[card.nome]?.img });
  const sidePiles = [];
  for (let i = 0; i < sideSlots.length; i += MAX_PILE) sidePiles.push(sideSlots.slice(i, i + MAX_PILE));

  // maindeck sorted slots → piles
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

  // ── layout ──────────────────────────────────────────────────────────────────
  let CARD_W, CARD_H, STACK_OFFSET, PILE_H, pilesPerRow, nRows, CANVAS_H;
  let SC9W = 0, SC9H = 0, SC9VS = 0, SIDE916_H = 0;

  if (is169) {
    // fixed 1280×720, fit cards into available height
    CANVAS_H = 720;
    const AVAIL_H = CANVAS_H - HEADER_H - STATS_H - FOOTER_H - PAD;
    for (let t = 1; t <= 12; t++) {
      PILE_H = Math.floor((AVAIL_H - (t - 1) * PILE_GAP_Y) / t);
      STACK_OFFSET = Math.max(14, Math.round(PILE_H * 0.115));
      CARD_H = PILE_H - (MAX_PILE - 1) * STACK_OFFSET;
      if (CARD_H < 55) continue;
      CARD_W = Math.round(CARD_H / 1.4);
      pilesPerRow = Math.max(1, Math.floor((MAIN_W + PILE_GAP_X) / (CARD_W + PILE_GAP_X)));
      nRows = Math.ceil(totalPiles / pilesPerRow);
      if (nRows <= t) break;
    }
    PILE_H = CARD_H + (MAX_PILE - 1) * STACK_OFFSET;
  } else {
    // 9:16 — dynamic canvas height, target ~3 rows with maximum card size
    pilesPerRow = Math.min(7, Math.max(3, Math.ceil(totalPiles / 3)));
    CARD_W = Math.floor((MAIN_W - (pilesPerRow - 1) * PILE_GAP_X) / pilesPerRow);
    CARD_H = Math.round(CARD_W * 1.4);
    STACK_OFFSET = Math.max(14, Math.round(CARD_H * 0.12));
    PILE_H = CARD_H + (MAX_PILE - 1) * STACK_OFFSET;
    nRows = Math.ceil(totalPiles / pilesPerRow);
    // sideboard cards proportional to main (74%)
    SC9W = Math.round(CARD_W * 0.74);
    SC9H = Math.round(CARD_H * 0.74);
    SC9VS = Math.max(12, Math.round(SC9H * 0.18));
    const SC9_MAX_PILE_H = SC9H + (MAX_PILE - 1) * SC9VS;
    SIDE916_H = sideCards.length > 0 ? SC9_MAX_PILE_H + 50 : 0; // pile + label + padding
    const mainH = nRows * PILE_H + (nRows - 1) * PILE_GAP_Y;
    CANVAS_H = HEADER_H + STATS_H + PAD + mainH + SIDE916_H + FOOTER_H + PAD;
  }

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W; canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  drawBg(ctx, CANVAS_W, CANVAS_H);
  drawTopAccent(ctx, CANVAS_W);

  // header
  ctx.font = "bold 30px Arial, sans-serif"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
  let dName = deck.nome || "Deck";
  while (ctx.measureText(dName).width > CANVAS_W - (is169 ? 350 : 260) && dName.length > 1) dName = dName.slice(0, -1);
  if (dName !== deck.nome) dName += "…";
  ctx.fillText(dName, MAIN_X + 4, 36);
  const fc = FMT_COLOR[deck.formato] || "#beafd7";
  const fl = deck.formato ? deck.formato.charAt(0).toUpperCase() + deck.formato.slice(1) : "";
  ctx.font = "14px Arial, sans-serif"; ctx.fillStyle = fc;
  ctx.fillText(fl, MAIN_X + 4, 56);
  ctx.fillStyle = "#9d74e8";
  ctx.fillText(`  ·  por ${ownerName || "—"}`, MAIN_X + 4 + ctx.measureText(fl).width, 56);

  drawCmcBars(ctx, deck, cardDataMap, CANVAS_W - 206, 12, 19, 44);

  const typeCnt = {};
  for (const c of deck.maindeck || []) {
    const tg = getTypeGroup(cardDataMap[c.nome]?.typeLine);
    typeCnt[tg] = (typeCnt[tg] || 0) + (c.quantidade || 1);
  }
  drawTypeBadges(ctx, CANVAS_W, HEADER_H, STATS_H, typeCnt);

  // vertical divider (16:9 only)
  if (is169 && SIDE_W > 0) {
    const DX = CANVAS_W - SIDE_W - 6;
    const dvg = ctx.createLinearGradient(DX, HEADER_H, DX, CANVAS_H - FOOTER_H);
    dvg.addColorStop(0, "rgba(167,79,255,0)"); dvg.addColorStop(0.1, "rgba(167,79,255,0.35)");
    dvg.addColorStop(0.9, "rgba(167,79,255,0.35)"); dvg.addColorStop(1, "rgba(167,79,255,0)");
    ctx.strokeStyle = dvg; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(DX, HEADER_H); ctx.lineTo(DX, CANVAS_H - FOOTER_H); ctx.stroke();
  }

  // main piles
  const startY = HEADER_H + STATS_H + PAD;
  for (let row = 0; row < nRows; row++) {
    const rowPiles = piles.slice(row * pilesPerRow, (row + 1) * pilesPerRow);
    const rowY = startY + row * (PILE_H + PILE_GAP_Y);
    for (let pi = 0; pi < rowPiles.length; pi++) {
      const pile = rowPiles[pi];
      const pileX = MAIN_X + pi * (CARD_W + PILE_GAP_X);
      for (let s = 0; s < pile.length; s++) {
        const gColor = GROUP_COLOR[getTypeGroup(pile[s].typeLine)] || "#e9d5ff";
        drawCardOnCanvas(ctx, pile[s].img, pileX, rowY + s * STACK_OFFSET, CARD_W, CARD_H, `${gColor}40`);
      }
    }
  }

  // sideboard — 16:9: right column; 9:16: bottom section
  if (sideCards.length > 0) {
    if (is169) {
      const SVS = 18, SCW = 76, SCH = 106;
      const sidePileH = p => SCH + (p.length - 1) * SVS + 8;
      const SX1 = CANVAS_W - SIDE_W + 8, SX2 = SX1 + SCW + 6;
      let sy1 = startY, sy2 = startY;
      ctx.save();
      ctx.translate(CANVAS_W - 8, sy1 + 60); ctx.rotate(Math.PI / 2);
      ctx.font = "bold 11px Arial, sans-serif"; ctx.fillStyle = "#3d2470"; ctx.textAlign = "center";
      ctx.fillText("SIDEBOARD", 0, 0); ctx.restore();
      for (let pi = 0; pi < sidePiles.length; pi++) {
        const pile = sidePiles[pi]; const isC2 = pi % 2 === 1;
        const cx = isC2 ? SX2 : SX1; const cy = isC2 ? sy2 : sy1;
        for (let s = 0; s < pile.length; s++)
          drawCardOnCanvas(ctx, pile[s].img, cx, cy + s * SVS, SCW, SCH, "rgba(167,79,255,0.35)");
        if (pile.length > 1) {
          const bdx = cx + SCW - 9, bdy = cy + SCH + (pile.length - 1) * SVS - 9;
          ctx.fillStyle = "rgba(0,0,0,0.88)";
          ctx.beginPath(); ctx.arc(bdx + 7, bdy + 7, 7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fcd34d"; ctx.font = "bold 7px Arial, sans-serif";
          ctx.textAlign = "center"; ctx.fillText(`×${pile.length}`, bdx + 7, bdy + 10); ctx.textAlign = "left";
        }
        const ph = sidePileH(pile);
        if (isC2) sy2 += ph; else sy1 += ph;
      }
    } else {
      // 9:16: horizontal row of side piles at the bottom
      const sideY = CANVAS_H - FOOTER_H - SIDE916_H + 14;
      const dg = ctx.createLinearGradient(PAD, sideY - 14, CANVAS_W - PAD, sideY - 14);
      dg.addColorStop(0, "rgba(167,79,255,0)"); dg.addColorStop(0.15, "rgba(167,79,255,0.35)");
      dg.addColorStop(0.85, "rgba(167,79,255,0.35)"); dg.addColorStop(1, "rgba(167,79,255,0)");
      ctx.strokeStyle = dg; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD, sideY - 14); ctx.lineTo(CANVAS_W - PAD, sideY - 14); ctx.stroke();
      ctx.font = "bold 13px Arial, sans-serif"; ctx.fillStyle = "#6b4a9e"; ctx.textAlign = "left";
      ctx.fillText("SIDEBOARD", PAD, sideY);
      const pilesY = sideY + 18;
      const SC9GAP = 10;
      for (let pi = 0; pi < sidePiles.length; pi++) {
        const pile = sidePiles[pi];
        const pileX = PAD + pi * (SC9W + SC9GAP);
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
  drawFooter(ctx, CANVAS_W, CANVAS_H, FOOTER_H);
  return canvas;
}

// ── LIST canvas (portrait 1080×1350, text-based) ──────────────────────────────

export function buildListCanvas(deck, cardDataMap, ownerName) {
  const CANVAS_W = 1080;
  const PAD = 40;
  const COL_GAP = 20;
  const COL_W = Math.floor((CANVAS_W - 2 * PAD - COL_GAP) / 2);
  const HEADER_H = 148;
  const STATS_H = 44;
  const FOOTER_H = 52;
  const SECTION_PAD = 22;
  const GROUP_LBL_H = 30;
  const GROUP_GAP = 14;
  const CARD_ROW_H = 30;
  const QTY_W = 30;

  // group cards
  const grouped = {};
  for (const g of GROUP_ORDER) grouped[g] = [];
  for (const c of deck.maindeck || []) {
    const g = getTypeGroup(cardDataMap[c.nome]?.typeLine);
    grouped[g].push(c);
  }

  const col1Keys = ["Creature", "Planeswalker"].filter(g => grouped[g].length > 0);
  const col2Keys = ["Instant", "Sorcery", "Enchantment", "Artifact", "Other"].filter(g => grouped[g].length > 0);
  const landKeys = ["Land"].filter(g => grouped[g].length > 0);
  const sideCards = deck.sideboard || [];

  function groupBlockH(keys) {
    return keys.reduce((acc, g) => acc + GROUP_LBL_H + GROUP_GAP + grouped[g].length * CARD_ROW_H + GROUP_GAP, 0);
  }

  const colsH = Math.max(groupBlockH(col1Keys), groupBlockH(col2Keys));
  const landCards = landKeys.flatMap(g => grouped[g]);
  const landH = landCards.length > 0 ? GROUP_LBL_H + GROUP_GAP + Math.ceil(landCards.length / 2) * CARD_ROW_H + GROUP_GAP : 0;
  const sideH = sideCards.length > 0 ? GROUP_LBL_H + GROUP_GAP + Math.ceil(sideCards.length / 2) * CARD_ROW_H + GROUP_GAP : 0;

  const CARDS_AREA = SECTION_PAD + colsH + (landH > 0 ? SECTION_PAD / 2 + landH : 0) + (sideH > 0 ? SECTION_PAD / 2 + sideH : 0) + SECTION_PAD;
  const CANVAS_H = Math.max(1350, HEADER_H + STATS_H + CARDS_AREA + FOOTER_H);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W; canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  drawBg(ctx, CANVAS_W, CANVAS_H);
  drawTopAccent(ctx, CANVAS_W);

  // ── header ─────────────────────────────────────────────────────────────────
  ctx.font = "bold 50px Arial, sans-serif"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
  let dName = deck.nome || "Deck";
  const maxNameW = CANVAS_W - PAD * 2 - 230;
  while (ctx.measureText(dName).width > maxNameW && dName.length > 1) dName = dName.slice(0, -1);
  if (dName !== deck.nome) dName += "…";
  ctx.fillText(dName, PAD, 70);

  const fc = FMT_COLOR[deck.formato] || "#beafd7";
  const fl = deck.formato ? deck.formato.charAt(0).toUpperCase() + deck.formato.slice(1) : "";
  ctx.font = "17px Arial, sans-serif"; ctx.fillStyle = fc;
  ctx.fillText(fl, PAD, 96);
  ctx.fillStyle = "rgba(167,79,255,0.55)";
  ctx.fillText("  ·  ", PAD + ctx.measureText(fl).width, 96);
  ctx.fillStyle = "#9d74e8";
  ctx.fillText(`por ${ownerName || "—"}`, PAD + ctx.measureText(fl + "  ·  ").width, 96);

  const mainCount = (deck.maindeck || []).reduce((s, c) => s + (c.quantidade || 1), 0);
  const sideCount = sideCards.reduce((s, c) => s + (c.quantidade || 1), 0);
  ctx.font = "14px Arial, sans-serif"; ctx.fillStyle = "rgba(167,79,255,0.5)";
  ctx.fillText(sideCount > 0 ? `${mainCount} cartas  ·  ${sideCount} sideboard` : `${mainCount} cartas`, PAD, 120);

  // CMC bars (top-right of header)
  drawCmcBars(ctx, deck, cardDataMap, CANVAS_W - PAD - 8 * (26 + 4), 18, 26, 56);

  // type stats
  const typeCnt = {};
  for (const c of deck.maindeck || []) {
    const tg = getTypeGroup(cardDataMap[c.nome]?.typeLine);
    typeCnt[tg] = (typeCnt[tg] || 0) + (c.quantidade || 1);
  }
  drawTypeBadges(ctx, CANVAS_W, HEADER_H, STATS_H, typeCnt);

  // ── card list area ─────────────────────────────────────────────────────────
  let curY = HEADER_H + STATS_H + SECTION_PAD;

  function drawGroupHeader(g, x, y, colWidth, customLabel) {
    const col = GROUP_COLOR[g] || "#e9d5ff";
    const cards = grouped[g] || [];
    const count = cards.reduce((s, c) => s + (c.quantidade || 1), 0);
    const lbl = (customLabel || g).toUpperCase();

    ctx.beginPath(); ctx.arc(x + 7, y + 10, 5, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();

    ctx.font = "bold 13px Arial, sans-serif"; ctx.fillStyle = col; ctx.textAlign = "left";
    ctx.fillText(lbl, x + 18, y + 14);
    const lblW = ctx.measureText(lbl).width;
    ctx.font = "13px Arial, sans-serif"; ctx.fillStyle = `${col}99`;
    ctx.fillText(` · ${count}`, x + 18 + lblW, y + 14);

    ctx.strokeStyle = `${col}25`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y + GROUP_LBL_H - 3); ctx.lineTo(x + colWidth, y + GROUP_LBL_H - 3); ctx.stroke();
  }

  function drawCardRow(card, x, y, colWidth, overrideGroup) {
    const qty = card.quantidade || 1;
    const g = overrideGroup || getTypeGroup(cardDataMap[card.nome]?.typeLine);
    const col = GROUP_COLOR[g] || "#e9d5ff";
    const nome = card.nome || "—";

    const badgeH = 20, badgeY = y + (CARD_ROW_H - badgeH) / 2;
    ctx.fillStyle = `${col}20`; rr(ctx, x, badgeY, QTY_W, badgeH, 4); ctx.fill();
    ctx.strokeStyle = `${col}44`; ctx.lineWidth = 0.7; rr(ctx, x, badgeY, QTY_W, badgeH, 4); ctx.stroke();
    ctx.font = "bold 12px Arial, sans-serif"; ctx.fillStyle = col; ctx.textAlign = "center";
    ctx.fillText(String(qty), x + QTY_W / 2, badgeY + 14);
    ctx.textAlign = "left";

    const nameX = x + QTY_W + 9;
    const maxW = colWidth - QTY_W - 9;
    ctx.font = "16px Arial, sans-serif"; ctx.fillStyle = "#f0ecff";
    let nomeTrunc = nome;
    while (ctx.measureText(nomeTrunc).width > maxW && nomeTrunc.length > 1) nomeTrunc = nomeTrunc.slice(0, -1);
    if (nomeTrunc !== nome) nomeTrunc += "…";
    ctx.fillText(nomeTrunc, nameX, y + CARD_ROW_H - 8);

    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y + CARD_ROW_H - 1); ctx.lineTo(x + colWidth, y + CARD_ROW_H - 1); ctx.stroke();
  }

  function drawColumn(keys, x, startY) {
    let y = startY;
    for (const g of keys) {
      if (!grouped[g] || grouped[g].length === 0) continue;
      drawGroupHeader(g, x, y, COL_W);
      y += GROUP_LBL_H + 4;
      for (const card of grouped[g]) { drawCardRow(card, x, y, COL_W); y += CARD_ROW_H; }
      y += GROUP_GAP;
    }
    return y;
  }

  const col1End = drawColumn(col1Keys, PAD, curY);
  const col2End = drawColumn(col2Keys, PAD + COL_W + COL_GAP, curY);
  curY = Math.max(col1End, col2End) + GROUP_GAP;

  // full-width divider between sections
  function drawDivider(y) {
    ctx.strokeStyle = "rgba(167,79,255,0.13)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(CANVAS_W - PAD, y); ctx.stroke();
  }

  // lands – full-width 2-col sub-grid
  if (landCards.length > 0) {
    drawDivider(curY); curY += 14;
    const halfW = COL_W;
    const col = GROUP_COLOR["Land"];
    const lCount = landCards.reduce((s, c) => s + (c.quantidade || 1), 0);
    ctx.beginPath(); ctx.arc(PAD + 7, curY + 10, 5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.font = "bold 13px Arial, sans-serif"; ctx.fillStyle = col; ctx.textAlign = "left";
    ctx.fillText("LAND", PAD + 18, curY + 14);
    ctx.font = "13px Arial, sans-serif"; ctx.fillStyle = `${col}99`;
    ctx.fillText(` · ${lCount}`, PAD + 18 + ctx.measureText("LAND").width, curY + 14);
    ctx.strokeStyle = `${col}25`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, curY + GROUP_LBL_H - 3); ctx.lineTo(CANVAS_W - PAD, curY + GROUP_LBL_H - 3); ctx.stroke();
    curY += GROUP_LBL_H + 4;

    for (let li = 0; li < landCards.length; li++) {
      const isRight = li % 2 === 1;
      const lx = isRight ? PAD + halfW + COL_GAP : PAD;
      const ly = curY + Math.floor(li / 2) * CARD_ROW_H;
      drawCardRow(landCards[li], lx, ly, halfW, "Land");
    }
    curY += Math.ceil(landCards.length / 2) * CARD_ROW_H + GROUP_GAP;
  }

  // sideboard
  if (sideCards.length > 0) {
    drawDivider(curY); curY += 14;
    const halfW = COL_W;
    const sCol = "#a78bfa";
    ctx.beginPath(); ctx.arc(PAD + 7, curY + 10, 5, 0, Math.PI * 2); ctx.fillStyle = sCol; ctx.fill();
    ctx.font = "bold 13px Arial, sans-serif"; ctx.fillStyle = sCol; ctx.textAlign = "left";
    ctx.fillText("SIDEBOARD", PAD + 18, curY + 14);
    ctx.font = "13px Arial, sans-serif"; ctx.fillStyle = `${sCol}99`;
    ctx.fillText(` · ${sideCount}`, PAD + 18 + ctx.measureText("SIDEBOARD").width, curY + 14);
    ctx.strokeStyle = `${sCol}25`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, curY + GROUP_LBL_H - 3); ctx.lineTo(CANVAS_W - PAD, curY + GROUP_LBL_H - 3); ctx.stroke();
    curY += GROUP_LBL_H + 4;

    for (let si = 0; si < sideCards.length; si++) {
      const isRight = si % 2 === 1;
      const sx = isRight ? PAD + halfW + COL_GAP : PAD;
      const sy = curY + Math.floor(si / 2) * CARD_ROW_H;
      const card = sideCards[si];
      const g = getTypeGroup(cardDataMap[card.nome]?.typeLine);
      drawCardRow(card, sx, sy, halfW, g || "Other");
    }
  }

  drawWatermark(ctx, CANVAS_W, CANVAS_H);
  drawFooter(ctx, CANVAS_W, CANVAS_H, FOOTER_H);
  return canvas;
}
