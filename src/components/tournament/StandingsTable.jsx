import { useEffect, useRef, useState } from "react";
import { buscarDeck, atualizarDeck } from "../../services/backendApi";
import { Top8StoryModal } from "./Top8StoryModal";

function DeckDropdown({ deckId, deckNome, token, onClose }) {
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  return (
    <div className="deck-dropdown" ref={ref}>
      <div className="deck-dropdown-header">
        <span className="deck-dropdown-title">{deckNome || "Deck"}</span>
        <button type="button" className="deck-dropdown-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>

      {loading && <p className="deck-dropdown-empty">Carregando...</p>}
      {error && <p className="deck-dropdown-empty deck-dropdown-error">{error}</p>}

      {!loading && !error && deck && (
        <div className="deck-dropdown-body">
          <div className="deck-dropdown-section">
            <span className="deck-dropdown-section-title">
              Maindeck
              <span className="deck-dropdown-count">{totalMain}</span>
            </span>
            <ul className="deck-dropdown-list">
              {maindeck.map((card) => (
                <li key={card.nome} className="deck-dropdown-card">
                  <span className="deck-dropdown-qty">{card.quantidade}x</span>
                  <span className="deck-dropdown-name">{card.nome}</span>
                </li>
              ))}
            </ul>
          </div>

          {sideboard.length > 0 && (
            <div className="deck-dropdown-section deck-dropdown-section--side">
              <span className="deck-dropdown-section-title">
                Sideboard
                <span className="deck-dropdown-count">{totalSide}</span>
              </span>
              <ul className="deck-dropdown-list">
                {sideboard.map((card) => (
                  <li key={card.nome} className="deck-dropdown-card">
                    <span className="deck-dropdown-qty">{card.quantidade}x</span>
                    <span className="deck-dropdown-name">{card.nome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeckNameEditPopover({ deckId, currentName, token, onSave, onClose }) {
  const [name, setName] = useState(currentName || "");
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
          nome: name.trim(),
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
      <p className="deck-edit-label">Renomear deck</p>
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
  const deckNome = deckNameOverride || player?.deckNome || player?.deck?.nome;

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
        <span className="td-btn-deck-view-name">{deckNome || "Ver deck"}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
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
          title="Editar nome do deck"
          aria-label="Editar nome do deck"
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
          currentName={deckNome}
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

  const getDeckStatus = (player) => {
    const hasDeck = player?.deckId || player?.deck?.id || player?.deckConfirmado;
    return hasDeck;
  };

  const isCheckedIn = (player) =>
    player?.checkIn || player?.checkin || player?.checkedIn || player?.presenca || false;

  const formatPct = (val) => (val != null ? `${(val * 100).toFixed(1)}%` : "—");

  const handleDeckNameUpdate = (deckId, newName) => {
    setDeckNameOverrides((prev) => ({ ...prev, [deckId]: newName }));
  };

  const enrichedStandings = standings.map((p) => ({
    ...p,
    deckNome: deckNameOverrides[p.deckId] || p.deckNome || p.deck?.nome,
  }));

  return (
    <section className="td-card">
      <div className="td-card-header">
        <h2 className="td-card-title">Standings</h2>
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

      <div className="td-table-wrapper td-desktop-only">
        <table className="td-table">
          <thead>
            <tr>
              <th>#</th>
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
            {standings.map((player, index) => {
              const deckId = player.deckId || player.deck?.id;
              const deckNameOverride = deckId ? deckNameOverrides[deckId] : undefined;
              return (
                <tr
                  key={player.usuario?.id || player.usuarioId || player.id || index}
                  className={player.dropped ? "td-row-dropped" : ""}
                >
                  <td className="td-rank">{player.posicao ?? index + 1}</td>
                  <td className="td-player-name">
                    {getPlayerName(player)}
                    {player.dropped && <span className="td-dropped-badge"> DROP</span>}
                  </td>
                  <td>{player.pontosMesa ?? player.pontos ?? 0}</td>
                  <td>{player.vitoriasPartida ?? player.vitorias ?? 0}</td>
                  <td>{player.derrotasPartida ?? player.derrotas ?? 0}</td>
                  <td>{player.empatesPartida ?? player.empates ?? 0}</td>
                  <td>{formatPct(player.mwp)}</td>
                  <td>{formatPct(player.omwp)}</td>
                  <td>{formatPct(player.gwp)}</td>
                  <td>{formatPct(player.ogwp)}</td>
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
                      <span
                        className={`td-checkin-dot ${getDeckStatus(player) ? "td-checked" : ""}`}
                      >
                        {getDeckStatus(player) ? "✓" : "—"}
                      </span>
                    )}
                  </td>
                  {!isFinished && (
                    <td>
                      <span
                        className={`td-checkin-dot ${isCheckedIn(player) ? "td-checked" : ""}`}
                      >
                        {isCheckedIn(player) ? "✓" : "—"}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="td-mobile-only td-standings-mobile-list">
        {standings.map((player, index) => {
          const posicao = player.posicao ?? index + 1;
          const pontos = player.pontosMesa ?? player.pontos ?? 0;
          const vitorias = player.vitoriasPartida ?? player.vitorias ?? 0;
          const derrotas = player.derrotasPartida ?? player.derrotas ?? 0;
          const empates = player.empatesPartida ?? player.empates ?? 0;
          const deckId = player.deckId || player.deck?.id;
          const deckNameOverride = deckId ? deckNameOverrides[deckId] : undefined;

          return (
            <article
              key={player.usuario?.id || player.usuarioId || player.id || index}
              className={`td-mobile-card ${player.dropped ? "td-mobile-card-dropped" : ""}`}
            >
              <div className="td-mobile-card-head">
                <span className="td-mobile-rank">#{posicao}</span>
                <span className="td-mobile-player-name">
                  {getPlayerName(player)}
                  {player.dropped && <span className="td-dropped-badge"> DROP</span>}
                </span>
                <span className="td-mobile-points">{pontos} pts</span>
              </div>

              <div className="td-mobile-grid-2">
                <span>
                  <strong>V-D-E:</strong> {vitorias}-{derrotas}-{empates}
                </span>
                {!isFinished && (
                  <span>
                    <strong>Check-in:</strong> {isCheckedIn(player) ? "✓" : "—"}
                  </span>
                )}
                <span>
                  <strong>MWP:</strong> {formatPct(player.mwp)}
                </span>
                <span>
                  <strong>OMW%:</strong> {formatPct(player.omwp)}
                </span>
                <span>
                  <strong>GW%:</strong> {formatPct(player.gwp)}
                </span>
                <span>
                  <strong>OGW%:</strong> {formatPct(player.ogwp)}
                </span>
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
          );
        })}
      </div>

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
