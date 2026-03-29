import { useEffect, useState } from "react";
import { buscarCartaPorNome } from "../../services/scryfallApi";

// ── helpers ──────────────────────────────────────────────────────────────────

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

// Fetch via api.scryfall.com (has CORS) → blob URL → canvas-safe Image
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

// ── canvas ────────────────────────────────────────────────────────────────────

function drawCardOnCanvas(ctx, img, x, y, w, h, borderRgba) {
  if (img) {
    ctx.save();
    rr(ctx, x, y, w, h, 5);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  } else {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, "#2a175a");
    g.addColorStop(1, "#180a32");
    ctx.fillStyle = g;
    rr(ctx, x, y, w, h, 5);
    ctx.fill();
  }
  ctx.strokeStyle = borderRgba || "rgba(255,255,255,0.13)";
  ctx.lineWidth = 1;
  rr(ctx, x, y, w, h, 5);
  ctx.stroke();
}

function buildCanvas(deck, cardDataMap, ownerName) {
  // ── constants ──────────────────────────────────────────────────────────────
  const SVS = 22;                    // stack vertical offset (side)
  const CGX = 10, CGY = 12;         // gap between cards
  const HEADER_H = 88, STATS_H = 38, FOOTER_H = 42, PAD_TOP = 12;
  const CANVAS_W = 1280;
  const SIDE_W = 224;
  const MAIN_X = 16;
  const MAIN_W = CANVAS_W - SIDE_W - MAIN_X - 14;

  // ── flat main deck sorted by CMC ──────────────────────────────────────────
  const allMainCards = [...(deck.maindeck || [])]
    .sort((a, b) => (cardDataMap[a.nome]?.cmc ?? 0) - (cardDataMap[b.nome]?.cmc ?? 0) || a.nome.localeCompare(b.nome))
    .map(card => ({ ...card, img: cardDataMap[card.nome]?.img }));

  // ── fixed 5-column grid filling full width ────────────────────────────────
  const perRow = Math.min(allMainCards.length, 5);
  const CW = perRow > 0 ? Math.floor((MAIN_W - (perRow - 1) * CGX) / perRow) : 180;
  const CH = Math.round(CW * (128 / 92));
  const SV = Math.round(CH * 0.22);

  // ── calculate main height ─────────────────────────────────────────────────
  const nRows = Math.ceil(allMainCards.length / perRow);
  const globalMaxQ = allMainCards.length > 0
    ? Math.min(Math.max(...allMainCards.map(c => c.quantidade || 1)), 4)
    : 1;
  const mainH = nRows * (CH + (globalMaxQ - 1) * SV + CGY);

  const SCW = 86, SCH = 120;
  const sideCards = deck.sideboard || [];
  const sideCol1 = sideCards.filter((_, i) => i % 2 === 0);
  const sideCol2 = sideCards.filter((_, i) => i % 2 === 1);
  const colH = (col) => col.reduce((s, c) => s + SCH + (Math.min(c.quantidade || 1, 4) - 1) * SVS + CGY, 0);
  const sideH = Math.max(colH(sideCol1), colH(sideCol2));

  const CARDS_H = Math.max(mainH, sideH);
  const CANVAS_H = HEADER_H + STATS_H + PAD_TOP + CARDS_H + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");

  // ── background ─────────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  bg.addColorStop(0, "#090510"); bg.addColorStop(0.5, "#0f0618"); bg.addColorStop(1, "#090510");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = "rgba(255,255,255,0.014)";
  for (let gx = 32; gx < CANVAS_W; gx += 42)
    for (let gy = 32; gy < CANVAS_H; gy += 42) {
      ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill();
    }

  // ── header ─────────────────────────────────────────────────────────────────
  const topBand = ctx.createLinearGradient(0, 0, CANVAS_W, 0);
  topBand.addColorStop(0, "rgba(167,79,255,0)"); topBand.addColorStop(0.25, "rgba(167,79,255,0.7)");
  topBand.addColorStop(0.75, "rgba(255,215,0,0.5)"); topBand.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = topBand; ctx.fillRect(0, 0, CANVAS_W, 5);

  ctx.font = "bold 36px Arial, sans-serif";
  ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
  let dName = deck.nome || "Deck";
  while (ctx.measureText(dName).width > CANVAS_W - 420 && dName.length > 1) dName = dName.slice(0, -1);
  if (dName !== deck.nome) dName += "…";
  ctx.fillText(dName, MAIN_X + 4, 44);

  const FMT_C = { standard: "#93c5fd", modern: "#fdba74", pioneer: "#6ee7b7", legacy: "#c4b5fd", commander: "#fcd34d", pauper: "#cbd5e1" };
  const fc = FMT_C[deck.formato] || "#beafd7";
  const fl = deck.formato ? deck.formato.charAt(0).toUpperCase() + deck.formato.slice(1) : "";
  ctx.font = "15px Arial, sans-serif"; ctx.fillStyle = fc;
  ctx.fillText(fl, MAIN_X + 4, 64);
  ctx.fillStyle = "#9d74e8";
  ctx.fillText(`  ·  por ${ownerName || "—"}`, MAIN_X + 4 + ctx.measureText(fl).width, 64);

  // CMC histogram (top right) — com padding do topo
  const cmcDist = {};
  for (const c of deck.maindeck || []) {
    const v = Math.min(Math.floor(cardDataMap[c.nome]?.cmc ?? 0), 7);
    cmcDist[v] = (cmcDist[v] || 0) + (c.quantidade || 1);
  }
  const cmcMax = Math.max(...Object.values(cmcDist), 1);
  const bw = 20, bg2h = 44, cmcTopY = 16, bxStart = CANVAS_W - 210;
  for (let i = 0; i <= 7; i++) {
    const cnt = cmcDist[i] || 0;
    const bh = cnt > 0 ? Math.max(4, Math.round((cnt / cmcMax) * bg2h)) : 0;
    const bx = bxStart + i * (bw + 4);
    const by2 = cmcTopY + bg2h - bh;
    ctx.fillStyle = "rgba(100,60,180,0.1)"; rr(ctx, bx, cmcTopY, bw, bg2h, 3); ctx.fill();
    if (bh > 0) {
      const bg3 = ctx.createLinearGradient(bx, by2, bx, by2 + bh);
      bg3.addColorStop(0, "#c084fc"); bg3.addColorStop(1, "#7c3aed");
      ctx.fillStyle = bg3; rr(ctx, bx, by2, bw, bh, 3); ctx.fill();
      ctx.font = "bold 9px Arial, sans-serif"; ctx.fillStyle = "#e9d5ff"; ctx.textAlign = "center";
      ctx.fillText(cnt, bx + bw / 2, by2 - 2);
    }
    ctx.font = "9px Arial, sans-serif"; ctx.fillStyle = "#4b2d8a"; ctx.textAlign = "center";
    ctx.fillText(i === 7 ? "7+" : String(i), bx + bw / 2, cmcTopY + bg2h + 11);
  }
  ctx.textAlign = "left";

  // ── stats bar ───────────────────────────────────────────────────────────────
  const SY = HEADER_H;
  ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.fillRect(0, SY, CANVAS_W, STATS_H);
  ctx.strokeStyle = "rgba(167,79,255,0.18)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, SY); ctx.lineTo(CANVAS_W, SY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, SY + STATS_H); ctx.lineTo(CANVAS_W, SY + STATS_H); ctx.stroke();

  const typeCnt = {};
  for (const c of deck.maindeck || []) {
    const tg = getTypeGroup(cardDataMap[c.nome]?.typeLine);
    typeCnt[tg] = (typeCnt[tg] || 0) + (c.quantidade || 1);
  }
  ctx.font = "bold 11px Arial, sans-serif";
  const activeTypes = GROUP_ORDER.filter(g2 => typeCnt[g2] > 0);
  const badgeWidths = activeTypes.map(g => ctx.measureText(`${g}  ${typeCnt[g]}`).width + 20);
  const totalBadgeW = badgeWidths.reduce((s, w) => s + w, 0) + (activeTypes.length - 1) * 8;
  let sx = Math.round((CANVAS_W - totalBadgeW) / 2);
  for (let gi = 0; gi < activeTypes.length; gi++) {
    const g = activeTypes[gi];
    const col = GROUP_COLOR[g] || "#e9d5ff";
    const label = `${g}  ${typeCnt[g]}`;
    const lw = badgeWidths[gi];
    ctx.fillStyle = `${col}20`; rr(ctx, sx, SY + 9, lw, 20, 10); ctx.fill();
    ctx.strokeStyle = `${col}55`; ctx.lineWidth = 0.8; rr(ctx, sx, SY + 9, lw, 20, 10); ctx.stroke();
    ctx.fillStyle = col; ctx.fillText(label, sx + 10, SY + 23);
    sx += lw + 8;
  }

  // ── vertical divider ────────────────────────────────────────────────────────
  const DX = CANVAS_W - SIDE_W - 6;
  const dvg = ctx.createLinearGradient(DX, HEADER_H, DX, CANVAS_H - FOOTER_H);
  dvg.addColorStop(0, "rgba(167,79,255,0)"); dvg.addColorStop(0.1, "rgba(167,79,255,0.35)");
  dvg.addColorStop(0.9, "rgba(167,79,255,0.35)"); dvg.addColorStop(1, "rgba(167,79,255,0)");
  ctx.strokeStyle = dvg; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(DX, HEADER_H); ctx.lineTo(DX, CANVAS_H - FOOTER_H); ctx.stroke();

  // ── main cards (flat grid, 5 cols) ────────────────────────────────────────
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

      for (let s = sq - 1; s >= 0; s--) {
        drawCardOnCanvas(ctx, card.img, cx, cY + s * SV, CW, CH, `${gCol}38`);
      }

      if (qty > 1) {
        const br = Math.round(CW * 0.09);
        const bdx = cx + CW - br - 2, bdy = cY + CH + (sq - 1) * SV - br - 2;
        ctx.fillStyle = "rgba(0,0,0,0.88)";
        ctx.beginPath(); ctx.arc(bdx + br, bdy + br, br, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(252,211,77,0.3)"; ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#fcd34d"; ctx.font = `bold ${Math.round(CW * 0.09)}px Arial, sans-serif`;
        ctx.textAlign = "center"; ctx.fillText(`×${qty}`, bdx + br, bdy + br + Math.round(CW * 0.035)); ctx.textAlign = "left";
      }
    }

    cY += CH + (rowMaxQ - 1) * SV + CGY;
  }

  // ── sideboard ───────────────────────────────────────────────────────────────
  const SIDE_START_X = CANVAS_W - SIDE_W + 10;
  const SC1X = SIDE_START_X, SC2X = SIDE_START_X + SCW + 8;
  let sy1 = HEADER_H + STATS_H + PAD_TOP;
  let sy2 = HEADER_H + STATS_H + PAD_TOP;

  // "SIDEBOARD" label
  ctx.save();
  ctx.translate(CANVAS_W - 10, HEADER_H + STATS_H + PAD_TOP + 80);
  ctx.rotate(Math.PI / 2);
  ctx.font = "bold 12px Arial, sans-serif"; ctx.fillStyle = "#3d2470"; ctx.textAlign = "center";
  ctx.fillText("SIDEBOARD", 0, 0);
  ctx.restore();

  for (let si = 0; si < sideCards.length; si++) {
    const card = sideCards[si];
    const qty = card.quantidade || 1;
    const sq = Math.min(qty, 4);
    const isC2 = si % 2 === 1;
    const cx = isC2 ? SC2X : SC1X;
    const cy = isC2 ? sy2 : sy1;

    for (let s = sq - 1; s >= 0; s--) {
      drawCardOnCanvas(ctx, cardDataMap[card.nome]?.img, cx, cy + s * SVS, SCW, SCH, "rgba(167,79,255,0.35)");
    }

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

  // ── footer ──────────────────────────────────────────────────────────────────
  const FY = CANVAS_H - FOOTER_H;
  ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, FY, CANVAS_W, FOOTER_H);
  const fdiv = ctx.createLinearGradient(0, FY, CANVAS_W, FY);
  fdiv.addColorStop(0, "rgba(167,79,255,0)"); fdiv.addColorStop(0.2, "rgba(167,79,255,0.55)");
  fdiv.addColorStop(0.8, "rgba(255,215,0,0.45)"); fdiv.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = fdiv; ctx.fillRect(0, FY, CANVAS_W, 1.5);

  const fug = ctx.createLinearGradient(MAIN_X, FY, MAIN_X + 120, FY);
  fug.addColorStop(0, "#a855f7"); fug.addColorStop(1, "#7c3aed");
  ctx.fillStyle = fug; ctx.font = "bold 17px Arial, sans-serif"; ctx.textAlign = "left";
  ctx.fillText("FUGUETE", MAIN_X + 4, FY + 26);
  ctx.fillStyle = "#3d2470"; ctx.font = "11px Arial, sans-serif"; ctx.textAlign = "right";
  ctx.fillText(new Date().toLocaleDateString("pt-BR"), CANVAS_W - 16, FY + 26);

  return canvas;
}

