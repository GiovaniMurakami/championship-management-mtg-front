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

  // Subtle radial glow in center
  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 80, W / 2, H * 0.35, 600);
  glow.addColorStop(0, "rgba(167,79,255,0.15)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top gradient band
  const topBand = ctx.createLinearGradient(0, 0, W, 0);
  topBand.addColorStop(0, "rgba(167,79,255,0)");
  topBand.addColorStop(0.3, "rgba(167,79,255,0.7)");
  topBand.addColorStop(0.7, "rgba(255,215,0,0.7)");
  topBand.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = topBand;
  ctx.fillRect(0, 0, W, 10);

  // "TOP 8" title with gradient
  ctx.textAlign = "center";
  ctx.font = "bold 160px Arial, sans-serif";
  const titleGrad = ctx.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0);
  titleGrad.addColorStop(0, "#c4b5fd");
  titleGrad.addColorStop(0.5, "#FFD700");
  titleGrad.addColorStop(1, "#c4b5fd");
  ctx.fillStyle = titleGrad;
  ctx.fillText("TOP 8", W / 2, 210);

  // Tournament name
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

  // Players
  const startY = 345;
  const cardH = 177;
  const cardGap = 11;
  const top8 = players.slice(0, 8);

  top8.forEach((player, i) => {
    const pos = player.posicao ?? i + 1;
    const name = player.usuario?.nome || player.nome || "Jogador";
    const deck = player.deckNome || "—";
    const isGold = pos === 1;
    const isSilver = pos === 2;
    const isBronze = pos === 3;
    const y = startY + i * (cardH + cardGap);

    // Card background gradient
    const cardGrad = ctx.createLinearGradient(60, y, W - 60, y + cardH);
    if (isGold) {
      cardGrad.addColorStop(0, "rgba(255,215,0,0.22)");
      cardGrad.addColorStop(1, "rgba(255,215,0,0.06)");
    } else if (isSilver) {
      cardGrad.addColorStop(0, "rgba(192,192,192,0.16)");
      cardGrad.addColorStop(1, "rgba(192,192,192,0.04)");
    } else if (isBronze) {
      cardGrad.addColorStop(0, "rgba(205,127,50,0.16)");
      cardGrad.addColorStop(1, "rgba(205,127,50,0.04)");
    } else {
      cardGrad.addColorStop(0, "rgba(100,60,180,0.13)");
      cardGrad.addColorStop(1, "rgba(100,60,180,0.03)");
    }
    ctx.fillStyle = cardGrad;
    roundRect(ctx, 60, y, W - 120, cardH, 18);
    ctx.fill();

    // Card border
    ctx.strokeStyle = isGold
      ? "rgba(255,215,0,0.65)"
      : isSilver
      ? "rgba(192,192,192,0.5)"
      : isBronze
      ? "rgba(205,127,50,0.5)"
      : "rgba(167,79,255,0.28)";
    ctx.lineWidth = pos <= 3 ? 2.5 : 1.2;
    roundRect(ctx, 60, y, W - 120, cardH, 18);
    ctx.stroke();

    // Left accent stripe for top 3
    if (pos <= 3) {
      ctx.fillStyle = isGold ? "#FFD700" : isSilver ? "#C0C0C0" : "#CD7F32";
      roundRect(ctx, 60, y, 8, cardH, 4);
      ctx.fill();
    }

    // Position number
    const posColor = isGold ? "#FFD700" : isSilver ? "#C0C0C0" : isBronze ? "#CD7F32" : "#9d74e8";
    ctx.font = `bold ${isGold ? 82 : 70}px Arial, sans-serif`;
    ctx.fillStyle = posColor;
    ctx.textAlign = "left";
    ctx.fillText(`#${pos}`, 100, y + cardH / 2 + 28);

    // Player name
    ctx.font = `bold ${isGold ? 62 : 56}px Arial, sans-serif`;
    ctx.fillStyle = isGold ? "#fff8e0" : "#f0e6ff";
    // Truncate long names
    let displayName = name;
    ctx.font = `bold ${isGold ? 62 : 56}px Arial, sans-serif`;
    while (ctx.measureText(displayName).width > 620 && displayName.length > 1) {
      displayName = displayName.slice(0, -1);
    }
    if (displayName !== name) displayName += "…";
    ctx.fillText(displayName, 290, y + 76);

    // Deck name
    ctx.font = `44px Arial, sans-serif`;
    ctx.fillStyle = isGold ? "#fcd34d" : "#a78bfa";
    let displayDeck = deck;
    while (ctx.measureText(displayDeck).width > 660 && displayDeck.length > 1) {
      displayDeck = displayDeck.slice(0, -1);
    }
    if (displayDeck !== deck) displayDeck += "…";
    ctx.fillText(displayDeck, 290, y + 138);
  });

  // Bottom gradient band
  const bottomBand = ctx.createLinearGradient(0, 0, W, 0);
  bottomBand.addColorStop(0, "rgba(167,79,255,0)");
  bottomBand.addColorStop(0.3, "rgba(167,79,255,0.7)");
  bottomBand.addColorStop(0.7, "rgba(255,215,0,0.7)");
  bottomBand.addColorStop(1, "rgba(167,79,255,0)");
  ctx.fillStyle = bottomBand;
  ctx.fillRect(0, H - 10, W, 10);

  const link = document.createElement("a");
  link.download = `top8-${(tournamentName || "torneio")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function Top8StoryModal({ standings, torneioNome, deckNameOverrides = {}, onClose }) {
  const top8 = (standings || []).slice(0, 8).map((p) => ({
    ...p,
    deckNome: deckNameOverrides[p.deckId] || p.deckNome || p.deck?.nome || "—",
  }));

  return (
    <div className="story-overlay" onClick={onClose}>
      <div className="story-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="story-modal-bar">
          <span className="story-modal-bar-title">Top 8 — Story</span>
          <div className="story-modal-bar-btns">
            <button
              className="story-download-btn"
              onClick={() => downloadTop8Canvas(top8, torneioNome)}
            >
              ↓ Baixar PNG
            </button>
            <button className="story-close-btn" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </div>
        </div>

        <div className="story-card">
          <div className="story-band story-band--top" />

          <div className="story-head">
            <h1 className="story-top8-label">TOP 8</h1>
            <p className="story-tournament-name">{torneioNome || "Torneio"}</p>
          </div>

          <div className="story-separator" />

          <ul className="story-players">
            {top8.map((player, i) => {
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
