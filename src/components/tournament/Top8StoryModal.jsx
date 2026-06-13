import { useState } from "react";
import { Tooltip } from "../ui/Tooltip";

const TOP8_BACKGROUND_URL = "/images/top8/fundoTop8.jpeg";
const TOP8_CONTENT_START_RATIO = 0.28;

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

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCoverImage(ctx, img, x, y, w, h) {
  if (!img) return false;
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  return true;
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

async function downloadTop8Canvas(players, tournamentName) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const backgroundImage = await loadImage(TOP8_BACKGROUND_URL);

  if (!drawCoverImage(ctx, backgroundImage, 0, 0, W, H)) {
    ctx.fillStyle = "#0e091c";
    ctx.fillRect(0, 0, W, H);
  }

  // Layout
  const n = players.length;
  const { cardH, cardGap, startY } = calcLayout(H, Math.round(H * TOP8_CONTENT_START_RATIO), 70, n, 150);
  const fontScale = Math.min(1, cardH / 150);

  players.forEach((player, i) => {
    const pos = player.posicao ?? i + 1;
    const name = player.usuario?.nome || player.nome || "Jogador";
    const deck = player.deckNome || "—";
    const isGold = pos === 1;
    const isSilver = pos === 2;
    const isBronze = pos === 3;
    const y = startY + i * (cardH + cardGap);

    const cardGrads = ctx.createLinearGradient(60, y, W - 60, y + cardH);
    if (isGold) { cardGrads.addColorStop(0, "#4a3510"); cardGrads.addColorStop(1, "#16100a"); }
    else if (isSilver) { cardGrads.addColorStop(0, "#32343b"); cardGrads.addColorStop(1, "#10131b"); }
    else if (isBronze) { cardGrads.addColorStop(0, "#3a2418"); cardGrads.addColorStop(1, "#120d0a"); }
    else { cardGrads.addColorStop(0, "#23153a"); cardGrads.addColorStop(1, "#0d1022"); }
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

  const link = document.createElement("a");
  link.download = `top${players.length}-${(tournamentName || "torneio").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ─── Animated video — canvas dimensions (scaled ×2.25 → 1080 × 1920 output) ──

const GW = 480;
const GH = 854;

function gifDrawBackground(ctx, backgroundImage) {
  if (!drawCoverImage(ctx, backgroundImage, 0, 0, GW, GH)) {
    ctx.fillStyle = "#0e091c";
    ctx.fillRect(0, 0, GW, GH);
  }
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
  if (isGold) { cg.addColorStop(0, "#4a3510"); cg.addColorStop(1, "#16100a"); }
  else if (isSilver) { cg.addColorStop(0, "#32343b"); cg.addColorStop(1, "#10131b"); }
  else if (isBronze) { cg.addColorStop(0, "#3a2418"); cg.addColorStop(1, "#120d0a"); }
  else { cg.addColorStop(0, "#23153a"); cg.addColorStop(1, "#0d1022"); }
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

// ─── Frame renderer (shared between export paths) ────────────────────────────

function renderFrame(ctx, f, n, revealOrder, layout, backgroundImage) {
  const INTRO = 8, PER_P = 7, OUTRO = 22;
  const revealOffset = f - INTRO;
  const isOutro = f >= INTRO + n * PER_P;

  let revealedCount = 0, newestSlide = 1, newestFlash = 0;
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

  gifDrawBackground(ctx, backgroundImage);

  for (let ri = 0; ri < revealedCount; ri++) {
    const player = revealOrder[ri];
    const pos = player._pos;
    const isNewest = ri === revealedCount - 1 && !isOutro;
    gifDrawCard(ctx, player, pos,
      isNewest ? GW * (1 - newestSlide) : 0,
      isNewest ? newestFlash : 0,
      isOutro && pos === 1 ? glowAlpha : 0,
      layout);
  }
}

// ─── Animated MP4 (1080 × 1920, 10 fps) ──────────────────────────────────────

async function generateAnimatedMp4(players, tournamentName, onProgress, onDone) {
  const FPS = 10;
  const INTRO = 8, PER_P = 7, OUTRO = 22;
  const n = players.length;
  const totalFrames = INTRO + n * PER_P + OUTRO;
  const backgroundImage = await loadImage(TOP8_BACKGROUND_URL);

  const revealOrder = players
    .map((p, i) => ({ ...p, _pos: p.posicao ?? i + 1 }))
    .reverse();

  const layout = calcLayout(GH, Math.round(GH * TOP8_CONTENT_START_RATIO), 24, n, 66);

  // Render at 1080×1920 by scaling the GW/GH coordinate space ×2.25
  const OUT_W = 1080, OUT_H = 1920;
  const scale = OUT_W / GW; // 2.25

  const canvas = document.createElement("canvas");
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const slug = (tournamentName || "torneio")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase();

  const hasWebCodecs = typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined";

  // ── Path A: WebCodecs + mp4-muxer → true H.264 MP4 ──────────────────────
  if (hasWebCodecs) {
    let muxerMod;
    try {
      muxerMod = await import("mp4-muxer");
    } catch {
      alert("Erro ao carregar o encoder de MP4. Tente novamente.");
      onDone?.();
      return;
    }
    const { Muxer, ArrayBufferTarget } = muxerMod;

    const target = new ArrayBufferTarget();
    const muxer = new Muxer({
      target,
      video: { codec: "avc", width: OUT_W, height: OUT_H },
      fastStart: "in-memory",
    });

    let encErr = null;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (e) => { encErr = e; },
    });

    try {
      encoder.configure({
        codec: "avc1.4D0028", // H.264 Main Profile Level 4.0 (suporta até ~2MP, cobre 1080×1920)
        width: OUT_W,
        height: OUT_H,
        bitrate: 4_000_000,
        framerate: FPS,
      });
    } catch {
      encoder.close();
      alert("Este navegador não suporta a codificação H.264. Tente no Chrome ou Safari.");
      onDone?.();
      return;
    }

    for (let f = 0; f < totalFrames; f++) {
      if (encErr) {
        alert("Erro ao codificar: " + encErr.message);
        encoder.close();
        onDone?.();
        return;
      }
      renderFrame(ctx, f, n, revealOrder, layout, backgroundImage);
      const timestamp = Math.round(f * (1_000_000 / FPS));
      const duration = Math.round(1_000_000 / FPS);
      const frame = new VideoFrame(canvas, { timestamp, duration });
      encoder.encode(frame, { keyFrame: f % 30 === 0 });
      frame.close();
      onProgress?.(Math.round(((f + 1) / totalFrames) * 100));
      if (f % 4 === 3) await new Promise((r) => setTimeout(r, 0));
    }

    await encoder.flush();
    encoder.close();
    muxer.finalize();

    const blob = new Blob([target.buffer], { type: "video/mp4" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `top${n}-${slug}-animado.mp4`;
    a.click();
    URL.revokeObjectURL(a.href);

  // ── Path B: canvas.captureStream + MediaRecorder → WebM fallback ─────────
  } else {
    const FRAME_MS = 1000 / FPS;
    const stream = canvas.captureStream(FPS);
    const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
      ? "video/webm; codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.start();

    for (let f = 0; f < totalFrames; f++) {
      renderFrame(ctx, f, n, revealOrder, layout, backgroundImage);
      onProgress?.(Math.round(((f + 1) / totalFrames) * 100));
      await new Promise((r) => setTimeout(r, FRAME_MS));
    }

    recorder.stop();
    await new Promise((r) => { recorder.onstop = r; });

    const blob = new Blob(chunks, { type: mimeType });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `top${n}-${slug}-animado.webm`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

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
  const [videoProgress, setVideoProgress] = useState(null); // null = idle

  const players = allPlayers.slice(0, topN);

  const handleMp4 = async () => {
    if (videoProgress !== null) return;
    setVideoProgress(0);
    await generateAnimatedMp4(players, torneioNome, setVideoProgress, () =>
      setVideoProgress(null)
    );
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(5,2,14,0.88)] backdrop-blur-[6px] flex flex-col items-center justify-start pt-6 px-4 pb-8 overflow-y-auto"
      onClick={onClose}
    >
      {/* story-wrapper: flex-col items-center gap-[0.85rem] w-full max-w-[440px] */}
      <div
        className="flex flex-col items-center gap-[0.85rem] w-full max-w-[440px]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* story-modal-bar: flex items-center justify-between w-full gap-3 flex-wrap */}
        <div className="flex items-center justify-between w-full gap-3 flex-wrap">
          {/* story-modal-bar-title: 0.9rem bold text-soft tracking-[0.05em] uppercase */}
          <span className="text-[0.9rem] font-bold text-text-soft tracking-[0.05em] uppercase">Story</span>

          {/* story-topn-selector: flex items-center gap-1 flex-wrap */}
          <div className="flex items-center gap-1 flex-wrap">
            {topNOptions.map((n) => (
              <button
                key={n}
                type="button"
                className={[
                  "px-[0.6rem] py-[0.22rem] border rounded-full bg-transparent text-[0.72rem] font-semibold font-[inherit] cursor-pointer transition-[background,border-color,color] duration-[140ms] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
                  topN === n
                    ? "bg-[rgba(167,79,255,0.2)] border-[rgba(199,149,255,0.6)] text-[#c4b5fd]"
                    : "border-[rgba(199,149,255,0.25)] text-text-soft hover:bg-[rgba(167,79,255,0.12)] hover:border-[rgba(199,149,255,0.45)] hover:text-[#c4b5fd]",
                ].join(" ")}
                onClick={() => setTopN(n)}
                disabled={videoProgress !== null}
              >
                Top {n}
              </button>
            ))}
          </div>

          {/* story-modal-bar-btns: flex items-center gap-2 */}
          <div className="flex items-center gap-2">
            {/* story-download-btn: inline-flex items-center gap-1 px-[0.9rem] py-[0.38rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.78rem] font-bold cursor-pointer transition hover */}
            <button
              className="inline-flex items-center gap-1 px-[0.9rem] py-[0.38rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.78rem] font-bold font-[inherit] cursor-pointer transition-[background,border-color] duration-[160ms] hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)] disabled:cursor-not-allowed"
              onClick={() => downloadTop8Canvas(players, torneioNome)}
              disabled={videoProgress !== null}
            >
              ↓ PNG
            </button>

            {/* story-video-btn */}
            <Tooltip content="Gerar video MP4 animado revelando do ultimo ao primeiro" focusable={false}>
            <button
              className={[
                "inline-flex items-center gap-[0.35rem] px-[0.9rem] py-[0.38rem] border border-[rgba(167,79,255,0.5)] rounded-full bg-[rgba(167,79,255,0.12)] text-[#c4b5fd] text-[0.78rem] font-bold font-[inherit] cursor-pointer transition-[background,border-color,opacity] duration-[160ms] whitespace-nowrap",
                videoProgress !== null
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:bg-[rgba(167,79,255,0.25)] hover:border-[rgba(199,149,255,0.7)]",
              ].join(" ")}
              onClick={handleMp4}
              disabled={videoProgress !== null}
              aria-label="Gerar video MP4 animado revelando do ultimo ao primeiro"
            >
              {videoProgress !== null ? (
                <>
                  {/* story-video-spinner: inline-block 11px border spinner, animate-spin at 0.7s */}
                  <span
                    className="inline-block w-[11px] h-[11px] rounded-full border-2 border-[rgba(199,149,255,0.35)] border-t-[#c4b5fd] shrink-0 animate-[story-video-spin_0.7s_linear_infinite]"
                  />
                  {videoProgress}%
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  MP4
                </>
              )}
            </button>
            </Tooltip>

            {/* story-close-btn: 2rem circle border flex-center text-soft 1.2rem cursor hover */}
            <button
              className="w-8 h-8 flex items-center justify-center border border-[rgba(199,149,255,0.25)] rounded-full bg-transparent text-text-soft text-[1.2rem] cursor-pointer transition-[background,color] duration-[150ms] shrink-0 hover:bg-white/[0.08] hover:text-text-main"
              onClick={onClose}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>

        {/* story-video-progress: w-full flex-col gap-[0.35rem] shrink-0 */}
        {videoProgress !== null && (
          <div className="w-full flex flex-col gap-[0.35rem] shrink-0">
            {/* story-video-progress-track: w-full h-1 bg-white/[0.07] rounded-full overflow-hidden */}
            <div className="w-full h-1 bg-white/[0.07] rounded-full overflow-hidden">
              {/* story-video-progress-fill: h-full bg-gradient-to-r from-[#8e39ed] to-[#c795ff] rounded-full transition-[width] shadow glow min-w-1 */}
              <div
                className="h-full bg-gradient-to-r from-[#8e39ed] to-[#c795ff] rounded-full transition-[width] duration-[120ms] shadow-[0_0_8px_rgba(199,149,255,0.5)] min-w-1"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
            {/* story-video-progress-label: text-center 0.7rem text-soft whitespace-nowrap */}
            <span className="text-center text-[0.7rem] text-text-soft whitespace-nowrap">
              Gerando MP4… {videoProgress}%
            </span>
          </div>
        )}

        {/* story-card: w-full aspect-[9/16] bg gradient border rounded-[1.2rem] overflow-hidden flex-col items-stretch relative shadow */}
        <div
          className="w-full aspect-[9/16] border border-[rgba(199,149,255,0.2)] rounded-[1.2rem] overflow-hidden flex flex-col items-stretch relative shadow-[0_24px_64px_rgba(0,0,0,0.6)] bg-cover bg-center"
          style={{ backgroundImage: `url(${TOP8_BACKGROUND_URL})` }}
        >
          {/* story-band story-band--top: h-[6px] shrink-0 gradient */}
          <div className="hidden h-[6px] shrink-0 bg-[linear-gradient(90deg,rgba(167,79,255,0)_0%,rgba(167,79,255,0.7)_30%,rgba(255,215,0,0.7)_70%,rgba(167,79,255,0)_100%)]" />

          {/* story-head: flex-col items-center pt-4 px-4 pb-[0.6rem] shrink-0 */}
          <div className="hidden flex-col items-center pt-4 px-4 pb-[0.6rem] shrink-0">
            {/* story-top8-label: clamp font-size, font-black, tracking, gradient text */}
            <h1 className="text-[clamp(2.4rem,10vw,3.8rem)] font-black tracking-[0.06em] m-0 leading-[1.1] bg-gradient-to-r from-[#c4b5fd] via-[#ffd700] to-[#c4b5fd] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              TOP {topN}
            </h1>
            {/* story-tournament-name: clamp 0.72rem–1rem, font-semibold, #c4b5fd, mt-1, text-center, opacity-90 */}
            <p className="text-[clamp(0.72rem,3vw,1rem)] font-semibold text-[#c4b5fd] mt-1 mb-0 text-center opacity-90">
              {torneioNome || "Torneio"}
            </p>
          </div>

          {/* story-separator: h-px mx-4 my-2 gradient bg shrink-0 */}
          <div className="hidden h-px mx-4 my-2 bg-[linear-gradient(90deg,rgba(199,149,255,0)_0%,rgba(199,149,255,0.5)_30%,rgba(255,215,0,0.35)_70%,rgba(199,149,255,0)_100%)] shrink-0" />

          {/* story-players: list-none m-0 px-[0.65rem] py-[0.3rem] flex-col gap-[0.3rem] flex-1 overflow-hidden */}
          <ul
            className="list-none mb-6 px-[0.65rem] py-[0.3rem] flex flex-col gap-[0.3rem] overflow-hidden"
            style={{ marginTop: `${TOP8_CONTENT_START_RATIO * 100}%` }}
          >
            {players.map((player, i) => {
              const pos = player.posicao ?? i + 1;
              const name = player.usuario?.nome || player.nome || "Jogador";
              const deck = player.deckNome;
              const tier =
                pos === 1 ? "gold" : pos === 2 ? "silver" : pos === 3 ? "bronze" : "default";

              const tierClasses = {
                gold:    "border-[rgba(255,215,0,0.65)] bg-[#241a08]",
                silver:  "border-[rgba(192,192,192,0.55)] bg-[#171923]",
                bronze:  "border-[rgba(205,127,50,0.55)] bg-[#21130c]",
                default: "border-[rgba(167,79,255,0.45)] bg-[#11162b]",
              };

              const posColorClasses = {
                gold:    "text-[#ffd700]",
                silver:  "text-[#c0c0c0]",
                bronze:  "text-[#cd7f32]",
                default: "text-[#9d74e8]",
              };

              return (
                <li
                  key={player.usuario?.id || i}
                  className={`flex items-center gap-2 px-[0.65rem] py-[0.42rem] rounded-[0.6rem] border story-player ${tierClasses[tier]}`}
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {/* story-player-pos: clamp 0.85rem–1.2rem font-black min-w-[2.6rem] text-center shrink-0 */}
                  <span className={`text-[clamp(0.85rem,3.5vw,1.2rem)] font-black min-w-[2.6rem] text-center shrink-0 ${posColorClasses[tier]}`}>
                    #{pos}
                  </span>
                  {/* story-player-details: flex-col gap-[0.06rem] min-w-0 */}
                  <div className="flex flex-col gap-[0.06rem] min-w-0">
                    {/* story-player-name: clamp 0.7rem–0.98rem font-bold text-[#f0e6ff] (gold: #fff8e0) truncate */}
                    <span className={`text-[clamp(0.7rem,3vw,0.98rem)] font-bold whitespace-nowrap overflow-hidden text-ellipsis ${tier === "gold" ? "text-[#fff8e0]" : "text-[#f0e6ff]"}`}>
                      {name}
                    </span>
                    {/* story-player-deck: clamp 0.6rem–0.8rem text-[#a78bfa] (gold: #fcd34d) truncate */}
                    <span className={`text-[clamp(0.6rem,2.4vw,0.8rem)] whitespace-nowrap overflow-hidden text-ellipsis ${tier === "gold" ? "text-[#fcd34d]" : "text-[#a78bfa]"}`}>
                      {deck}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* story-band story-band--bottom: same as top band but mt-auto */}
          <div className="hidden h-[6px] shrink-0 mt-auto bg-[linear-gradient(90deg,rgba(167,79,255,0)_0%,rgba(167,79,255,0.7)_30%,rgba(255,215,0,0.7)_70%,rgba(167,79,255,0)_100%)]" />
        </div>
      </div>
    </div>
  );
}
