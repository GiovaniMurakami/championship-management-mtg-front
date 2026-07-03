/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buscarDeck, atualizarDeck } from "../../services/backendApi";
import { buscarCartasPorNome } from "../../services/scryfallApi";
import { Tooltip } from "../ui/Tooltip";

export const RANK_BADGE = {
  1: "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800] shadow-[0_0_8px_rgba(255,215,0,0.45)]",
  2: "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e] shadow-[0_0_6px_rgba(200,200,200,0.3)]",
  3: "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0] shadow-[0_0_6px_rgba(205,127,50,0.35)]",
};

const COLOR_MAP = { W: "#f0c040", U: "#2563eb", B: "#7c3aed", R: "#dc2626", G: "#16a34a" };
const COLOR_LABELS = { W: "Branco", U: "Azul", B: "Preto", R: "Vermelho", G: "Verde" };
const TYPE_LABELS = {
  Creature: "Criaturas", Planeswalker: "Planeswalkers", Battle: "Batalhas",
  Instant: "Mágicas Inst.", Sorcery: "Feitiços", Enchantment: "Encantamentos",
  Artifact: "Artefatos", Land: "Terrenos", Other: "Outros",
};
const TYPE_ORDER = ["Creature", "Planeswalker", "Battle", "Instant", "Sorcery", "Enchantment", "Artifact", "Land", "Other"];
const CURVE_BUCKETS = ["0", "1", "2", "3", "4", "5", "6", "7+"];
const FORMAT_LABELS = {
  standard: "Standard",
  modern: "Modern",
  pioneer: "Pioneer",
  legacy: "Legacy",
  pauper: "Pauper",
  commander: "Commander",
  commander500: "Commander 500",
};

