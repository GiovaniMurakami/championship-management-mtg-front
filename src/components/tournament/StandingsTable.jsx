import { Fragment, useEffect, useRef, useState } from "react";
import { buscarDeck, atualizarDeck } from "../../services/backendApi";
import { Top8StoryModal } from "./Top8StoryModal";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

function DeckDropdown({ deckId, deckNome, token, onClose }) {
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!deckId || !token) return;
    setLoading(true);
    buscarDeck(deckId, token)
      .then((data) => setDeck(data))
      .catch(() => setError("Não foi possível carregar o deck."))
      .finally(() => setLoading(false));
  }, [deckId, token]);

  const maindeck = deck?.maindeck || [];
  const sideboard = deck?.sideboard || [];
  const totalMain = maindeck.reduce((s, c) => s + (c.quantidade || 1), 0);
  const totalSide = sideboard.reduce((s, c) => s + (c.quantidade || 1), 0);

  const handleCopy = () => {
    const lines = [
      `// ${deckNome || deck?.nome || "Deck"}`,
      "",
      ...maindeck.map((c) => `${c.quantidade} ${c.nome}`),
      ...(sideboard.length > 0
        ? ["", "Sideboard:", ...sideboard.map((c) => `${c.quantidade} ${c.nome}`)]
        : []),
    ].join("\n");
    navigator.clipboard?.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="deck-dropdown" ref={ref}>
      <div className="deck-dropdown-header">
        <div className="deck-dropdown-header-info">
          <span className="deck-dropdown-title">{deckNome || "Deck"}</span>
          {deck?.formato && (
            <span className="deck-dropdown-format-badge">{deck.formato}</span>
          )}
        </div>
        <button type="button" className="deck-dropdown-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>

      {loading && (
        <div className="deck-dropdown-skeleton">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="deck-dropdown-skeleton-row"
              style={{ width: `${48 + (i % 4) * 13}%` }}
            />
          ))}
        </div>
      )}

      {error && <p className="deck-dropdown-empty deck-dropdown-error">{error}</p>}

      {!loading && !error && deck && (
        <>
          <div className="deck-dropdown-body">
            <div className="deck-dropdown-section">
              <div className="deck-dropdown-section-title">
                <span>Maindeck</span>
                <span className="deck-dropdown-count">{totalMain} cartas</span>
              </div>
              <ul className="deck-dropdown-list">
                {maindeck.map((card) => (
                  <li key={card.nome} className="deck-dropdown-card">
                    <span className="deck-dropdown-qty">{card.quantidade}</span>
                    <span className="deck-dropdown-name">{card.nome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {sideboard.length > 0 && (
              <div className="deck-dropdown-section deck-dropdown-section--side">
                <div className="deck-dropdown-section-title">
                  <span>Sideboard</span>
                  <span className="deck-dropdown-count">{totalSide} cartas</span>
                </div>
                <ul className="deck-dropdown-list">
                  {sideboard.map((card) => (
                    <li key={card.nome} className="deck-dropdown-card">
                      <span className="deck-dropdown-qty">{card.quantidade}</span>
                      <span className="deck-dropdown-name">{card.nome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="deck-dropdown-footer">
            <span className="deck-dropdown-total">{totalMain + totalSide} cartas</span>
            <button
              type="button"
              className={`deck-dropdown-copy-btn${copied ? " deck-dropdown-copy-btn--copied" : ""}`}
              onClick={handleCopy}
              title="Copiar lista"
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copiar lista
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DeckNameEditPopover({ deckId, currentName, currentNomeConsolidado, token, onSave, onClose }) {
  const [name, setName] = useState(currentNomeConsolidado || currentName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const deck = await buscarDeck(deckId, token);
      await atualizarDeck(
        deckId,
        {
          nome: deck.nome,
          nomeConsolidado: name.trim(),
          formato: deck.formato,
          maindeck: (deck.maindeck || []).map((c) => ({ nome: c.nome, quantidade: c.quantidade })),
          sideboard: (deck.sideboard || []).map((c) => ({ nome: c.nome, quantidade: c.quantidade })),
        },
        token
      );
      onSave(name.trim());
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deck-edit-popover" ref={ref}>
      <p className="deck-edit-label">Nome consolidado</p>
      <input
        ref={inputRef}
        className="deck-edit-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onClose();
        }}
        maxLength={60}
        placeholder="Nome do deck"
      />
      {error && <p className="deck-edit-error">{error}</p>}
      <div className="deck-edit-actions">
        <button className="deck-edit-btn-cancel" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          className="deck-edit-btn-save"
          onClick={handleSave}
          disabled={loading || !name.trim()}
        >
          {loading ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function DeckViewButton({ player, token, isOwner, deckNameOverride, onDeckNameUpdate }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const deckId = player?.deckId || player?.deck?.id;
  const deckNome = deckNameOverride || player?.nomeConsolidado || player?.deckNome || player?.deck?.nome;

  if (!deckId) return <span className="td-checkin-dot">—</span>;

  return (
    <div className="deck-view-wrapper">
      <button
        type="button"
        className="td-btn-deck-view"
        onClick={() => {
          setOpen((v) => !v);
          setEditing(false);
        }}
        aria-expanded={open}
        title={deckNome || "Ver deck"}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.7 }}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <span className="td-btn-deck-view-name">{deckNome || "Ver deck"}</span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
          style={{ flexShrink: 0, opacity: 0.6, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 180ms ease" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOwner && (
        <button
          type="button"
          className="td-btn-deck-edit"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            setEditing((v) => !v);
          }}
          title="Editar nome consolidado"
          aria-label="Editar nome consolidado"
        >
          ✏
        </button>
      )}

      {open && (
        <DeckDropdown
          deckId={deckId}
          deckNome={deckNome}
          token={token}
          onClose={() => setOpen(false)}
        />
      )}

      {editing && (
        <DeckNameEditPopover
          deckId={deckId}
          currentName={player?.deckNome || player?.deck?.nome}
          currentNomeConsolidado={deckNameOverride || player?.nomeConsolidado}
          token={token}
          onSave={(newName) => {
            onDeckNameUpdate(deckId, newName);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

export function StandingsTable({
  standings,
  isFinished = false,
  token,
  isOwner = false,
  torneioNome = "",
}) {
  const [deckNameOverrides, setDeckNameOverrides] = useState({});
  const [showStory, setShowStory] = useState(false);
  const [search, setSearch] = useState("");

  if (!standings || standings.length === 0) {
    return (
      <section className="td-card">
        <h2 className="td-card-title">Standings</h2>
        <p className="td-empty-text">Nenhum dado de standings disponível.</p>
      </section>
    );
  }

  const getPlayerName = (player) =>
    player?.usuario?.nome ||
    player?.nome ||
    player?.username ||
    player?.userName ||
    player?.jogadorNome ||
    "Jogador";

  const getDeckStatus = (player) =>
    player?.deckId || player?.deck?.id || player?.deckConfirmado;

  const isCheckedIn = (player) =>
    player?.checkIn || player?.checkin || player?.checkedIn || player?.presenca || false;

  const formatPct = (val) => (val != null ? `${(val * 100).toFixed(1)}%` : "—");

  const handleDeckNameUpdate = (deckId, newName) => {
    setDeckNameOverrides((prev) => ({ ...prev, [deckId]: newName }));
  };

  const enrichedStandings = standings.map((p) => ({
    ...p,
    deckNome: deckNameOverrides[p.deckId] || p.nomeConsolidado || p.deckNome || p.deck?.nome,
  }));

  const filtered = search
    ? enrichedStandings.filter((p) =>
        getPlayerName(p).toLowerCase().includes(search.toLowerCase())
      )
    : enrichedStandings;

  const hasTop8Cut = standings.length > 8 && !search;
  const colCount = isFinished ? 11 : 12;

  return (
    <section className="td-card">
      <div className="td-card-header">
        <h2 className="td-card-title">Standings</h2>
        <div className="td-standings-header-actions">
          {standings.length > 5 && (
            <div className="td-standings-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="td-standings-search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="td-standings-search-input"
                type="text"
                placeholder="Buscar jogador…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar jogador"
              />
              {search && (
                <button
                  type="button"
                  className="td-standings-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Limpar busca"
                >
                  ×
                </button>
              )}
            </div>
          )}
          {isOwner && isFinished && (
            <button
              className="td-btn-top8-story"
              onClick={() => setShowStory(true)}
              title="Gerar imagem do Top 8"
            >
              ✦ Top 8 Story
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="td-empty-text">Nenhum jogador encontrado para "{search}".</p>
      )}

      {filtered.length > 0 && (
        <>
          <div className="td-table-wrapper td-desktop-only">
            <table className="td-table">
              <thead>
                <tr>
                  <th className="td-th-rank">#</th>
                  <th>Jogador</th>
                  <th>Pts</th>
                  <th>V</th>
                  <th>D</th>
                  <th>E</th>
                  <th>MWP</th>
                  <th>OMW%</th>
                  <th>GW%</th>
                  <th>OGW%</th>
                  <th>Deck</th>
                  {!isFinished && <th>Check-in</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((player, index) => {
                  const posicao = player.posicao ?? index + 1;
                  const deckId = player.deckId || player.deck?.id;
                  const deckNameOverride = deckId ? deckNameOverrides[deckId] : undefined;
                  const isTop3 = posicao <= 3 && !player.dropped;
                  const isTop8 = posicao <= 8 && !player.dropped;
                  const showCut = hasTop8Cut && posicao === 8 && !player.dropped;
                  return (
                    <Fragment key={player.usuario?.id || player.usuarioId || player.id || index}>
                      <tr
                        className={[
                          player.dropped ? "td-row-dropped" : "",
                          isTop3 ? `td-row-medal-${posicao}` : isTop8 ? "td-row-top8" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        <td className="td-rank">
                          {isTop3 ? (
                            <span className={`td-rank-badge td-rank-badge--${posicao}`}>{posicao}</span>
                          ) : (
                            <span className="td-rank-num">{posicao}</span>
                          )}
                        </td>
                        <td className="td-player-name">
                          {getPlayerName(player)}
                          {player.dropped && <span className="td-dropped-badge"> DROP</span>}
                        </td>
                        <td>
                          <span className={isTop8 && !player.dropped ? "td-pts-highlight" : undefined}>
                            {player.pontosMesa ?? player.pontos ?? 0}
                          </span>
                        </td>
                        <td className="td-stat-win">{player.vitoriasPartida ?? player.vitorias ?? 0}</td>
                        <td className="td-stat-loss">{player.derrotasPartida ?? player.derrotas ?? 0}</td>
                        <td>{player.empatesPartida ?? player.empates ?? 0}</td>
                        <td className="td-stat-pct">{formatPct(player.mwp)}</td>
                        <td className="td-stat-pct">{formatPct(player.omwp)}</td>
                        <td className="td-stat-pct">{formatPct(player.gwp)}</td>
                        <td className="td-stat-pct">{formatPct(player.ogwp)}</td>
                        <td className="td-deck-cell">
                          {isFinished ? (
                            <DeckViewButton
                              player={player}
                              token={token}
                              isOwner={isOwner}
                              deckNameOverride={deckNameOverride}
                              onDeckNameUpdate={handleDeckNameUpdate}
                            />
                          ) : (
                            <span className={`td-checkin-dot${getDeckStatus(player) ? " td-checked" : ""}`}>
                              {getDeckStatus(player) ? "✓" : "—"}
                            </span>
                          )}
                        </td>
                        {!isFinished && (
                          <td>
                            <span className={`td-checkin-dot${isCheckedIn(player) ? " td-checked" : ""}`}>
                              {isCheckedIn(player) ? "✓" : "—"}
                            </span>
                          </td>
                        )}
                      </tr>
                      {showCut && (
                        <tr className="td-top8-cut-row">
                          <td colSpan={colCount}>
                            <span className="td-top8-cut-label">— Corte para Top 8 —</span>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="td-mobile-only td-standings-mobile-list">
            {filtered.map((player, index) => {
              const posicao = player.posicao ?? index + 1;
              const pontos = player.pontosMesa ?? player.pontos ?? 0;
              const vitorias = player.vitoriasPartida ?? player.vitorias ?? 0;
              const derrotas = player.derrotasPartida ?? player.derrotas ?? 0;
              const empates = player.empatesPartida ?? player.empates ?? 0;
              const deckId = player.deckId || player.deck?.id;
              const deckNameOverride = deckId ? deckNameOverrides[deckId] : undefined;
              const isTop3 = posicao <= 3 && !player.dropped;
              const isTop8 = posicao <= 8 && !player.dropped;
              const showCut = hasTop8Cut && posicao === 8 && !player.dropped;

              return (
                <Fragment key={player.usuario?.id || player.usuarioId || player.id || index}>
                  <article
                    className={[
                      "td-mobile-card",
                      player.dropped ? "td-mobile-card-dropped" : "",
                      isTop3 ? `td-mobile-card-medal-${posicao}` : isTop8 ? "td-mobile-card-top8" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    <div className="td-mobile-card-head">
                      <span className={isTop3 ? `td-mobile-rank td-mobile-rank--medal-${posicao}` : "td-mobile-rank"}>
                        {MEDAL[posicao] ?? `#${posicao}`}
                      </span>
                      <span className="td-mobile-player-name">
                        {getPlayerName(player)}
                        {player.dropped && <span className="td-dropped-badge"> DROP</span>}
                      </span>
                      <span className={`td-mobile-points${isTop8 && !player.dropped ? " td-mobile-points--top8" : ""}`}>
                        {pontos} pts
                      </span>
                    </div>

                    <div className="td-mobile-record">
                      <span className="td-mobile-record-item td-mobile-record-win">{vitorias}V</span>
                      <span className="td-mobile-record-sep">–</span>
                      <span className="td-mobile-record-item td-mobile-record-loss">{derrotas}D</span>
                      <span className="td-mobile-record-sep">–</span>
                      <span className="td-mobile-record-item">{empates}E</span>
                      {!isFinished && (
                        <span className={`td-mobile-checkin-badge${isCheckedIn(player) ? " td-mobile-checkin-badge--in" : ""}`}>
                          {isCheckedIn(player) ? "✓ Check-in" : "Sem check-in"}
                        </span>
                      )}
                    </div>

                    <div className="td-mobile-tiebreakers">
                      <span><span className="td-tb-label">MWP</span> {formatPct(player.mwp)}</span>
                      <span><span className="td-tb-label">OMW%</span> {formatPct(player.omwp)}</span>
                      <span><span className="td-tb-label">GW%</span> {formatPct(player.gwp)}</span>
                      <span><span className="td-tb-label">OGW%</span> {formatPct(player.ogwp)}</span>
                    </div>

                    {isFinished && (
                      <div className="td-mobile-deck-row">
                        <DeckViewButton
                          player={player}
                          token={token}
                          isOwner={isOwner}
                          deckNameOverride={deckNameOverride}
                          onDeckNameUpdate={handleDeckNameUpdate}
                        />
                      </div>
                    )}
                  </article>
                  {showCut && (
                    <div className="td-top8-cut-mobile">
                      <span className="td-top8-cut-label">— Corte para Top 8 —</span>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </>
      )}

      {showStory && (
        <Top8StoryModal
          standings={enrichedStandings}
          torneioNome={torneioNome}
          deckNameOverrides={deckNameOverrides}
          onClose={() => setShowStory(false)}
        />
      )}
    </section>
  );
}
