import { useState } from "react";

const normalizeId = (v) => (v === undefined || v === null ? "" : String(v));

function ScoreSelect({ value, onChange }) {
  return (
    <select
      className="td-owner-score-select"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {[0, 1, 2].map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}

function MatchEditRow({ partida, onSave, saving }) {
  const [v1, setV1] = useState(partida.vitoriasJogador1 ?? 0);
  const [v2, setV2] = useState(partida.vitoriasJogador2 ?? 0);
  const [editing, setEditing] = useState(false);

  const nome1 = partida.jogador1Nome || partida.jogador1?.nome || "Jogador 1";
  const nome2 = !partida.jogador2Id && !partida.jogador2
    ? "BYE"
    : (partida.jogador2Nome || partida.jogador2?.nome || "Jogador 2");
  const mesa = partida.mesa ?? partida.mesaNumero ?? partida.numeroMesa ?? "—";
  const isBye = nome2 === "BYE";
  const isFinalizada = partida.status === "finalizada";

  return (
    <div className={`td-owner-match-row${editing ? " td-owner-match-row--editing" : ""}`}>
      <span className="td-owner-match-mesa">Mesa {mesa}</span>

      <div className="td-owner-match-players">
        <span className="td-owner-match-nome">{nome1}</span>
        {editing && !isBye ? (
          <div className="td-owner-match-score-edit">
            <ScoreSelect value={v1} onChange={setV1} />
            <span className="td-owner-match-sep">–</span>
            <ScoreSelect value={v2} onChange={setV2} />
          </div>
        ) : (
          <span className={`td-mesa-score ${isFinalizada ? "td-mesa-score--done" : "td-mesa-score--pending"}`}>
            {isFinalizada
              ? `${partida.vitoriasJogador1 ?? 0} – ${partida.vitoriasJogador2 ?? 0}`
              : "VS"}
          </span>
        )}
        <span className="td-owner-match-nome">{nome2}</span>
      </div>

      {!isBye && (
        <div className="td-owner-match-actions">
          {editing ? (
            <>
              <button
                type="button"
                className="td-btn td-btn-primary td-btn-sm"
                onClick={async () => {
                  await onSave(partida.id, { vitoriasJogador1: v1, vitoriasJogador2: v2 });
                  setEditing(false);
                }}
                disabled={saving}
              >
                {saving ? "..." : "Salvar"}
              </button>
              <button
                type="button"
                className="td-btn td-btn-ghost td-btn-sm"
                onClick={() => { setV1(partida.vitoriasJogador1 ?? 0); setV2(partida.vitoriasJogador2 ?? 0); setEditing(false); }}
              >
                ✕
              </button>
            </>
          ) : (
            <button
              type="button"
              className="td-btn td-btn-secondary td-btn-sm"
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OwnerControlPanel({
  torneio,
  standings,
  usuarioId,
  pendingCheckinPlayers,
  onNextRound,
  onDropPlayer,
  onEditResult,
  actionLoading,
  droppingPlayerId,
  partidas,
}) {
  const isOwner = normalizeId(torneio?.donoId) === normalizeId(usuarioId);
  const isOngoing = torneio?.status === "em_andamento";
  const [activeTab, setActiveTab] = useState("mesas");

  if (!isOwner || !isOngoing) return null;

  const jogadoresAtivos = (standings || []).filter((p) => !p?.dropped);
  const pendentesCheckin = pendingCheckinPlayers || [];
  const canStart = pendentesCheckin.length === 0;
  const isLastRound =
    Number(torneio?.totalRodadas || 0) > 0 &&
    Number(torneio?.rodadaAtual || 0) >= Number(torneio?.totalRodadas || 0);

  const getPlayerName = (p) =>
    p?.usuario?.nome || p?.nome || p?.username || p?.userName || "Jogador";
  const getPlayerId = (p) =>
    p?.usuarioId || p?.userId || p?.usuario?.id || p?.id;

  const rodadaAtual = Number(torneio?.rodadaAtual || 0);
  const partidasRodada = (partidas || []).filter(
    (p) => !rodadaAtual || Number(p.rodada) === rodadaAtual,
  );
  const pendentes = partidasRodada.filter((p) => p.status !== "finalizada");
  const finalizadas = partidasRodada.filter((p) => p.status === "finalizada");

  return (
    <section className="td-card td-owner-panel">
      <div className="td-owner-header">
        <div>
          <h2 className="td-card-title">Painel do Organizador</h2>
          <p className="td-owner-round-info">
            Rodada {torneio?.rodadaAtual ?? "—"} de {torneio?.totalRodadas ?? "—"}
          </p>
        </div>

        <div className="td-owner-next-action">
          {!canStart && (
            <p className="td-hint td-owner-warning">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {pendentesCheckin.length} jogador(es) sem check-in
            </p>
          )}
          <button
            className={`td-btn ${canStart ? "td-btn-primary" : "td-btn-disabled"}`}
            type="button"
            onClick={onNextRound}
            disabled={actionLoading || !canStart}
          >
            {actionLoading
              ? "Processando..."
              : !canStart
                ? "Aguardando check-in"
                : isLastRound
                  ? "Finalizar Torneio"
                  : "Iniciar Próxima Rodada"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="td-owner-tabs">
        <button
          type="button"
          className={`td-owner-tab${activeTab === "mesas" ? " is-active" : ""}`}
          onClick={() => setActiveTab("mesas")}
        >
          Mesas
          {pendentes.length > 0 && (
            <span className="td-owner-tab-badge">{pendentes.length}</span>
          )}
        </button>
        <button
          type="button"
          className={`td-owner-tab${activeTab === "jogadores" ? " is-active" : ""}`}
          onClick={() => setActiveTab("jogadores")}
        >
          Jogadores
          {pendentesCheckin.length > 0 && (
            <span className="td-owner-tab-badge td-owner-tab-badge--warn">{pendentesCheckin.length}</span>
          )}
        </button>
      </div>

      {/* Tab: Mesas */}
      {activeTab === "mesas" && (
        <div className="td-owner-matches">
          {partidasRodada.length === 0 ? (
            <p className="td-empty-text">Nenhuma mesa na rodada atual.</p>
          ) : (
            <>
              <div className="td-owner-matches-summary">
                <span className="td-owner-summary-chip td-owner-summary-done">
                  {finalizadas.length} finalizada{finalizadas.length !== 1 ? "s" : ""}
                </span>
                <span className="td-owner-summary-chip td-owner-summary-pending">
                  {pendentes.length} pendente{pendentes.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="td-owner-match-list">
                {partidasRodada.map((partida) => (
                  <MatchEditRow
                    key={partida.id}
                    partida={partida}
                    onSave={onEditResult}
                    saving={actionLoading}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: Jogadores */}
      {activeTab === "jogadores" && (
        <div className="td-owner-player-list">
          {jogadoresAtivos.length === 0 ? (
            <p className="td-empty-text">Nenhum jogador ativo.</p>
          ) : (
            jogadoresAtivos.map((player) => {
              const playerId = getPlayerId(player);
              const normalizedId = normalizeId(playerId);
              const isMe = normalizeId(playerId) === normalizeId(usuarioId);
              const checkinOk =
                player?.checkInProximaRodada || player?.checkinProximaRodada || player?.nextRoundCheckin;

              return (
                <div
                  key={normalizedId || getPlayerName(player)}
                  className="td-owner-player-row"
                >
                  <div className="td-owner-player-info">
                    <span className="td-owner-player-name">
                      {getPlayerName(player)}{isMe ? " (Você)" : ""}
                    </span>
                    <div className="td-owner-player-meta">
                      <span>{player?.pontosMesa ?? player?.pontos ?? 0} pts</span>
                      <span className={`td-owner-checkin-status ${checkinOk ? "is-ok" : "is-pending"}`}>
                        {checkinOk ? "✓ check-in" : "⏳ aguardando"}
                      </span>
                    </div>
                  </div>

                  <button
                    className="td-btn td-btn-secondary td-btn-danger td-btn-sm"
                    type="button"
                    onClick={() => onDropPlayer(playerId)}
                    disabled={actionLoading || !playerId}
                  >
                    {droppingPlayerId && normalizeId(droppingPlayerId) === normalizedId
                      ? "Dropando..."
                      : "Drop"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