// ── HTML preview card stack ──────────────────────────────────────────────────

function CardStack({ card, imgUrl }) {
  const qty = card.quantidade || 1;
  return (
    // dip-card-stack: position relative, w-[100px], flex-shrink-0
    // height uses CSS calc with --qty var → kept in index.css via .dip-card-stack
    <div className="dip-card-stack" style={{ "--qty": qty }}>
      {Array.from({ length: Math.min(qty, 4) }).map((_, i) => (
        // dip-card-item: position absolute, top/z-index use --i var → kept in index.css via .dip-card-item
        <div key={i} className="dip-card-item" style={{ "--i": i }}>
          {imgUrl ? (
            // dip-card-img: w-full h-full object-cover block
            <img className="w-full h-full object-cover block" src={imgUrl} alt={card.nome} loading="lazy" />
          ) : (
            // dip-card-placeholder: w-full h-full flex items-center justify-center p-1
            // background: linear-gradient(160deg, #2d1a5e, #1a0a35); border: 1px solid rgba(167,79,255,0.3)
            <div
              className="w-full h-full flex items-center justify-center p-1 border border-[rgba(167,79,255,0.3)]"
              style={{ background: "linear-gradient(160deg, #2d1a5e, #1a0a35)" }}
            >
              {/* dip-card-placeholder span: text-[0.55rem] text-[#c4b5fd] text-center leading-[1.3] break-words */}
              <span className="text-[0.55rem] text-[#c4b5fd] text-center leading-[1.3] break-words">{card.nome}</span>
            </div>
          )}
        </div>
      ))}
      {qty > 1 && (
        // dip-qty-badge: absolute bottom-[-2px] right-[-2px] bg-[rgba(0,0,0,0.88)] text-[#fcd34d]
        // text-[0.6rem] font-bold rounded-full px-[5px] py-[1px] border border-[rgba(252,211,77,0.3)] z-20
        <span className="absolute bottom-[-2px] right-[-2px] bg-[rgba(0,0,0,0.88)] text-[#fcd34d] text-[0.6rem] font-bold rounded-full px-[5px] py-[1px] border border-[rgba(252,211,77,0.3)] z-20">
          ×{qty}
        </span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DeckImageModal({ deck, ownerName, onClose }) {
  const [cardDataMap, setCardDataMap] = useState({});
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("meta"); // "meta" | "imgs" | "done"

  useEffect(() => {
    let cancelled = false;
    const allCards = [
      ...(deck.maindeck || []),
      ...(deck.sideboard || []),
    ];
    const unique = [...new Map(allCards.map((c) => [c.nome, c])).values()];
    const map = {};

    async function run() {
      // Stage 1: metadata
      setStage("meta");
      for (let i = 0; i < unique.length; i++) {
        if (cancelled) return;
        const card = unique[i];
        setProgress(Math.round(((i + 1) / unique.length) * 45));
        try {
          const data = await buscarCartaPorNome(card.nome);
          map[card.nome] = {
            cmc: data?.cmc ?? 0,
            typeLine: data?.typeLine || "",
            imagem: data?.imagem || "",
            img: null,
          };
        } catch {
          map[card.nome] = { cmc: 0, typeLine: "", imagem: "", img: null };
        }
        await new Promise((r) => setTimeout(r, 55));
      }

      // Stage 2: blob images for canvas
      setStage("imgs");
      for (let i = 0; i < unique.length; i++) {
        if (cancelled) return;
        const card = unique[i];
        setProgress(45 + Math.round(((i + 1) / unique.length) * 50));
        const img = await fetchCardImg(card.nome);
        if (map[card.nome]) map[card.nome].img = img;
        await new Promise((r) => setTimeout(r, 55));
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

  const handleDownload = () => {
    const canvas = buildCanvas(deck, cardDataMap, ownerName);
    const a = document.createElement("a");
    a.download = `${(deck.nome || "deck")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const mainGroups = GROUP_ORDER.filter((g) =>
    (deck.maindeck || []).some((c) => getTypeGroup(cardDataMap[c.nome]?.typeLine) === g)
  );

  return (
    // deck-img-overlay: fixed inset-0 z-[200] bg-[rgba(5,2,14,0.9)] flex items-center justify-center p-4 overflow-y-auto
    <div
      className="fixed inset-0 z-[200] bg-[rgba(5,2,14,0.9)] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* deck-img-wrapper: flex flex-col gap-[0.85rem] w-full max-w-[min(98vw,1500px)] */}
      <div
        className="flex flex-col gap-[0.85rem] w-full max-w-[min(98vw,1500px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* deck-img-modal-bar: flex items-center justify-between gap-3 */}
        <div className="flex items-center justify-between gap-3">
          {/* deck-img-modal-title: text-[0.95rem] font-bold text-[#c4b5fd] overflow-hidden text-ellipsis whitespace-nowrap */}
          <span className="text-[0.95rem] font-bold text-[#c4b5fd] overflow-hidden text-ellipsis whitespace-nowrap">
            {deck.nome}
          </span>
          {/* deck-img-modal-actions: flex items-center gap-2 flex-shrink-0 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {stage === "done" && (
              // story-download-btn (actual App.css): inline-flex items-center gap-[0.3rem] px-[0.9rem] py-[0.38rem]
              // border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d]
              // text-[0.78rem] font-bold font-[inherit] cursor-pointer transition-[background,border-color] duration-[160ms]
              // hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)]
              <button
                className="inline-flex items-center gap-[0.3rem] px-[0.9rem] py-[0.38rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.78rem] font-bold cursor-pointer transition-[background,border-color] duration-[160ms] hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)]"
                onClick={handleDownload}
              >
                ↓ Baixar PNG
              </button>
            )}
            {/* story-close-btn (actual App.css): w-8 h-8 flex items-center justify-center
                border border-[rgba(199,149,255,0.25)] rounded-full bg-transparent text-[#beafd7]
                text-[1.2rem] cursor-pointer transition-[background,color] duration-[150ms] flex-shrink-0
                hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f5edff] */}
            <button
              className="w-8 h-8 flex items-center justify-center border border-[rgba(199,149,255,0.25)] rounded-full bg-transparent text-[#beafd7] text-[1.2rem] cursor-pointer transition-[background,color] duration-[150ms] flex-shrink-0 hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f5edff]"
              onClick={onClose}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>

        {stage !== "done" ? (
          // deck-img-loading: flex flex-col items-center gap-4 py-12 px-4
          <div className="flex flex-col items-center gap-4 py-12 px-4">
            {/* deck-img-progress-track: w-full max-w-[400px] h-[6px] rounded-full bg-[rgba(167,79,255,0.15)] overflow-hidden */}
            <div className="w-full max-w-[400px] h-[6px] rounded-full bg-[rgba(167,79,255,0.15)] overflow-hidden">
              {/* deck-img-progress-fill: h-full rounded-full transition-[width] duration-200
                  background: linear-gradient(90deg, #7c3aed, #a855f7) */}
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
              />
            </div>
            {/* deck-img-status: text-[0.82rem] text-[#beafd7] m-0 */}
            <p className="text-[0.82rem] text-[#beafd7] m-0">
              {stage === "meta" ? `Buscando dados… ${progress}%` : `Carregando imagens… ${progress}%`}
            </p>
          </div>
        ) : (
          // dip-preview: flex gap-4 rounded-[0.85rem] p-4 overflow-x-auto min-h-[calc(100vh-120px)]
          // border border-[rgba(199,149,255,0.2)]
          // background: linear-gradient(160deg, #09050f, #0f0618)
          // sm responsive: flex-col min-h-unset
          <div
            className="flex gap-4 rounded-[0.85rem] p-4 overflow-x-auto min-h-[calc(100vh-120px)] border border-[rgba(199,149,255,0.2)] max-sm:flex-col max-sm:min-h-0"
            style={{ background: "linear-gradient(160deg, #09050f, #0f0618)" }}
          >
            {/* dip-left: flex-shrink-0 w-[170px] flex flex-col gap-2; max-sm: w-full */}
            <div className="flex-shrink-0 w-[170px] flex flex-col gap-2 max-sm:w-full">
              {/* dip-deck-name: text-[1.05rem] font-extrabold text-[#e9d5ff] m-0 leading-[1.2] break-words */}
              <h2 className="text-[1.05rem] font-extrabold text-[#e9d5ff] m-0 leading-[1.2] break-words">
                {deck.nome}
              </h2>
              {/* dip-owner: text-[0.78rem] text-[#9d74e8] m-0 */}
              <p className="text-[0.78rem] text-[#9d74e8] m-0">por {ownerName || "—"}</p>
              {/* dip-stats: flex items-center gap-[0.35rem] text-[0.75rem] text-[#6b4a9e] */}
              <div className="flex items-center gap-[0.35rem] text-[0.75rem] text-[#6b4a9e]">
                {/* dip-stat: inherits from dip-stats, no extra rule */}
                <span>{(deck.maindeck || []).reduce((s, c) => s + (c.quantidade || 1), 0)} main</span>
                {/* dip-stat-sep: text-[#4b2d8a] */}
                <span className="text-[#4b2d8a]">·</span>
                <span>{(deck.sideboard || []).reduce((s, c) => s + (c.quantidade || 1), 0)} side</span>
              </div>
              {/* dip-cmc-chart: mt-2 */}
              <div className="mt-2">
                {/* dip-cmc-label: text-[0.68rem] font-bold uppercase tracking-[0.07em] text-[#6b4a9e] m-0 mb-2 */}
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.07em] text-[#6b4a9e] m-0 mb-2">
                  Curva de Mana
                </p>
                {/* dip-cmc-bars: flex items-end gap-[3px] h-[80px] */}
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
                      // dip-cmc-col: flex flex-col items-center gap-[2px] flex-1
                      <div key={i} className="flex flex-col items-center gap-[2px] flex-1">
                        {/* dip-cmc-count: text-[0.6rem] font-bold text-[#c4b5fd] leading-none */}
                        {cnt > 0 && <span className="text-[0.6rem] font-bold text-[#c4b5fd] leading-none">{cnt}</span>}
                        {/* dip-cmc-bar-track: flex-1 w-full bg-[rgba(100,60,180,0.12)] rounded-[3px]
                            flex items-end min-h-[8px] */}
                        <div className="flex-1 w-full bg-[rgba(100,60,180,0.12)] rounded-[3px] flex items-end min-h-[8px]">
                          {/* dip-cmc-bar-fill: w-full rounded-[3px] transition-[height] duration-[400ms]
                              background: linear-gradient(to top, #7c3aed, #c084fc) */}
                          <div
                            className="w-full rounded-[3px] transition-[height] duration-[400ms]"
                            style={{ height: `${pct}%`, background: "linear-gradient(to top, #7c3aed, #c084fc)" }}
                          />
                        </div>
                        {/* dip-cmc-x: text-[0.58rem] text-[#5a3d8a] leading-none */}
                        <span className="text-[0.58rem] text-[#5a3d8a] leading-none">{i === 7 ? "7+" : i}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* dip-main-area: flex-1 flex flex-col gap-[0.65rem] overflow-y-auto
                max-h-[calc(100vh-140px)] min-w-0; max-sm: max-h-[500px] */}
            <div className="flex-1 flex flex-col gap-[0.65rem] overflow-y-auto max-h-[calc(100vh-140px)] min-w-0 max-sm:max-h-[500px]">
              {mainGroups.map((g) => {
                const cards = (deck.maindeck || []).filter(
                  (c) => getTypeGroup(cardDataMap[c.nome]?.typeLine) === g
                );
                if (!cards.length) return null;
                return (
                  // dip-group: flex flex-col gap-[0.4rem]
                  <div key={g} className="flex flex-col gap-[0.4rem]">
                    {/* dip-group-header: flex items-center gap-[0.4rem] py-[0.2rem] px-[0.5rem]
                        rounded-[4px] w-fit
                        background uses color-mix(in srgb, var(--gc) 12%, transparent) → inline style */}
                    <div
                      className="flex items-center gap-[0.4rem] py-[0.2rem] px-[0.5rem] rounded-[4px] w-fit"
                      style={{
                        "--gc": GROUP_COLOR[g],
                        background: `color-mix(in srgb, ${GROUP_COLOR[g]} 12%, transparent)`,
                      }}
                    >
                      {/* dip-group-dot: w-[7px] h-[7px] rounded-full flex-shrink-0; color = --gc */}
                      <span
                        className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                        style={{ background: GROUP_COLOR[g] }}
                      />
                      {/* dip-group-name: text-[0.7rem] font-bold uppercase tracking-[0.06em]; color = --gc */}
                      <span
                        className="text-[0.7rem] font-bold uppercase tracking-[0.06em]"
                        style={{ color: GROUP_COLOR[g] }}
                      >
                        {g}
                      </span>
                      {/* dip-group-count: text-[0.65rem]; color = color-mix(in srgb, --gc 60%, #888) → inline */}
                      <span
                        className="text-[0.65rem]"
                        style={{ color: `color-mix(in srgb, ${GROUP_COLOR[g]} 60%, #888)` }}
                      >
                        {cards.reduce((s, c) => s + (c.quantidade || 1), 0)}
                      </span>
                    </div>
                    {/* dip-group-cards: flex flex-wrap gap-[0.4rem] items-start */}
                    <div className="flex flex-wrap gap-[0.4rem] items-start">
                      {cards.map((c) => (
                        <CardStack key={c.nome} card={c} imgUrl={cardDataMap[c.nome]?.imagem} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {(deck.sideboard || []).length > 0 && (
              // dip-side-area: flex-shrink-0 w-[220px] flex flex-col gap-[0.4rem]
              // border-l border-[rgba(167,79,255,0.2)] pl-3 overflow-y-auto max-h-[calc(100vh-140px)]
              // max-sm: w-full border-l-0 border-t border-[rgba(167,79,255,0.2)] pl-0 pt-3 max-h-[500px]
              <div className="flex-shrink-0 w-[220px] flex flex-col gap-[0.4rem] border-l border-[rgba(167,79,255,0.2)] pl-3 overflow-y-auto max-h-[calc(100vh-140px)] max-sm:w-full max-sm:border-l-0 max-sm:border-t max-sm:pl-0 max-sm:pt-3 max-sm:max-h-[500px]">
                {/* dip-side-label: text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#4b2d8a] m-0 */}
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#4b2d8a] m-0">Side</p>
                {/* dip-side-grid: flex flex-wrap gap-[0.4rem] content-start justify-start */}
                <div className="flex flex-wrap gap-[0.4rem] content-start justify-start">
                  {(deck.sideboard || []).map((c) => (
                    <CardStack key={c.nome} card={c} imgUrl={cardDataMap[c.nome]?.imagem} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
