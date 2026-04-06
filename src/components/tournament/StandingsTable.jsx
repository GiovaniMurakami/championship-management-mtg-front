import { Fragment, useEffect, useRef, useState } from "react";
import { buscarDeck, atualizarDeck } from "../../services/backendApi";
import { Top8StoryModal } from "./Top8StoryModal";

const RANK_BADGE = {
  1: "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800] shadow-[0_0_8px_rgba(255,215,0,0.45)]",
  2: "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e] shadow-[0_0_6px_rgba(200,200,200,0.3)]",
  3: "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0] shadow-[0_0_6px_rgba(205,127,50,0.35)]",
};

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
    <div className="absolute top-[calc(100%+0.4rem)] right-0 z-50 w-[300px] max-h-[440px] border border-[rgba(199,149,255,0.3)] rounded-[0.85rem] bg-[rgba(14,9,28,0.97)] [backdrop-filter:blur(12px)] shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden" ref={ref}>
      <div className="flex items-center justify-between px-[0.85rem] py-[0.65rem] border-b border-[rgba(217,180,255,0.2)] flex-shrink-0">
        <div className="flex items-center gap-[0.45rem] min-w-0 overflow-hidden">
          <span className="text-[0.85rem] font-bold text-[#f5edff] overflow-hidden text-ellipsis whitespace-nowrap">{deckNome || "Deck"}</span>
          {deck?.formato && (
            <span className="flex-shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.05em] px-[0.42rem] py-[0.1rem] rounded-[0.35rem] bg-[rgba(167,79,255,0.18)] border border-[rgba(199,149,255,0.35)] text-[#c795ff] whitespace-nowrap">{deck.formato}</span>
          )}
        </div>
        <button type="button" className="border-none bg-transparent text-[#beafd7] text-[1.1rem] leading-none cursor-pointer px-[0.15rem] flex-shrink-0 hover:text-[#f5edff]" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      </div>

      {loading && (
        <div className="px-[0.85rem] py-3 flex flex-col gap-[0.45rem]">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-[0.7rem] rounded-[0.35rem] bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_25%,rgba(199,149,255,0.1)_50%,rgba(255,255,255,0.04)_75%)] bg-[length:400px_100%] animate-[deck-skeleton-shimmer_1.4s_ease-in-out_infinite]"
              style={{ width: `${48 + (i % 4) * 13}%` }}
            />
          ))}
        </div>
      )}

      {error && <p className="px-[0.85rem] py-3 m-0 text-[0.85rem] text-[#f87171]">{error}</p>}

      {!loading && !error && deck && (
        <>
          <div className="overflow-y-auto py-2">
            <div className="px-[0.85rem] pb-2">
              <div className="flex items-center justify-between text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] mb-[0.35rem]">
                <span>Maindeck</span>
                <span className="text-[0.7rem] text-[#beafd7] font-normal normal-case tracking-normal">{totalMain} cartas</span>
              </div>
              <ul className="m-0 p-0 list-none grid gap-[0.15rem]">
                {maindeck.map((card) => (
                  <li key={card.nome} className="flex items-baseline gap-[0.4rem] text-[0.8rem]">
                    <span className="font-bold text-[#c795ff] min-w-[20px] text-right flex-shrink-0">{card.quantidade}</span>
                    <span className="text-[#f5edff] overflow-hidden text-ellipsis whitespace-nowrap">{card.nome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {sideboard.length > 0 && (
              <div className="px-[0.85rem] pt-2 pb-2 border-t border-[rgba(217,180,255,0.2)]">
                <div className="flex items-center justify-between text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] mb-[0.35rem]">
                  <span>Sideboard</span>
                  <span className="text-[0.7rem] text-[#beafd7] font-normal normal-case tracking-normal">{totalSide} cartas</span>
                </div>
                <ul className="m-0 p-0 list-none grid gap-[0.15rem]">
                  {sideboard.map((card) => (
                    <li key={card.nome} className="flex items-baseline gap-[0.4rem] text-[0.8rem]">
                      <span className="font-bold text-[#c795ff] min-w-[20px] text-right flex-shrink-0">{card.quantidade}</span>
                      <span className="text-[#f5edff] overflow-hidden text-ellipsis whitespace-nowrap">{card.nome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 px-[0.85rem] py-2 border-t border-[rgba(217,180,255,0.2)] flex-shrink-0">
            <span className="text-[0.72rem] text-[#beafd7]">{totalMain + totalSide} cartas</span>
            <button
              type="button"
              className={`inline-flex items-center gap-[0.3rem] px-[0.65rem] py-[0.22rem] border rounded-full text-[0.72rem] font-semibold font-['inherit'] cursor-pointer transition-[background,border-color,color] duration-150 ${copied ? "bg-[rgba(34,197,94,0.15)] border-[rgba(34,197,94,0.4)] text-[#86efac] hover:bg-[rgba(34,197,94,0.22)] hover:border-[rgba(34,197,94,0.55)]" : "border-[rgba(199,149,255,0.3)] bg-[rgba(167,79,255,0.1)] text-[#c4b5fd] hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.5)]"}`}
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
    <div className="absolute top-[calc(100%+0.4rem)] right-0 z-[60] w-[260px] border border-[rgba(199,149,255,0.35)] rounded-[0.85rem] bg-[rgba(14,9,28,0.98)] [backdrop-filter:blur(14px)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] p-[0.85rem] flex flex-col gap-[0.55rem]" ref={ref}>
      <p className="text-[0.75rem] font-bold text-[#beafd7] uppercase tracking-[0.06em] m-0">Nome consolidado</p>
      <input
        ref={inputRef}
        className="w-full box-border px-[0.65rem] py-[0.45rem] border border-[rgba(199,149,255,0.35)] rounded-lg bg-[rgba(167,79,255,0.08)] text-[#f5edff] text-[0.85rem] font-['inherit'] outline-none transition-[border-color] duration-150 focus:border-[rgba(199,149,255,0.65)]"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onClose();
        }}
        maxLength={60}
        placeholder="Nome do deck"
      />
      {error && <p className="text-[0.73rem] text-[#f87171] m-0">{error}</p>}
      <div className="flex gap-[0.45rem] justify-end">
        <button className="px-[0.7rem] py-[0.3rem] border border-[rgba(199,149,255,0.25)] rounded-[6px] bg-transparent text-[#beafd7] text-[0.78rem] font-['inherit'] cursor-pointer transition-[background] duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(255,255,255,0.06)]" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          className="px-[0.85rem] py-[0.3rem] border border-[rgba(167,79,255,0.5)] rounded-[6px] bg-[rgba(167,79,255,0.2)] text-[#c4b5fd] text-[0.78rem] font-bold font-['inherit'] cursor-pointer transition-[background,border-color] duration-150 disabled:opacity-[0.45] disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(167,79,255,0.32)] hover:not-disabled:border-[rgba(167,79,255,0.7)]"
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

  if (!deckId) return <span className="text-[#beafd7]">—</span>;

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-[0.3rem] px-[0.6rem] py-[0.22rem] border border-[rgba(199,149,255,0.4)] rounded-full bg-[rgba(167,79,255,0.12)] text-[#c4b5fd] text-[0.74rem] font-semibold font-['inherit'] cursor-pointer max-w-[180px] min-w-0 transition-[background,border-color] duration-[180ms] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(199,149,255,0.6)]"
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
        <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{deckNome || "Ver deck"}</span>
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
          className="inline-flex items-center justify-center px-[0.35rem] py-[0.2rem] border border-[rgba(199,149,255,0.3)] rounded-[6px] bg-transparent text-[#beafd7] text-[0.72rem] cursor-pointer ml-[0.3rem] transition-[background,color,border-color] duration-150 flex-shrink-0 hover:bg-[rgba(167,79,255,0.15)] hover:text-[#c4b5fd] hover:border-[rgba(199,149,255,0.5)]"
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
  isRegistrationOpen = false,
  token,
  isOwner = false,
  torneioNome = "",
  rodadaAtual = 0,
}) {
  const [deckNameOverrides, setDeckNameOverrides] = useState({});
  const [showStory, setShowStory] = useState(false);
  const [search, setSearch] = useState("");

  if (!standings || standings.length === 0) {
    return (
      <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
        <h2 className="m-0 mb-4 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Standings</h2>
        <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum dado de standings disponível.</p>
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
    (player?.checkinRodada ?? -1) >= 0;

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

  const hasTop8Cut = standings.length > 8 && !search && !isRegistrationOpen;
  const colCount = isRegistrationOpen ? 4 : isFinished ? 11 : 12;

  return (
    <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">{isRegistrationOpen ? 'Jogadores Inscritos' : 'Standings'}</h2>
        <div className="flex items-center gap-[0.6rem] flex-wrap">
          {standings.length > 5 && (
            <div className="relative flex items-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="absolute left-[0.55rem] text-[#beafd7] pointer-events-none flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="pl-[1.85rem] pr-[1.8rem] py-[0.28rem] border border-[rgba(199,149,255,0.3)] rounded-full bg-[rgba(167,79,255,0.08)] text-[#f5edff] text-[0.78rem] font-['inherit'] outline-none w-40 transition-[border-color,background,width] duration-[250ms] placeholder:text-[#beafd7] focus:border-[rgba(199,149,255,0.55)] focus:bg-[rgba(167,79,255,0.13)] focus:w-52"
                type="text"
                placeholder="Buscar jogador…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar jogador"
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-[0.4rem] bg-transparent border-none text-[#beafd7] text-[1rem] leading-none cursor-pointer px-[0.1rem] flex items-center hover:text-[#f5edff]"
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
              className="inline-flex items-center gap-[0.35rem] px-[0.85rem] py-[0.32rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.76rem] font-bold font-['inherit'] cursor-pointer whitespace-nowrap transition-[background,border-color,color] duration-[180ms] tracking-[0.02em] hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)] hover:text-[#ffe168]"
              onClick={() => setShowStory(true)}
              title="Gerar imagem do Top 8"
            >
              ✦ Top 8 Story
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum jogador encontrado para "{search}".</p>
      )}

      {filtered.length > 0 && (
        <>
          <div className="rounded-xl border border-[rgba(217,180,255,0.2)] hidden max-[480px]:hidden [&]:block max-[480px]:[&]:hidden">
            <table className="w-full border-collapse text-[0.88rem]">
              <thead className="bg-[rgba(142,57,237,0.12)]">
                <tr>
                  <th className="w-10 text-center px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">#</th>
                  <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">Jogador</th>
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">Pts</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">V</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">D</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">E</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">MWP</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">OMW%</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">GW%</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">OGW%</th>}
                  <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">Deck</th>
                  {!isFinished && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">Check-in</th>}
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

                  const rowBorderClass = isTop3
                    ? posicao === 1 ? "border-l-2 border-l-[rgba(255,215,0,0.5)]" : posicao === 2 ? "border-l-2 border-l-[rgba(192,192,192,0.45)]" : "border-l-2 border-l-[rgba(205,127,50,0.45)]"
                    : isTop8 ? "border-l-2 border-l-[rgba(167,79,255,0.3)]" : "";

                  return (
                    <Fragment key={player.usuario?.id || player.usuarioId || player.id || index}>
                      <tr
                        className={`transition-[background] duration-150 hover:bg-[rgba(167,79,255,0.06)] ${player.dropped ? "opacity-50" : ""} ${rowBorderClass}`}
                      >
                        <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] text-center font-bold text-[#c795ff]">
                          {isTop3 ? (
                            <span className={`inline-flex items-center justify-center w-[1.6rem] h-[1.6rem] rounded-full text-[0.72rem] font-extrabold leading-none ${posicao === 1 ? "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800] shadow-[0_0_8px_rgba(255,215,0,0.45)]" : posicao === 2 ? "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e] shadow-[0_0_6px_rgba(200,200,200,0.3)]" : "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0] shadow-[0_0_6px_rgba(205,127,50,0.35)]"}`}>{posicao}</span>
                          ) : (
                            <span className="text-[#beafd7] text-[0.82rem]">{posicao}</span>
                          )}
                        </td>
                        <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] font-semibold">
                          <span className={player.dropped ? "line-through" : ""}>{getPlayerName(player)}</span>
                          {player.dropped && <span className="text-[0.65rem] font-bold text-[#f87171] tracking-[0.05em]"> DROP</span>}
                        </td>
                        {!isRegistrationOpen && (
                          <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff]">
                            <span className={isTop8 && !player.dropped ? "text-[#fde68a] font-bold" : undefined}>
                              {player.pontosMesa ?? player.pontos ?? 0}
                            </span>
                          </td>
                        )}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#86efac] font-semibold">{player.vitoriasPartida ?? player.vitorias ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#fca5a5]">{player.derrotasPartida ?? player.derrotas ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff]">{player.empatesPartida ?? player.empates ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] [font-variant-numeric:tabular-nums]">{formatPct(player.mwp)}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] [font-variant-numeric:tabular-nums]">{formatPct(player.omwp)}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] [font-variant-numeric:tabular-nums]">{formatPct(player.gwp)}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] [font-variant-numeric:tabular-nums]">{formatPct(player.ogwp)}</td>}
                        <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] relative">
                          {isFinished ? (
                            <DeckViewButton
                              player={player}
                              token={token}
                              isOwner={isOwner}
                              deckNameOverride={deckNameOverride}
                              onDeckNameUpdate={handleDeckNameUpdate}
                            />
                          ) : (
                            <span className={getDeckStatus(player) ? "text-[#4ade80]" : "text-[#beafd7]"}>
                              {getDeckStatus(player) ? "✓" : "—"}
                            </span>
                          )}
                        </td>
                        {!isFinished && (
                          <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff]">
                            {isCheckedIn(player) ? (
                              <span className="inline-flex items-center gap-[0.25rem] text-[#4ade80] font-semibold">
                                ✓
                                <span className="text-[0.7rem] font-bold text-[#86efac] bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] rounded-full px-[0.4rem] py-[0.05rem]">
                                  R{(player.checkinRodada ?? -1) + 1}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[#beafd7]">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                      {showCut && (
                        <tr>
                          <td colSpan={colCount} className="px-3 py-[0.2rem] bg-[rgba(167,79,255,0.05)] border-t border-dashed border-t-[rgba(167,79,255,0.35)] border-b border-dashed border-b-[rgba(167,79,255,0.35)]">
                            <span className="block text-center text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[rgba(167,79,255,0.6)]">— Corte para Top 8 —</span>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="hidden max-[480px]:grid gap-[0.55rem]">
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

              const mobileBorderClass = isTop3
                ? posicao === 1 ? "border-[rgba(255,215,0,0.45)] bg-[rgba(255,215,0,0.04)]" : posicao === 2 ? "border-[rgba(192,192,192,0.4)] bg-[rgba(192,192,192,0.03)]" : "border-[rgba(205,127,50,0.4)] bg-[rgba(205,127,50,0.03)]"
                : isTop8 ? "border-[rgba(167,79,255,0.3)] bg-[rgba(255,255,255,0.03)]" : "border-[rgba(217,180,255,0.2)] bg-[rgba(255,255,255,0.03)]";

              const mobileRankColor = isTop3
                ? posicao === 1 ? "text-[#ffd700]" : posicao === 2 ? "text-[#c0c0c0]" : "text-[#cd7f32]"
                : "text-[#c795ff]";

              return (
                <Fragment key={player.usuario?.id || player.usuarioId || player.id || index}>
                  <article
                    className={`border rounded-xl p-[0.7rem] ${mobileBorderClass} ${player.dropped ? "opacity-65" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-[0.45rem]">
                      {isTop3 && !isRegistrationOpen ? (
                        <span className={`inline-flex items-center justify-center w-[1.6rem] h-[1.6rem] rounded-full text-[0.72rem] font-extrabold leading-none flex-shrink-0 ${RANK_BADGE[posicao]}`}>
                          {posicao}
                        </span>
                      ) : (
                        <span className={`font-bold flex-shrink-0 ${mobileRankColor}`}>#{posicao}</span>
                      )}
                      <span className={`font-semibold text-white break-words ${player.dropped ? "line-through" : ""}`}>
                        {getPlayerName(player)}
                        {player.dropped && <span className="text-[0.65rem] font-bold text-[#f87171] tracking-[0.05em]"> DROP</span>}
                      </span>
                      {!isRegistrationOpen && (
                        <span className={`font-bold text-[0.82rem] ${isTop8 && !player.dropped ? "text-[#fbbf24]" : "text-[#fde68a]"}`}>
                          {pontos} pts
                        </span>
                      )}
                    </div>

                    {isRegistrationOpen ? (
                      <div className="flex items-center gap-3 text-[0.82rem]">
                        <span className={`text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full border ${getDeckStatus(player) ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] text-[#86efac]" : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]"}`}>
                          {getDeckStatus(player) ? "✓ Deck" : "Sem deck"}
                        </span>
                        <span className={`text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full border ${isCheckedIn(player) ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] text-[#86efac]" : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]"}`}>
                          {isCheckedIn(player) ? `✓ Check-in R${(player.checkinRodada ?? -1) + 1}` : "Sem check-in"}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-[0.35rem] mb-[0.4rem] text-[0.82rem]">
                          <span className="font-semibold text-[#86efac]">{vitorias}V</span>
                          <span className="text-[#beafd7] font-normal">–</span>
                          <span className="font-semibold text-[#fca5a5]">{derrotas}D</span>
                          <span className="text-[#beafd7] font-normal">–</span>
                          <span className="font-semibold text-[#f5edff]">{empates}E</span>
                          {!isFinished && (
                            <span className={`ml-auto text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full border ${isCheckedIn(player) ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] text-[#86efac]" : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]"}`}>
                              {isCheckedIn(player) ? `✓ Check-in R${(player.checkinRodada ?? -1) + 1}` : "Sem check-in"}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3 flex-wrap text-[0.77rem] text-[#beafd7] [font-variant-numeric:tabular-nums]">
                          <span><span className="text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[rgba(199,149,255,0.6)] mr-[0.15rem]">MWP</span> {formatPct(player.mwp)}</span>
                          <span><span className="text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[rgba(199,149,255,0.6)] mr-[0.15rem]">OMW%</span> {formatPct(player.omwp)}</span>
                          <span><span className="text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[rgba(199,149,255,0.6)] mr-[0.15rem]">GW%</span> {formatPct(player.gwp)}</span>
                          <span><span className="text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[rgba(199,149,255,0.6)] mr-[0.15rem]">OGW%</span> {formatPct(player.ogwp)}</span>
                        </div>
                      </>
                    )}

                    {isFinished && (
                      <div className="mt-2 pt-2 border-t border-[rgba(217,180,255,0.2)]">
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
                    <div className="flex items-center justify-center py-[0.3rem]">
                      <span className="block text-center text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[rgba(167,79,255,0.6)]">— Corte para Top 8 —</span>
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