function DeckDrawer({ deckId, deckNome, playerName, playerRank, token, onClose }) {
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!deckId || !token) return;

    const resolveCards = async (entries) => {
      const cards = await buscarCartasPorNome(entries.map((entry) => entry.nome));

      return cards.map((card, index) => {
        const entry = entries[index];
        return card
          ? { nome: card.nome, quantidade: entry.quantidade || 1, imagem: card.imagem || "", cmc: card.cmc, typeLine: card.typeLine || "", colors: card.colors || [], manaCost: card.manaCost || "", isBasicLand: card.isBasicLand }
          : { nome: entry.nome, quantidade: entry.quantidade || 1, imagem: "", cmc: 0, typeLine: "", colors: [] };
      });
    };

    buscarDeck(deckId, token)
      .then(async (data) => {
        const [resolvedMain, resolvedSide] = await Promise.all([
          resolveCards(data.maindeck || []),
          resolveCards(data.sideboard || []),
        ]);
        setDeck({ ...data, maindeck: resolvedMain, sideboard: resolvedSide });
      })
      .catch((err) => setError(err?.message || "Não foi possível carregar o deck."))
      .finally(() => setLoading(false));
  }, [deckId, token]);

  const maindeck = useMemo(() => deck?.maindeck || [], [deck]);
  const sideboard = useMemo(() => deck?.sideboard || [], [deck]);
  const totalMain = maindeck.reduce((s, c) => s + (c.quantidade || 1), 0);
  const totalSide = sideboard.reduce((s, c) => s + (c.quantidade || 1), 0);

  const manaCurve = useMemo(() => {
    const counts = Object.fromEntries(CURVE_BUCKETS.map((b) => [b, 0]));
    maindeck.forEach((card) => {
      const manaValue = Number.isFinite(card.cmc) ? card.cmc : Number(card.cmc) || 0;
      const key = manaValue >= 7 ? "7+" : Math.floor(manaValue).toString();
      counts[key] = (counts[key] || 0) + (card.quantidade || 1);
    });
    return CURVE_BUCKETS.map((label) => ({ label, count: counts[label] }));
  }, [maindeck]);

  const maxCurve = Math.max(...manaCurve.map((b) => b.count), 1);

  const grouped = useMemo(() => {
    const groups = Object.fromEntries(TYPE_ORDER.map((t) => [t, []]));
    maindeck.forEach((card) => {
      const tl = card.typeLine || "";
      const match = TYPE_ORDER.slice(0, -1).find((t) => tl.includes(t));
      groups[match || "Other"].push(card);
    });
    return TYPE_ORDER.filter((t) => groups[t].length > 0).map((t) => ({ type: t, cards: groups[t] }));
  }, [maindeck]);

  const colors = useMemo(() => {
    const set = new Set();
    maindeck.forEach((card) => (card.colors || []).forEach((c) => set.add(c)));
    return [...set];
  }, [maindeck]);

  const handleCopy = () => {
    const lines = [
      `// ${deckNome || deck?.nome || "Deck"}`,
      "",
      ...maindeck.map((c) => `${c.quantidade} ${c.nome}`),
      ...(sideboard.length > 0 ? ["", "Sideboard:", ...sideboard.map((c) => `${c.quantidade} ${c.nome}`)] : []),
    ].join("\n");
    navigator.clipboard?.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const rankBg = {
    1: "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800]",
    2: "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e]",
    3: "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0]",
  };

  return createPortal(
    <div className="fixed inset-0 z-[300] flex justify-end" role="dialog" aria-modal="true" aria-label="Deck do jogador">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Card image hover preview - centered on page */}
      {hoveredCard?.imagem && (
        <div
          key={hoveredCard.nome}
          className="fixed inset-0 z-[350] flex items-center justify-center pointer-events-none animate-[slide-up_200ms_cubic-bezier(0.34,1.56,0.64,1)]"
          aria-hidden="true"
        >
          <img
            src={hoveredCard.imagem}
            alt={hoveredCard.nome}
            className="w-[min(320px,60vw)] aspect-[63/88] object-cover rounded-[1.1rem] border border-[rgba(199,149,255,0.5)] shadow-[0_24px_64px_rgba(0,0,0,0.85)]"
          />
        </div>
      )}

      {/* Drawer */}
      <div
        className={`relative flex flex-col w-full sm:w-[420px] h-full bg-[rgba(11,6,22,0.98)] border-l border-[rgba(199,149,255,0.18)] shadow-[-20px_0_60px_rgba(0,0,0,0.65)] transition-transform duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-[rgba(217,180,255,0.12)] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {playerRank && (
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[0.68rem] font-extrabold leading-none flex-shrink-0 ${rankBg[playerRank] ?? "bg-[rgba(167,79,255,0.25)] text-[#c4b5fd]"}`}>
                  {playerRank}
                </span>
              )}
              {playerName && (
                <span className="text-[0.78rem] text-[#beafd7] font-medium truncate">{playerName}</span>
              )}
            </div>
            <p className="m-0 text-[1.05rem] font-bold text-[#f5edff] leading-snug truncate">{deckNome || deck?.nome || "Deck"}</p>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
              {deck?.formato && (
                <span className="text-[0.63rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[rgba(167,79,255,0.18)] border border-[rgba(199,149,255,0.35)] text-[#c795ff]">
                  {FORMAT_LABELS[deck.formato] || deck.formato}
                </span>
              )}
              {deck?.linkLigaMagic && (
                <a
                  href={deck.linkLigaMagic}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.72rem] text-[#bfdbfe] underline break-all hover:text-white"
                >
                  LigaMagic
                </a>
              )}
              {colors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 text-[0.68rem] text-[#beafd7]">
                  <span className="inline-block w-3 h-3 rounded-full border border-black/30 shadow-sm flex-shrink-0" style={{ background: COLOR_MAP[c] ?? "#64748b" }} />
                  {COLOR_LABELS[c] || c}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(217,180,255,0.2)] bg-[rgba(255,255,255,0.04)] text-[#beafd7] text-xl leading-none cursor-pointer hover:bg-[rgba(255,255,255,0.09)] hover:text-[#f5edff] transition-all duration-150"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(167,79,255,0.25)_transparent]">
          {loading && (
            <div className="px-5 py-5 flex flex-col gap-3">
              <div className="h-3.5 w-28 rounded-md bg-[rgba(199,149,255,0.1)] animate-pulse" />
              <div className="flex items-end gap-2 h-16 mt-1">
                {[35, 65, 100, 80, 50, 25].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-[rgba(199,149,255,0.12)] animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }} />
                ))}
              </div>
              <div className="h-px bg-[rgba(217,180,255,0.08)] my-2" />
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="h-3 rounded-md bg-[rgba(255,255,255,0.04)] animate-pulse" style={{ width: `${42 + (i % 5) * 12}%`, animationDelay: `${i * 40}ms` }} />
              ))}
            </div>
          )}

          {error && <p className="px-5 py-5 m-0 text-[0.85rem] text-[#f87171]">{error}</p>}

          {!loading && !error && deck && (
            <div className="px-5 py-4 flex flex-col gap-5">
              {/* Mana curve */}
              {manaCurve.some((b) => b.count > 0) && (
                <div>
                  <p className="m-0 mb-3 text-[0.68rem] font-bold uppercase tracking-widest text-[#c795ff]">Curva de Mana</p>
                  <div className="flex items-end gap-1.5 h-[72px]">
                    {manaCurve.map(({ label, count }) => (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1">
                        {count > 0 && (
                          <span className="text-[0.58rem] font-bold text-[#c4b5fd] leading-none">{count}</span>
                        )}
                        <div
                          className="w-full rounded-t-[3px] bg-[linear-gradient(to_top,rgba(127,44,209,0.7),rgba(199,149,255,0.9))] min-h-[3px] transition-all duration-500"
                          style={{ height: count > 0 ? `${Math.max((count / maxCurve) * 48, 4)}px` : "3px", opacity: count > 0 ? 1 : 0.15 }}
                        />
                        <span className="text-[0.6rem] text-[#beafd7] leading-none">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Type badges */}
              {grouped.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {grouped.map(({ type, cards }) => {
                    const total = cards.reduce((s, c) => s + (c.quantidade || 1), 0);
                    return (
                      <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(167,79,255,0.1)] border border-[rgba(199,149,255,0.22)] text-[0.65rem] text-[#beafd7] leading-none">
                        <span className="font-bold text-[#c4b5fd]">{total}</span>
                        {TYPE_LABELS[type]}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Card list grouped by type */}
              <div className="flex flex-col gap-4">
                {grouped.map(({ type, cards }) => {
                  const total = cards.reduce((s, c) => s + (c.quantidade || 1), 0);
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[0.67rem] font-bold uppercase tracking-widest text-[#c795ff]">{TYPE_LABELS[type]}</span>
                        <span className="text-[0.65rem] text-[rgba(190,175,215,0.6)]">{total}</span>
                      </div>
                      <ul className="m-0 p-0 list-none flex flex-col">
                        {cards.map((card) => (
                          <li
                            key={card.nome}
                            className="flex items-center gap-2 px-2 py-[0.28rem] rounded-md hover:bg-[rgba(167,79,255,0.08)] transition-colors duration-100 cursor-default group"
                            onMouseEnter={() => card.imagem ? setHoveredCard(card) : null}
                            onMouseLeave={() => setHoveredCard(null)}
                          >
                            {card.colors?.length > 0 && (
                              <div className="flex gap-[3px] flex-shrink-0">
                                {card.colors.slice(0, 4).map((c) => (
                                  <span key={c} className="inline-block w-2.5 h-2.5 rounded-full border border-black/30" style={{ background: COLOR_MAP[c] ?? "#64748b" }} />
                                ))}
                              </div>
                            )}
                            <span className="flex-1 text-[0.83rem] text-[#e8d5ff] truncate group-hover:text-white transition-colors duration-100">{card.nome}</span>
                            <span className="text-[0.8rem] font-bold text-[#c795ff] flex-shrink-0 tabular-nums">{card.quantidade}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                {/* Sideboard */}
                {sideboard.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5 pt-3 border-t border-[rgba(217,180,255,0.12)]">
                      <span className="text-[0.67rem] font-bold uppercase tracking-widest text-[#c795ff]">Sideboard</span>
                      <span className="text-[0.65rem] text-[rgba(190,175,215,0.6)]">{totalSide}</span>
                    </div>
                    <ul className="m-0 p-0 list-none flex flex-col">
                      {sideboard.map((card) => (
                        <li
                          key={card.nome}
                          className="flex items-center gap-2 px-2 py-[0.28rem] rounded-md hover:bg-[rgba(167,79,255,0.06)] transition-colors duration-100 cursor-default group"
                          onMouseEnter={() => card.imagem ? setHoveredCard(card) : null}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          {card.colors?.length > 0 && (
                            <div className="flex gap-[3px] flex-shrink-0">
                              {card.colors.slice(0, 4).map((c) => (
                                <span key={c} className="inline-block w-2.5 h-2.5 rounded-full border border-black/30" style={{ background: COLOR_MAP[c] ?? "#64748b" }} />
                              ))}
                            </div>
                          )}
                          <span className="flex-1 text-[0.83rem] text-[#beafd7] truncate group-hover:text-[#e8d5ff] transition-colors duration-100">{card.nome}</span>
                          <span className="text-[0.8rem] font-bold text-[rgba(199,149,255,0.55)] flex-shrink-0 tabular-nums">{card.quantidade}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && deck && (
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[rgba(217,180,255,0.12)] flex-shrink-0 bg-[rgba(0,0,0,0.25)]">
            <span className="text-[0.72rem] text-[#beafd7]">
              {totalMain} main{totalSide > 0 ? ` · ${totalSide} side` : ""}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-full text-[0.75rem] font-semibold font-['inherit'] cursor-pointer transition-all duration-150 ${
                copied
                  ? "bg-[rgba(34,197,94,0.15)] border-[rgba(34,197,94,0.4)] text-[#86efac]"
                  : "border-[rgba(199,149,255,0.4)] bg-[rgba(167,79,255,0.12)] text-[#c4b5fd] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(199,149,255,0.55)]"
              }`}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  Copiar lista
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
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
          linkLigaMagic: deck.linkLigaMagic,
          maindeck: (deck.maindeck || []).map((c) => ({ nome: c.nome, quantidade: c.quantidade })),
          sideboard: (deck.sideboard || []).map((c) => ({ nome: c.nome, quantidade: c.quantidade })),
          commander: Array.isArray(deck.commander)
            ? deck.commander.map((c) => ({ nome: c.nome, quantidade: c.quantidade }))
            : deck.commander
              ? [{ nome: deck.commander.nome, quantidade: deck.commander.quantidade }]
              : [],
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
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

export function DeckViewButton({ player, token, isOwner, deckNameOverride, onDeckNameUpdate, playerName, playerRank }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const deckId = player?.deckId || player?.deck?.id;
  const deckNome = deckNameOverride || player?.nomeConsolidado || player?.deckNome || player?.deck?.nome;

  if (!deckId) return <span className="text-[#beafd7]">—</span>;

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <Tooltip content={deckNome || "Ver deck"} focusable={false}>
      <button
        type="button"
        className="inline-flex items-center gap-[0.3rem] px-[0.6rem] py-[0.22rem] border border-[rgba(199,149,255,0.4)] rounded-full bg-[rgba(167,79,255,0.12)] text-[#c4b5fd] text-[0.74rem] font-semibold font-['inherit'] cursor-pointer max-w-[180px] min-w-0 transition-[background,border-color] duration-[180ms] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(199,149,255,0.6)]"
        onClick={() => { setOpen(true); setEditing(false); }}
        aria-label={deckNome || "Ver deck"}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.7 }}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{deckNome || "Ver deck"}</span>
      </button>
      </Tooltip>

      {isOwner && (
        <Tooltip content="Editar nome consolidado" focusable={false}>
        <button
          type="button"
          className="inline-flex items-center justify-center px-[0.35rem] py-[0.2rem] border border-[rgba(199,149,255,0.3)] rounded-[6px] bg-transparent text-[#beafd7] text-[0.72rem] cursor-pointer transition-[background,color,border-color] duration-150 flex-shrink-0 hover:bg-[rgba(167,79,255,0.15)] hover:text-[#c4b5fd] hover:border-[rgba(199,149,255,0.5)]"
          onClick={(e) => { e.stopPropagation(); setOpen(false); setEditing((v) => !v); }}
          aria-label="Editar nome consolidado"
        >
          ✏
        </button>
        </Tooltip>
      )}

      {open && (
        <DeckDrawer
          deckId={deckId}
          deckNome={deckNome}
          playerName={playerName}
          playerRank={playerRank}
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
          onSave={(newName) => { onDeckNameUpdate(deckId, newName); setEditing(false); }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
