import { useEffect, useRef, useState } from "react";
import { buscarCartaPorNome } from "../../services/scryfallApi";

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

async function fetchCardImg(cardName) {
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

// ── VISUAL canvas (landscape 1280px, card images) ─────────────────────────────

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

function buildVisualCanvas(deck, cardDataMap, ownerName) {
  const SVS = 22;
  const CGX = 10, CGY = 12;
  const HEADER_H = 88, STATS_H = 38, FOOTER_H = 44, PAD_TOP = 12;
  const CANVAS_W = 1280;
  const SIDE_W = 224;
  const MAIN_X = 16;
  const MAIN_W = CANVAS_W - SIDE_W - MAIN_X - 14;

  const allMainCards = [...(deck.maindeck || [])]
    .sort((a, b) => (cardDataMap[a.nome]?.cmc ?? 0) - (cardDataMap[b.nome]?.cmc ?? 0) || a.nome.localeCompare(b.nome))
    .map(card => ({ ...card, img: cardDataMap[card.nome]?.img }));

  const perRow = Math.min(allMainCards.length, 5);
  const CW = perRow > 0 ? Math.floor((MAIN_W - (perRow - 1) * CGX) / perRow) : 180;
  const CH = Math.round(CW * (128 / 92));
  const SV = Math.round(CH * 0.22);
  const nRows = Math.ceil(allMainCards.length / perRow);
  const globalMaxQ = allMainCards.length > 0
    ? Math.min(Math.max(...allMainCards.map(c => c.quantidade || 1)), 4) : 1;
  const mainH = nRows * (CH + (globalMaxQ - 1) * SV + CGY);

  const SCW = 86, SCH = 120;
  const sideCards = deck.sideboard || [];
  const sideCol1 = sideCards.filter((_, i) => i % 2 === 0);
  const sideCol2 = sideCards.filter((_, i) => i % 2 === 1);
  const colH = col => col.reduce((s, c) => s + SCH + (Math.min(c.quantidade || 1, 4) - 1) * SVS + CGY, 0);
  const sideH = Math.max(colH(sideCol1), colH(sideCol2));
  const CARDS_H = Math.max(mainH, sideH);
  const CANVAS_H = HEADER_H + STATS_H + PAD_TOP + CARDS_H + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W; canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  drawBg(ctx, CANVAS_W, CANVAS_H);
  drawTopAccent(ctx, CANVAS_W);

  // header — deck name
  ctx.font = "bold 36px Arial, sans-serif"; ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
  let dName = deck.nome || "Deck";
  while (ctx.measureText(dName).width > CANVAS_W - 420 && dName.length > 1) dName = dName.slice(0, -1);
  if (dName !== deck.nome) dName += "…";
  ctx.fillText(dName, MAIN_X + 4, 44);

  const fc = FMT_COLOR[deck.formato] || "#beafd7";
  const fl = deck.formato ? deck.formato.charAt(0).toUpperCase() + deck.formato.slice(1) : "";
  ctx.font = "15px Arial, sans-serif"; ctx.fillStyle = fc;
  ctx.fillText(fl, MAIN_X + 4, 64);
  ctx.fillStyle = "#9d74e8";
  ctx.fillText(`  ·  por ${ownerName || "—"}`, MAIN_X + 4 + ctx.measureText(fl).width, 64);

  // CMC histogram top-right
  drawCmcBars(ctx, deck, cardDataMap, CANVAS_W - 210, 16, 20, 44);

  // type stats bar
  const typeCnt = {};
  for (const c of deck.maindeck || []) {
    const tg = getTypeGroup(cardDataMap[c.nome]?.typeLine);
    typeCnt[tg] = (typeCnt[tg] || 0) + (c.quantidade || 1);
  }
  drawTypeBadges(ctx, CANVAS_W, HEADER_H, STATS_H, typeCnt);

  // vertical divider
  const DX = CANVAS_W - SIDE_W - 6;
  const dvg = ctx.createLinearGradient(DX, HEADER_H, DX, CANVAS_H - FOOTER_H);
  dvg.addColorStop(0, "rgba(167,79,255,0)"); dvg.addColorStop(0.1, "rgba(167,79,255,0.35)");
  dvg.addColorStop(0.9, "rgba(167,79,255,0.35)"); dvg.addColorStop(1, "rgba(167,79,255,0)");
  ctx.strokeStyle = dvg; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(DX, HEADER_H); ctx.lineTo(DX, CANVAS_H - FOOTER_H); ctx.stroke();

  // main cards (5-col grid, sorted by CMC)
  let cY = HEADER_H + STATS_H + PAD_TOP;
  for (let ri = 0; ri < nRows; ri++) {
    const rowCards = allMainCards.slice(ri * perRow, (ri + 1) * perRow);
    const rowMaxQ = Math.min(Math.max(...rowCards.map(c => c.quantidade || 1)), 4);
    for (let ci = 0; ci < rowCards.length; ci++) {
      const card = rowCards[ci];
      const qty = card.quantidade || 1;
      const sq = Math.min(qty, 4);
      const cx = MAIN_X + ci * (CW + CGX);
      const gCol = GROUP_COLOR[getTypeGroup(cardDataMap[card.nome]?.typeLine)] || "#e9d5ff";
      for (let s = sq - 1; s >= 0; s--) drawCardOnCanvas(ctx, card.img, cx, cY + s * SV, CW, CH, `${gCol}38`);
      if (qty > 1) {
        const br = Math.round(CW * 0.09);
        const bdx = cx + CW - br - 2, bdy = cY + CH + (sq - 1) * SV - br - 2;
        ctx.fillStyle = "rgba(0,0,0,0.88)";
        ctx.beginPath(); ctx.arc(bdx + br, bdy + br, br, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(252,211,77,0.3)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = "#fcd34d"; ctx.font = `bold ${Math.round(CW * 0.09)}px Arial, sans-serif`;
        ctx.textAlign = "center"; ctx.fillText(`×${qty}`, bdx + br, bdy + br + Math.round(CW * 0.035));
        ctx.textAlign = "left";
      }
    }
    cY += CH + (rowMaxQ - 1) * SV + CGY;
  }

  // sideboard
  const SIDE_START_X = CANVAS_W - SIDE_W + 10;
  const SC1X = SIDE_START_X, SC2X = SIDE_START_X + SCW + 8;
  let sy1 = HEADER_H + STATS_H + PAD_TOP, sy2 = sy1;
  ctx.save();
  ctx.translate(CANVAS_W - 10, HEADER_H + STATS_H + PAD_TOP + 80);
  ctx.rotate(Math.PI / 2);
  ctx.font = "bold 12px Arial, sans-serif"; ctx.fillStyle = "#3d2470"; ctx.textAlign = "center";
  ctx.fillText("SIDEBOARD", 0, 0); ctx.restore();
  for (let si = 0; si < sideCards.length; si++) {
    const card = sideCards[si]; const qty = card.quantidade || 1; const sq = Math.min(qty, 4);
    const isC2 = si % 2 === 1; const cx = isC2 ? SC2X : SC1X; const cy = isC2 ? sy2 : sy1;
    for (let s = sq - 1; s >= 0; s--)
      drawCardOnCanvas(ctx, cardDataMap[card.nome]?.img, cx, cy + s * SVS, SCW, SCH, "rgba(167,79,255,0.35)");
    if (qty > 1) {
      const bdx = cx + SCW - 10, bdy = cy + SCH + (sq - 1) * SVS - 10;
      ctx.fillStyle = "rgba(0,0,0,0.88)";
      ctx.beginPath(); ctx.arc(bdx + 7, bdy + 7, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fcd34d"; ctx.font = "bold 8px Arial, sans-serif";
      ctx.textAlign = "center"; ctx.fillText(`×${qty}`, bdx + 7, bdy + 10); ctx.textAlign = "left";
    }
    const slotH = SCH + (sq - 1) * SVS + CGY;
    if (isC2) sy2 += slotH; else sy1 += slotH;
  }

  drawFooter(ctx, CANVAS_W, CANVAS_H, FOOTER_H);
  return canvas;
}

// ── LIST canvas (portrait 1080×1350, text-based) ──────────────────────────────

function buildListCanvas(deck, cardDataMap, ownerName) {
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
    // draw group header spanning full width
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

  drawFooter(ctx, CANVAS_W, CANVAS_H, FOOTER_H);
  return canvas;
}

// ── HTML preview – visual mode ────────────────────────────────────────────────

function CardStack({ card, imgUrl }) {
  const qty = card.quantidade || 1;
  return (
    <div className="dip-card-stack" style={{ "--qty": qty }}>
      {Array.from({ length: Math.min(qty, 4) }).map((_, i) => (
        <div key={i} className="dip-card-item" style={{ "--i": i }}>
          {imgUrl ? (
            <img className="w-full h-full object-cover block" src={imgUrl} alt={card.nome} loading="lazy" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-1 border border-[rgba(167,79,255,0.3)]"
              style={{ background: "linear-gradient(160deg, #2d1a5e, #1a0a35)" }}
            >
              <span className="text-[0.55rem] text-[#c4b5fd] text-center leading-[1.3] break-words">{card.nome}</span>
            </div>
          )}
        </div>
      ))}
      {qty > 1 && (
        <span className="absolute bottom-[-2px] right-[-2px] bg-[rgba(0,0,0,0.88)] text-[#fcd34d] text-[0.6rem] font-bold rounded-full px-[5px] py-[1px] border border-[rgba(252,211,77,0.3)] z-20">
          ×{qty}
        </span>
      )}
    </div>
  );
}

// ── HTML preview – list mode ──────────────────────────────────────────────────

function ListCardRow({ card, group }) {
  const qty = card.quantidade || 1;
  const col = GROUP_COLOR[group] || "#e9d5ff";
  return (
    <div className="flex items-center gap-[0.5rem] py-[3px] group">
      <span
        className="flex-shrink-0 w-[26px] text-center text-[0.65rem] font-bold rounded-[4px] py-[2px] leading-[1.6] border"
        style={{ color: col, background: `${col}1a`, borderColor: `${col}44` }}
      >
        {qty}
      </span>
      <span className="text-[0.85rem] text-[#f0ecff] truncate leading-[1.3] group-hover:text-white transition-colors">
        {card.nome}
      </span>
    </div>
  );
}

function ListGroupBlock({ g, cards }) {
  const col = GROUP_COLOR[g] || "#e9d5ff";
  const count = cards.reduce((s, c) => s + (c.quantidade || 1), 0);
  return (
    <div className="flex flex-col gap-[2px]">
      <div
        className="flex items-center gap-[0.4rem] mb-[0.3rem] pb-[0.25rem]"
        style={{ borderBottom: `1px solid ${col}22` }}
      >
        <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: col }} />
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em]" style={{ color: col }}>
          {g}
        </span>
        <span className="text-[0.63rem]" style={{ color: `${col}88` }}>· {count}</span>
      </div>
      {cards.map(c => <ListCardRow key={c.nome} card={c} group={g} />)}
    </div>
  );
}

