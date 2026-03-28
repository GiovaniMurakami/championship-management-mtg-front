import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
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

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * Calculate card layout so N players always fit within the available vertical space.
 * Returns { cardH, cardGap, startY }
 */
function calcLayout(canvasH, headerEndY, bottomReserve, n, nominalCardH) {
  const available = canvasH - headerEndY - bottomReserve;
  const maxSlotH = Math.floor(available / n);
  const cardH = Math.min(nominalCardH, Math.floor(maxSlotH * 0.92));
  const cardGap = maxSlotH - cardH;
  const totalH = n * cardH + Math.max(0, n - 1) * cardGap;
  const startY = headerEndY + Math.max(0, Math.floor((available - totalH) / 2));
  return { cardH, cardGap, startY };
}

// ─── Static PNG (1080 × 1920) ─────────────────────────────────────────────────

function downloadTop8Canvas(players, tournamentName) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0e091c");
  bg.addColorStop(0.5, "#150825");
  bg.addColorStop(1, "#0e091c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 80, W / 2, H * 0.35, 600);
  glow.addColorStop(0, "rgba(167,79,255,0.15)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top band
  const topBand = ctx.createLinearGradient(0, 0, W, 0);
  topBand.addColorStop(0, "rgba(167,79,255,0)");
  topBand.addColorStop(0.3, "rgba(167,79,255,0.7)");
  topBand.addColorStop(0.7, "rgba(255,215,0,0.7)");
  topBand.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = topBand;
  ctx.fillRect(0, 0, W, 10);

  // Title
  ctx.textAlign = "center";
  ctx.font = "bold 160px Arial, sans-serif";
  const titleGrad = ctx.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0);
  titleGrad.addColorStop(0, "#c4b5fd");
  titleGrad.addColorStop(0.5, "#FFD700");
  titleGrad.addColorStop(1, "#c4b5fd");
  ctx.fillStyle = titleGrad;
  const label = players.length <= 4 ? `TOP ${players.length}` : "TOP 8";
  ctx.fillText(label, W / 2, 210);

  ctx.font = "bold 54px Arial, sans-serif";
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText(tournamentName || "Torneio", W / 2, 282);

  // Divider
  const divGrad = ctx.createLinearGradient(80, 0, W - 80, 0);
  divGrad.addColorStop(0, "rgba(199,149,255,0)");
  divGrad.addColorStop(0.2, "rgba(199,149,255,0.6)");
  divGrad.addColorStop(0.8, "rgba(255,215,0,0.4)");
  divGrad.addColorStop(1, "rgba(199,149,255,0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 318);
  ctx.lineTo(W - 80, 318);
  ctx.stroke();

  // Layout
  const n = players.length;
  const { cardH, cardGap, startY } = calcLayout(H, 338, 20, n, 177);
  const fontScale = Math.min(1, cardH / 177);

  players.forEach((player, i) => {
    const pos = player.posicao ?? i + 1;
    const name = player.usuario?.nome || player.nome || "Jogador";
    const deck = player.deckNome || "—";
    const isGold = pos === 1;
    const isSilver = pos === 2;
    const isBronze = pos === 3;
    const y = startY + i * (cardH + cardGap);

    const cardGrads = ctx.createLinearGradient(60, y, W - 60, y + cardH);
    if (isGold) { cardGrads.addColorStop(0, "rgba(255,215,0,0.22)"); cardGrads.addColorStop(1, "rgba(255,215,0,0.06)"); }
    else if (isSilver) { cardGrads.addColorStop(0, "rgba(192,192,192,0.16)"); cardGrads.addColorStop(1, "rgba(192,192,192,0.04)"); }
    else if (isBronze) { cardGrads.addColorStop(0, "rgba(205,127,50,0.16)"); cardGrads.addColorStop(1, "rgba(205,127,50,0.04)"); }
    else { cardGrads.addColorStop(0, "rgba(100,60,180,0.13)"); cardGrads.addColorStop(1, "rgba(100,60,180,0.03)"); }
    ctx.fillStyle = cardGrads;
    roundRect(ctx, 60, y, W - 120, cardH, 18);
    ctx.fill();

    ctx.strokeStyle = isGold ? "rgba(255,215,0,0.65)" : isSilver ? "rgba(192,192,192,0.5)" : isBronze ? "rgba(205,127,50,0.5)" : "rgba(167,79,255,0.28)";
    ctx.lineWidth = pos <= 3 ? 2.5 : 1.2;
    roundRect(ctx, 60, y, W - 120, cardH, 18);
    ctx.stroke();

    if (pos <= 3) {
      ctx.fillStyle = isGold ? "#FFD700" : isSilver ? "#C0C0C0" : "#CD7F32";
      roundRect(ctx, 60, y, 8, cardH, 4);
      ctx.fill();
    }

    const posColor = isGold ? "#FFD700" : isSilver ? "#C0C0C0" : isBronze ? "#CD7F32" : "#9d74e8";
    const posFs = Math.round((isGold ? 82 : 70) * fontScale);
    ctx.font = `bold ${posFs}px Arial, sans-serif`;
    ctx.fillStyle = posColor;
    ctx.textAlign = "left";
    ctx.fillText(`#${pos}`, 100, y + cardH * 0.65);

    const nameFs = Math.round((isGold ? 62 : 56) * fontScale);
    ctx.font = `bold ${nameFs}px Arial, sans-serif`;
    ctx.fillStyle = isGold ? "#fff8e0" : "#f0e6ff";
    let dName = name;
    while (ctx.measureText(dName).width > 620 && dName.length > 1) dName = dName.slice(0, -1);
    if (dName !== name) dName += "…";
    ctx.fillText(dName, 290, y + cardH * 0.43);

    const deckFs = Math.round(44 * fontScale);
    ctx.font = `${deckFs}px Arial, sans-serif`;
    ctx.fillStyle = isGold ? "#fcd34d" : "#a78bfa";
    let dDeck = deck;
    while (ctx.measureText(dDeck).width > 660 && dDeck.length > 1) dDeck = dDeck.slice(0, -1);
    if (dDeck !== deck) dDeck += "…";
    ctx.fillText(dDeck, 290, y + cardH * 0.78);
  });

  // Bottom band
  const bottomBand = ctx.createLinearGradient(0, 0, W, 0);
  bottomBand.addColorStop(0, "rgba(167,79,255,0)");
  bottomBand.addColorStop(0.3, "rgba(167,79,255,0.7)");
  bottomBand.addColorStop(0.7, "rgba(255,215,0,0.7)");
  bottomBand.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = bottomBand;
  ctx.fillRect(0, H - 10, W, 10);

  const link = document.createElement("a");
  link.download = `top${players.length}-${(tournamentName || "torneio").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Animated GIF (480 × 854, 10 fps) ────────────────────────────────────────

const GW = 480;
const GH = 854;

function gifDrawBackground(ctx) {
  const bg = ctx.createLinearGradient(0, 0, 0, GH);
  bg.addColorStop(0, "#0e091c");
  bg.addColorStop(0.5, "#150825");
  bg.addColorStop(1, "#0e091c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, GW, GH);
}

function gifDrawHeader(ctx, tournamentName, alpha, topN) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const topBand = ctx.createLinearGradient(0, 0, GW, 0);
  topBand.addColorStop(0, "rgba(167,79,255,0)");
  topBand.addColorStop(0.3, "rgba(167,79,255,0.7)");
  topBand.addColorStop(0.7, "rgba(255,215,0,0.7)");
  topBand.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = topBand;
  ctx.fillRect(0, 0, GW, 5);

  ctx.textAlign = "center";
  ctx.font = "bold 72px Arial, sans-serif";
  const grad = ctx.createLinearGradient(GW / 2 - 100, 0, GW / 2 + 100, 0);
  grad.addColorStop(0, "#c4b5fd");
  grad.addColorStop(0.5, "#FFD700");
  grad.addColorStop(1, "#c4b5fd");
  ctx.fillStyle = grad;
  ctx.fillText(`TOP ${topN}`, GW / 2, 93);

  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText(tournamentName || "Torneio", GW / 2, 126);

  const divGrad = ctx.createLinearGradient(35, 0, GW - 35, 0);
  divGrad.addColorStop(0, "rgba(199,149,255,0)");
  divGrad.addColorStop(0.2, "rgba(199,149,255,0.6)");
  divGrad.addColorStop(0.8, "rgba(255,215,0,0.4)");
  divGrad.addColorStop(1, "rgba(199,149,255,0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 142);
  ctx.lineTo(GW - 35, 142);
  ctx.stroke();

  const bottomBand = ctx.createLinearGradient(0, 0, GW, 0);
  bottomBand.addColorStop(0, "rgba(167,79,255,0)");
  bottomBand.addColorStop(0.3, "rgba(167,79,255,0.7)");
  bottomBand.addColorStop(0.7, "rgba(255,215,0,0.7)");
  bottomBand.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = bottomBand;
  ctx.fillRect(0, GH - 5, GW, 5);

  ctx.restore();
}

function gifDrawCard(ctx, player, pos, xOffset, flashAlpha, glowAlpha, layout) {
  const { cardH, cardGap, startY } = layout;
  const CARD_LEFT = 27;
  const CARD_W = GW - 54;
  const RADIUS = Math.max(4, Math.round(8 * (cardH / 78)));

  // pos is 1-based; visual index = pos - 1 (top = 0)
  const visualIndex = pos - 1;
  const y = startY + visualIndex * (cardH + cardGap);

  const isGold = pos === 1;
  const isSilver = pos === 2;
  const isBronze = pos === 3;

  const fontScale = Math.min(1, cardH / 78);
  const posFs = Math.round((isGold ? 36 : 32) * fontScale);
  const nameFs = Math.round((isGold ? 27 : 24) * fontScale);
  const deckFs = Math.round(19 * fontScale);

  ctx.save();
  ctx.translate(xOffset, 0);

  if (glowAlpha > 0) {
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 18 * glowAlpha;
  }

  const cg = ctx.createLinearGradient(CARD_LEFT, y, CARD_LEFT + CARD_W, y + cardH);
  if (isGold) { cg.addColorStop(0, "rgba(255,215,0,0.22)"); cg.addColorStop(1, "rgba(255,215,0,0.06)"); }
  else if (isSilver) { cg.addColorStop(0, "rgba(192,192,192,0.16)"); cg.addColorStop(1, "rgba(192,192,192,0.04)"); }
  else if (isBronze) { cg.addColorStop(0, "rgba(205,127,50,0.16)"); cg.addColorStop(1, "rgba(205,127,50,0.04)"); }
  else { cg.addColorStop(0, "rgba(100,60,180,0.13)"); cg.addColorStop(1, "rgba(100,60,180,0.03)"); }
  ctx.fillStyle = cg;
  roundRect(ctx, CARD_LEFT, y, CARD_W, cardH, RADIUS);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  if (flashAlpha > 0) {
    ctx.globalAlpha = flashAlpha * 0.45;
    ctx.fillStyle = isGold ? "#FFD700" : isSilver ? "#C0C0C0" : isBronze ? "#CD7F32" : "#9d74e8";
    roundRect(ctx, CARD_LEFT, y, CARD_W, cardH, RADIUS);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = isGold ? "rgba(255,215,0,0.65)" : isSilver ? "rgba(192,192,192,0.5)" : isBronze ? "rgba(205,127,50,0.5)" : "rgba(167,79,255,0.28)";
  ctx.lineWidth = pos <= 3 ? 1.5 : 0.7;
  roundRect(ctx, CARD_LEFT, y, CARD_W, cardH, RADIUS);
  ctx.stroke();

  if (pos <= 3) {
    ctx.fillStyle = isGold ? "#FFD700" : isSilver ? "#C0C0C0" : "#CD7F32";
    roundRect(ctx, CARD_LEFT, y, 4, cardH, 3);
    ctx.fill();
  }

  const posColor = isGold ? "#FFD700" : isSilver ? "#C0C0C0" : isBronze ? "#CD7F32" : "#9d74e8";
  ctx.font = `bold ${posFs}px Arial, sans-serif`;
  ctx.fillStyle = posColor;
  ctx.textAlign = "left";
  ctx.fillText(`#${pos}`, 44, y + cardH * 0.65);

  const name = player.usuario?.nome || player.nome || "Jogador";
  ctx.font = `bold ${nameFs}px Arial, sans-serif`;
  ctx.fillStyle = isGold ? "#fff8e0" : "#f0e6ff";
  const maxNameW = CARD_W - 110;
  let dName = name;
  while (ctx.measureText(dName).width > maxNameW && dName.length > 1) dName = dName.slice(0, -1);
  if (dName !== name) dName += "…";
  ctx.fillText(dName, 129, y + cardH * 0.43);

  const deck = player.deckNome || "—";
  ctx.font = `${deckFs}px Arial, sans-serif`;
  ctx.fillStyle = isGold ? "#fcd34d" : "#a78bfa";
  let dDeck = deck;
  while (ctx.measureText(dDeck).width > maxNameW + 10 && dDeck.length > 1) dDeck = dDeck.slice(0, -1);
  if (dDeck !== deck) dDeck += "…";
  ctx.fillText(dDeck, 129, y + cardH * 0.78);

  ctx.restore();
}

async function generateAnimatedGif(players, tournamentName, onProgress, onDone) {
  let gifenc;
  try {
    gifenc = await import("gifenc");
  } catch {
    alert("Erro ao carregar o encoder de GIF. Tente novamente.");
    onDone?.();
    return;
  }
  const { GIFEncoder, quantize, applyPalette } = gifenc;

  const DELAY = 100; // 10 fps
  const INTRO = 8;
  const PER_P = 7;
  const OUTRO = 22;

  // Build reveal order: last place first → first place last
  const n = players.length;
  const revealOrder = players
    .map((p, i) => ({ ...p, _pos: p.posicao ?? i + 1 }))
    .reverse(); // index 0 = last place, index n-1 = 1st place

  const totalFrames = INTRO + n * PER_P + OUTRO;

  const layout = calcLayout(GH, 153, 5, n, 78);

  const canvas = document.createElement("canvas");
  canvas.width = GW;
  canvas.height = GH;
  // willReadFrequently: avoids browser warning for repeated getImageData calls
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const gif = GIFEncoder();

  for (let f = 0; f < totalFrames; f++) {
    const titleAlpha = f < INTRO ? (f + 1) / INTRO : 1;

    const revealOffset = f - INTRO;
    const isOutro = f >= INTRO + n * PER_P;

    let revealedCount = 0;
    let newestSlide = 1;
    let newestFlash = 0;

    if (!isOutro && f >= INTRO) {
      const playerIdx = Math.floor(revealOffset / PER_P);
      revealedCount = Math.min(playerIdx + 1, n);
      const frameInPlayer = revealOffset - (revealedCount - 1) * PER_P;
      const t = (frameInPlayer + 1) / PER_P;
      newestSlide = easeOutQuart(Math.min(t, 1));
      newestFlash = Math.max(0, 1 - t * 2.5);
    } else if (isOutro) {
      revealedCount = n;
    }

    const outroFrame = isOutro ? f - (INTRO + n * PER_P) : 0;
    const glowAlpha = isOutro
      ? Math.sin((outroFrame / OUTRO) * Math.PI * 3.5) * 0.5 + 0.5
      : 0;

    gifDrawBackground(ctx);
    gifDrawHeader(ctx, tournamentName, titleAlpha, n);

    for (let ri = 0; ri < revealedCount; ri++) {
      const player = revealOrder[ri];
      const pos = player._pos;
      const isNewest = ri === revealedCount - 1 && !isOutro;

      const xOffset = isNewest ? GW * (1 - newestSlide) : 0;
      const flashAlpha = isNewest ? newestFlash : 0;
      const playerGlow = isOutro && pos === 1 ? glowAlpha : 0;

      gifDrawCard(ctx, player, pos, xOffset, flashAlpha, playerGlow, layout);
    }

    const imageData = ctx.getImageData(0, 0, GW, GH);
    const palette = quantize(imageData.data, 256);
    const index = applyPalette(imageData.data, palette);
    gif.writeFrame(index, GW, GH, { palette, delay: DELAY, repeat: 0 });

    onProgress?.(Math.round(((f + 1) / totalFrames) * 100));

    if (f % 4 === 3) await new Promise((r) => setTimeout(r, 0));
  }

  gif.finish();
  const bytes = gif.bytesView();
  const blob = new Blob([bytes], { type: "image/gif" });

  const slug = (tournamentName || "torneio")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `top${n}-${slug}-animado.gif`;
  link.click();
  URL.revokeObjectURL(link.href);

  onDone?.();
}

// ─── Top N selector options ───────────────────────────────────────────────────

function getTopNOptions(total) {
  const standards = [2, 4, 8, 16, 32];
  const opts = standards.filter((n) => n <= total);
  // Always include exact total if not already listed
  if (total > 0 && !opts.includes(total)) opts.push(total);
  return opts.sort((a, b) => a - b);
}

// ─── Modal component ──────────────────────────────────────────────────────────

export function Top8StoryModal({ standings, torneioNome, deckNameOverrides = {}, onClose }) {
  const allPlayers = (standings || []).map((p) => ({
    ...p,
    deckNome: deckNameOverrides[p.deckId] || p.deckNome || p.deck?.nome || "—",
  }));

  const topNOptions = getTopNOptions(allPlayers.length);
  const defaultN = topNOptions.includes(8) ? 8 : topNOptions[topNOptions.length - 1] ?? 1;

  const [topN, setTopN] = useState(defaultN);
  const [gifProgress, setGifProgress] = useState(null); // null = idle

  const players = allPlayers.slice(0, topN);

  const handleGif = async () => {
    if (gifProgress !== null) return;
    setGifProgress(0);
    await generateAnimatedGif(players, torneioNome, setGifProgress, () =>
      setGifProgress(null)
    );
  };

  return (
    <div className="story-overlay" onClick={onClose}>
      <div className="story-wrapper" onClick={(e) => e.stopPropagation()}>

        {/* Bar */}
        <div className="story-modal-bar">
          <span className="story-modal-bar-title">Story</span>

          {/* Top N selector */}
          <div className="story-topn-selector">
            {topNOptions.map((n) => (
              <button
                key={n}
                type="button"
                className={`story-topn-btn${topN === n ? " story-topn-btn--active" : ""}`}
                onClick={() => setTopN(n)}
                disabled={gifProgress !== null}
              >
                Top {n}
              </button>
            ))}
          </div>

          <div className="story-modal-bar-btns">
            <button
              className="story-download-btn"
              onClick={() => downloadTop8Canvas(players, torneioNome)}
              disabled={gifProgress !== null}
            >
              ↓ PNG
            </button>

            <button
              className={`story-gif-btn${gifProgress !== null ? " story-gif-btn--busy" : ""}`}
              onClick={handleGif}
              disabled={gifProgress !== null}
              title="Gerar GIF animado revelando do último ao primeiro"
            >
              {gifProgress !== null ? (
                <>
                  <span className="story-gif-spinner" />
                  {gifProgress}%
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  GIF
                </>
              )}
            </button>

            <button className="story-close-btn" onClick={onClose} aria-label="Fechar">×</button>
          </div>
        </div>

        {/* Progress */}
        {gifProgress !== null && (
          <div className="story-gif-progress">
            <div className="story-gif-progress-track">
              <div className="story-gif-progress-fill" style={{ width: `${gifProgress}%` }} />
            </div>
            <span className="story-gif-progress-label">
              Gerando GIF… {gifProgress}% — revelando do #{topN} ao #1
            </span>
          </div>
        )}

        {/* Preview card */}
        <div className="story-card">
          <div className="story-band story-band--top" />

          <div className="story-head">
            <h1 className="story-top8-label">TOP {topN}</h1>
            <p className="story-tournament-name">{torneioNome || "Torneio"}</p>
          </div>

          <div className="story-separator" />

          <ul className="story-players">
            {players.map((player, i) => {
              const pos = player.posicao ?? i + 1;
              const name = player.usuario?.nome || player.nome || "Jogador";
              const deck = player.deckNome;
              const tier =
                pos === 1 ? "gold" : pos === 2 ? "silver" : pos === 3 ? "bronze" : "default";
              return (
                <li
                  key={player.usuario?.id || i}
                  className={`story-player story-player--${tier}`}
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <span className="story-player-pos">#{pos}</span>
                  <div className="story-player-details">
                    <span className="story-player-name">{name}</span>
                    <span className="story-player-deck">{deck}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="story-band story-band--bottom" />
        </div>
      </div>
    </div>
  );
}