function ListPreview({ deck, cardDataMap }) {
  const grouped = {};
  for (const g of GROUP_ORDER) grouped[g] = [];
  for (const c of deck.maindeck || []) {
    const g = getTypeGroup(cardDataMap[c.nome]?.typeLine);
    grouped[g].push(c);
  }

  const col1Keys = ["Creature", "Planeswalker"].filter(g => grouped[g].length > 0);
  const col2Keys = ["Instant", "Sorcery", "Enchantment", "Artifact", "Other"].filter(g => grouped[g].length > 0);
  const landCards = grouped["Land"] || [];
  const sideCards = deck.sideboard || [];
  const mainCount = (deck.maindeck || []).reduce((s, c) => s + (c.quantidade || 1), 0);
  const sideCount = sideCards.reduce((s, c) => s + (c.quantidade || 1), 0);

  // mini mana curve for the preview header
  const cmcBuckets = Array.from({ length: 8 }, (_, i) =>
    (deck.maindeck || []).reduce((s, c) => {
      const v = Math.min(Math.floor(cardDataMap[c.nome]?.cmc ?? 0), 7);
      return v === i ? s + (c.quantidade || 1) : s;
    }, 0)
  );
  const cmcMax = Math.max(...cmcBuckets, 1);

  return (
    <div className="flex flex-col min-h-0 w-full">
      {/* preview header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-[rgba(167,79,255,0.15)]">
        <div className="min-w-0">
          <h2 className="m-0 text-[1.1rem] font-extrabold text-[#e9d5ff] leading-[1.2] truncate">{deck.nome}</h2>
          <div className="flex items-center gap-1 mt-[0.3rem] text-[0.78rem]">
            <span style={{ color: FMT_COLOR[deck.formato] || "#beafd7" }}>
              {deck.formato ? deck.formato.charAt(0).toUpperCase() + deck.formato.slice(1) : ""}
            </span>
            <span className="text-[#4b2d8a]">·</span>
            <span className="text-[#9d74e8] truncate">por {deck.ownerName || "—"}</span>
          </div>
          <p className="m-0 mt-1 text-[0.72rem] text-[rgba(167,79,255,0.5)]">
            {mainCount} cartas{sideCount > 0 ? ` · ${sideCount} side` : ""}
          </p>
        </div>
        {/* mini curve */}
        <div className="flex items-end gap-[3px] h-[52px] flex-shrink-0">
          {cmcBuckets.map((cnt, i) => {
            const pct = cnt > 0 ? Math.max(10, Math.round((cnt / cmcMax) * 100)) : 0;
            return (
              <div key={i} className="flex flex-col items-center gap-[2px] w-[18px]">
                {cnt > 0 && <span className="text-[0.52rem] font-bold text-[#c4b5fd] leading-none">{cnt}</span>}
                <div className="flex-1 w-full bg-[rgba(100,60,180,0.12)] rounded-[2px] flex items-end min-h-[4px]">
                  <div
                    className="w-full rounded-[2px]"
                    style={{ height: `${pct}%`, background: "linear-gradient(to top, #7c3aed, #c084fc)" }}
                  />
                </div>
                <span className="text-[0.5rem] text-[#5a3d8a] leading-none">{i === 7 ? "7+" : i}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* type badges */}
      <div className="flex flex-wrap items-center justify-center gap-[0.4rem] px-4 py-[0.5rem] border-b border-[rgba(167,79,255,0.1)] bg-black/[0.15]">
        {GROUP_ORDER.filter(g => grouped[g]?.length > 0 || (g === "Land" && landCards.length > 0)).map(g => {
          const col = GROUP_COLOR[g];
          const cnt = g === "Land"
            ? landCards.reduce((s, c) => s + (c.quantidade || 1), 0)
            : grouped[g].reduce((s, c) => s + (c.quantidade || 1), 0);
          if (cnt === 0) return null;
          return (
            <span
              key={g}
              className="text-[0.68rem] font-bold px-[0.5rem] py-[0.15rem] rounded-full"
              style={{ color: col, background: `${col}1a`, border: `0.8px solid ${col}55` }}
            >
              {g} {cnt}
            </span>
          );
        })}
      </div>

      {/* card list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {/* two columns */}
        {(col1Keys.length > 0 || col2Keys.length > 0) && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col gap-4">
              {col1Keys.map(g => <ListGroupBlock key={g} g={g} cards={grouped[g]} />)}
            </div>
            <div className="flex flex-col gap-4">
              {col2Keys.map(g => <ListGroupBlock key={g} g={g} cards={grouped[g]} />)}
            </div>
          </div>
        )}

        {/* lands */}
        {landCards.length > 0 && (
          <div className="border-t border-[rgba(167,79,255,0.1)] pt-3">
            <div
              className="flex items-center gap-[0.4rem] mb-[0.4rem] pb-[0.25rem]"
              style={{ borderBottom: `1px solid ${GROUP_COLOR["Land"]}22` }}
            >
              <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: GROUP_COLOR["Land"] }} />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em]" style={{ color: GROUP_COLOR["Land"] }}>
                Land
              </span>
              <span className="text-[0.63rem]" style={{ color: `${GROUP_COLOR["Land"]}88` }}>
                · {landCards.reduce((s, c) => s + (c.quantidade || 1), 0)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6">
              {landCards.map(c => <ListCardRow key={c.nome} card={c} group="Land" />)}
            </div>
          </div>
        )}

        {/* sideboard */}
        {sideCards.length > 0 && (
          <div className="border-t border-[rgba(167,79,255,0.1)] pt-3">
            <div className="flex items-center gap-[0.4rem] mb-[0.4rem] pb-[0.25rem] border-b border-[rgba(167,79,255,0.15)]">
              <span className="w-[7px] h-[7px] rounded-full flex-shrink-0 bg-[#a78bfa]" />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#a78bfa]">Sideboard</span>
              <span className="text-[0.63rem] text-[#a78bfa88]">· {sideCount}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6">
              {sideCards.map(c => <ListCardRow key={c.nome} card={c} group={getTypeGroup(cardDataMap[c.nome]?.typeLine)} />)}
            </div>
          </div>
        )}

        {/* footer branding */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(167,79,255,0.1)] mt-2">
          <span className="text-[0.75rem] font-bold" style={{
            background: "linear-gradient(90deg,#a855f7,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            FUGUETE
          </span>
          <span className="text-[0.68rem] text-[#3d2470]">{new Date().toLocaleDateString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DeckImageModal({ deck, ownerName, onClose }) {
  const [cardDataMap, setCardDataMap] = useState({});
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("meta"); // "meta" | "imgs" | "done"
  const [layout, setLayout] = useState("lista"); // "lista" | "visual"

  // load card metadata + images
  useEffect(() => {
    let cancelled = false;
    const allCards = [...(deck.maindeck || []), ...(deck.sideboard || [])];
    const unique = [...new Map(allCards.map(c => [c.nome, c])).values()];
    const map = {};

    async function run() {
      // Stage 1: metadata (cmc, typeLine) — enables list export
      setStage("meta");
      for (let i = 0; i < unique.length; i++) {
        if (cancelled) return;
        setProgress(Math.round(((i + 1) / unique.length) * 45));
        try {
          const data = await buscarCartaPorNome(unique[i].nome);
          map[unique[i].nome] = { cmc: data?.cmc ?? 0, typeLine: data?.typeLine || "", imagem: data?.imagem || "", img: null };
        } catch {
          map[unique[i].nome] = { cmc: 0, typeLine: "", imagem: "", img: null };
        }
        await new Promise(r => setTimeout(r, 55));
      }
      // metadata complete → list mode can download now
      if (!cancelled) setCardDataMap({ ...map });

      // Stage 2: blob images for visual canvas
      setStage("imgs");
      for (let i = 0; i < unique.length; i++) {
        if (cancelled) return;
        setProgress(45 + Math.round(((i + 1) / unique.length) * 50));
        const img = await fetchCardImg(unique[i].nome);
        if (map[unique[i].nome]) map[unique[i].nome].img = img;
        await new Promise(r => setTimeout(r, 55));
      }

      if (!cancelled) {
        setCardDataMap({ ...map });
        setProgress(100);
        setStage("done");
      }
    }

    run();
    return () => { cancelled = true; };
  }, [deck]);

  // list export available as soon as metadata is done; visual needs images
  const canDownload = layout === "lista"
    ? (stage === "imgs" || stage === "done")
    : stage === "done";

  const handleDownload = () => {
    const canvas = layout === "lista"
      ? buildListCanvas(deck, cardDataMap, ownerName)
      : buildVisualCanvas(deck, cardDataMap, ownerName);
    const safeName = (deck.nome || "deck")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase();
    const a = document.createElement("a");
    a.download = `${safeName}-${layout}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const mainGroups = GROUP_ORDER.filter(g =>
    (deck.maindeck || []).some(c => getTypeGroup(cardDataMap[c.nome]?.typeLine) === g)
  );

  const loadingDone = stage === "done";
  const metaDone = stage === "imgs" || stage === "done";

  return (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(5,2,14,0.92)] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-[0.75rem] w-full max-w-[min(98vw,1500px)]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── top bar ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.95rem] font-bold text-[#c4b5fd] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
            {deck.nome}
          </span>

          {/* layout toggle */}
          <div className="flex items-center gap-[2px] bg-[rgba(255,255,255,0.04)] border border-[rgba(217,180,255,0.15)] rounded-lg p-[3px] flex-shrink-0">
            {[
              { key: "lista", label: "Lista", hint: "portrait · exporta mais rápido" },
              { key: "visual", label: "Visual", hint: "landscape · requer imagens" },
            ].map(({ key, label, hint }) => (
              <button
                key={key}
                type="button"
                title={hint}
                onClick={() => setLayout(key)}
                className={`px-[0.75rem] py-[0.3rem] rounded-[0.4rem] text-[0.78rem] font-semibold transition-all duration-150 ${
                  layout === key
                    ? "bg-[rgba(79,70,229,0.4)] text-white border border-[rgba(99,102,241,0.5)]"
                    : "text-[#888] hover:text-[#c0bfff] border border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* download button */}
            {canDownload && (
              <button
                className="inline-flex items-center gap-[0.3rem] px-[0.9rem] py-[0.38rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.78rem] font-bold cursor-pointer transition-[background,border-color] duration-150 hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)]"
                onClick={handleDownload}
              >
                ↓ Baixar PNG
              </button>
            )}
            {/* early-available indicator for list when images are still loading */}
            {layout === "lista" && stage === "imgs" && (
              <span className="text-[0.72rem] text-[#22c55e] font-medium">
                pronto para exportar
              </span>
            )}
            <button
              className="w-8 h-8 flex items-center justify-center border border-[rgba(199,149,255,0.25)] rounded-full bg-transparent text-[#beafd7] text-[1.2rem] cursor-pointer transition-[background,color] duration-150 flex-shrink-0 hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f5edff]"
              onClick={onClose}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── loading bar (shown until fully done, but download unlocks per mode) ── */}
        {!loadingDone && (
          <div className="flex flex-col items-center gap-3 py-3">
            <div className="w-full max-w-[440px] h-[5px] rounded-full bg-[rgba(167,79,255,0.15)] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
              />
            </div>
            <p className="text-[0.8rem] text-[#beafd7] m-0">
              {stage === "meta"
                ? `Buscando dados das cartas… ${progress}%`
                : `Carregando imagens para o modo Visual… ${progress}%`}
            </p>
          </div>
        )}

        {/* ── preview panel ── */}
        {metaDone && (
          <div
            className="rounded-[0.85rem] border border-[rgba(199,149,255,0.2)] overflow-hidden"
            style={{ background: "linear-gradient(160deg, #09050f, #0f0618)", minHeight: "60vh" }}
          >
            {layout === "lista" ? (
              /* List preview */
              <ListPreview deck={{ ...deck, ownerName }} cardDataMap={cardDataMap} />
            ) : loadingDone ? (
              /* Visual preview — same as before */
              <div className="flex gap-4 p-4 overflow-x-auto max-sm:flex-col">
                {/* left sidebar */}
                <div className="flex-shrink-0 w-[170px] flex flex-col gap-2 max-sm:w-full">
                  <h2 className="text-[1.05rem] font-extrabold text-[#e9d5ff] m-0 leading-[1.2] break-words">{deck.nome}</h2>
                  <p className="text-[0.78rem] text-[#9d74e8] m-0">por {ownerName || "—"}</p>
                  <div className="flex items-center gap-[0.35rem] text-[0.75rem] text-[#6b4a9e]">
                    <span>{(deck.maindeck || []).reduce((s, c) => s + (c.quantidade || 1), 0)} main</span>
                    <span className="text-[#4b2d8a]">·</span>
                    <span>{(deck.sideboard || []).reduce((s, c) => s + (c.quantidade || 1), 0)} side</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.07em] text-[#6b4a9e] m-0 mb-2">Curva de Mana</p>
                    <div className="flex items-end gap-[3px] h-[80px]">
                      {Array.from({ length: 8 }, (_, i) => {
                        const cnt = (deck.maindeck || []).reduce((s, c) => {
                          const v = Math.min(Math.floor(cardDataMap[c.nome]?.cmc ?? 0), 7);
                          return v === i ? s + (c.quantidade || 1) : s;
                        }, 0);
                        const max = Math.max(...Array.from({ length: 8 }, (__, j) =>
                          (deck.maindeck || []).reduce((s, c) => {
                            const v = Math.min(Math.floor(cardDataMap[c.nome]?.cmc ?? 0), 7);
                            return v === j ? s + (c.quantidade || 1) : s;
                          }, 0)
                        ), 1);
                        const pct = cnt > 0 ? Math.max(8, Math.round((cnt / max) * 100)) : 0;
                        return (
                          <div key={i} className="flex flex-col items-center gap-[2px] flex-1">
                            {cnt > 0 && <span className="text-[0.6rem] font-bold text-[#c4b5fd] leading-none">{cnt}</span>}
                            <div className="flex-1 w-full bg-[rgba(100,60,180,0.12)] rounded-[3px] flex items-end min-h-[8px]">
                              <div className="w-full rounded-[3px] transition-[height] duration-[400ms]"
                                style={{ height: `${pct}%`, background: "linear-gradient(to top, #7c3aed, #c084fc)" }} />
                            </div>
                            <span className="text-[0.58rem] text-[#5a3d8a] leading-none">{i === 7 ? "7+" : i}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* main area */}
                <div className="flex-1 flex flex-col gap-[0.65rem] overflow-y-auto max-h-[calc(100vh-140px)] min-w-0 max-sm:max-h-[500px]">
                  {mainGroups.map(g => {
                    const cards = (deck.maindeck || []).filter(c => getTypeGroup(cardDataMap[c.nome]?.typeLine) === g);
                    if (!cards.length) return null;
                    return (
                      <div key={g} className="flex flex-col gap-[0.4rem]">
                        <div
                          className="flex items-center gap-[0.4rem] py-[0.2rem] px-[0.5rem] rounded-[4px] w-fit"
                          style={{ background: `color-mix(in srgb, ${GROUP_COLOR[g]} 12%, transparent)` }}
                        >
                          <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: GROUP_COLOR[g] }} />
                          <span className="text-[0.7rem] font-bold uppercase tracking-[0.06em]" style={{ color: GROUP_COLOR[g] }}>
                            {g}
                          </span>
                          <span className="text-[0.65rem]" style={{ color: `color-mix(in srgb, ${GROUP_COLOR[g]} 60%, #888)` }}>
                            {cards.reduce((s, c) => s + (c.quantidade || 1), 0)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-[0.4rem] items-start">
                          {cards.map(c => <CardStack key={c.nome} card={c} imgUrl={cardDataMap[c.nome]?.imagem} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* sideboard */}
                {(deck.sideboard || []).length > 0 && (
                  <div className="flex-shrink-0 w-[220px] flex flex-col gap-[0.4rem] border-l border-[rgba(167,79,255,0.2)] pl-3 overflow-y-auto max-h-[calc(100vh-140px)] max-sm:w-full max-sm:border-l-0 max-sm:border-t max-sm:pl-0 max-sm:pt-3 max-sm:max-h-[500px]">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#4b2d8a] m-0">Side</p>
                    <div className="flex flex-wrap gap-[0.4rem] content-start justify-start">
                      {(deck.sideboard || []).map(c => <CardStack key={c.nome} card={c} imgUrl={cardDataMap[c.nome]?.imagem} />)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* visual mode still loading images */
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-[200px] h-[5px] rounded-full bg-[rgba(167,79,255,0.15)] overflow-hidden">
                  <div className="h-full rounded-full transition-[width] duration-200"
                    style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }} />
                </div>
                <p className="text-[0.8rem] text-[#beafd7] m-0">Carregando imagens… {progress}%</p>
              </div>
            )}
          </div>
        )}

        {/* before metadata: full loading state */}
        {!metaDone && (
          <div
            className="rounded-[0.85rem] border border-[rgba(199,149,255,0.1)] flex flex-col items-center justify-center py-16 gap-4"
            style={{ background: "linear-gradient(160deg, #09050f, #0f0618)", minHeight: "40vh" }}
          >
            <p className="text-[0.82rem] text-[#6b4a9e] m-0">Preparando preview…</p>
          </div>
        )}
      </div>
    </div>
  );
}
