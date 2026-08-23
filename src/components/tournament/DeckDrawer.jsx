/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { buscarDeck, atualizarDeck } from "../../services/backendApi";
import { buscarCartasPorNome } from "../../services/scryfallApi";
import { Tooltip } from "../ui/Tooltip";
import { InlineAlert } from "../ui/InlineAlert";
import { DeckGroupedList, DeckTypeBadges } from "../deck/DeckGroupedList";
import { DeckImageModal } from "../deck/DeckImageModal";
import { groupCardsByType, MANA_COLOR_MAP, MANA_COLOR_LABELS } from "../../utils/deckTypeGroups";

export const RANK_BADGE = {
  1: "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800] shadow-[0_0_8px_rgba(255,215,0,0.45)]",
  2: "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e] shadow-[0_0_6px_rgba(200,200,200,0.3)]",
  3: "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0] shadow-[0_0_6px_rgba(205,127,50,0.35)]",
};

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
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

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
    if (!deckId) return;

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

  const grouped = useMemo(() => groupCardsByType(maindeck), [maindeck]);

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
            className="w-[min(320px,60vw)] aspect-[63/88] object-cover rounded-xl border border-[rgba(199,149,255,0.5)] shadow-[0_24px_64px_rgba(0,0,0,0.85)]"
          />
        </div>
      )}

      {/* Drawer */}
      <div
        className={`relative flex flex-col w-full sm:w-[420px] h-full bg-[rgba(11,6,22,0.98)] border-l border-[rgba(199,149,255,0.18)] shadow-[-20px_0_60px_rgba(0,0,0,0.65)] transition-transform duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-line-soft flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {playerRank && (
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[0.68rem] font-extrabold leading-none flex-shrink-0 ${rankBg[playerRank] ?? "bg-[rgba(167,79,255,0.25)] text-[#c4b5fd]"}`}>
                  {playerRank}
                </span>
              )}
              {playerName && (
                <span className="text-[0.78rem] text-text-soft font-medium truncate">{playerName}</span>
              )}
            </div>
            <p className="m-0 text-[1.05rem] font-bold text-text-main leading-snug truncate">{deckNome || deck?.nome || "Deck"}</p>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
              {loading && (
                <>
                  <span className="h-5 w-16 rounded-md bg-[rgba(199,149,255,0.12)] animate-pulse" />
                  <span className="h-3 w-3 rounded-full bg-[rgba(199,149,255,0.12)] animate-pulse" />
                  <span className="h-3 w-14 rounded bg-[rgba(199,149,255,0.08)] animate-pulse" />
                </>
              )}
              {deck?.formato && (
                <span className="text-[0.63rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[rgba(167,79,255,0.18)] border border-[rgba(199,149,255,0.35)] text-brand">
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
                <span key={c} className="inline-flex items-center gap-1 text-[0.68rem] text-text-soft">
                  <span className="inline-block w-3 h-3 rounded-full border border-black/30 shadow-sm flex-shrink-0" style={{ background: MANA_COLOR_MAP[c] ?? "#64748b" }} />
                  {MANA_COLOR_LABELS[c] || c}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-line bg-[rgba(255,255,255,0.04)] text-text-soft text-xl leading-none cursor-pointer hover:bg-[rgba(255,255,255,0.09)] hover:text-text-main transition-all duration-150"
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

          {error ? <InlineAlert type="error" className="m-5">{error}</InlineAlert> : null}

          {!loading && !error && deck && (
            <div className="px-5 py-4 flex flex-col gap-5">
              {/* Mana curve */}
              {manaCurve.some((b) => b.count > 0) && (
                <div>
                  <p className="m-0 mb-3 text-[0.68rem] font-bold uppercase tracking-widest text-brand">Curva de Mana</p>
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
                        <span className="text-[0.6rem] text-text-soft leading-none">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Type badges */}
              <DeckTypeBadges grouped={grouped} />

              <DeckGroupedList
                maindeck={maindeck}
                sideboard={sideboard}
                onCardMouseEnter={(card) => card.imagem ? setHoveredCard(card) : null}
                onCardMouseLeave={() => setHoveredCard(null)}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && deck && (
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 border-t border-line-soft flex-shrink-0 bg-[rgba(0,0,0,0.25)]">
            <span className="min-w-0 text-[0.72rem] text-text-soft">
              {totalMain} main{totalSide > 0 ? ` · ${totalSide} side` : ""}
            </span>
            <div className="flex items-center justify-end gap-2">
            <Tooltip content="Gerar imagem do deck" placement="top" focusable={false}>
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(255,215,0,0.35)] bg-[rgba(255,215,0,0.08)] text-[#fcd34d] transition-colors hover:bg-[rgba(255,215,0,0.16)]"
              aria-label="Gerar imagem do deck"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            </button>
            </Tooltip>
            <button
              type="button"
              onClick={() => navigate(`/editar-deck/${deckId}?modo=visualizar`)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[rgba(199,149,255,0.48)] bg-[rgba(167,79,255,0.16)] px-3 text-[0.75rem] font-semibold text-[#ddd0ff] transition-colors hover:bg-[rgba(167,79,255,0.28)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>
              Ver lista
            </button>
            <Tooltip content={copied ? "Lista copiada" : "Copiar lista"} placement="top" focusable={false}>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                copied
                  ? "bg-[rgba(34,197,94,0.15)] border-[rgba(34,197,94,0.4)] text-[#86efac]"
                  : "border-[rgba(199,149,255,0.4)] bg-[rgba(167,79,255,0.12)] text-[#c4b5fd] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(199,149,255,0.55)]"
              }`}
              aria-label={copied ? "Lista copiada" : "Copiar lista"}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                </>
              )}
            </button>
            </Tooltip>
            </div>
          </div>
        )}
      </div>
      {showImageModal && deck && (
        <DeckImageModal
          deck={{ ...deck, nome: deckNome || deck.nome }}
          ownerName={playerName || deck.usuario?.nome || ""}
          onClose={() => setShowImageModal(false)}
        />
      )}
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
      // Cópia travada do torneio: back aceita nomeConsolidado / cartaRepresentativa (sem GET prévio).
      await atualizarDeck(deckId, { nomeConsolidado: name.trim() }, token);
      onSave(name.trim());
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-[calc(100%+0.4rem)] right-0 z-[60] w-[260px] border border-[rgba(199,149,255,0.35)] rounded-lg bg-[rgba(14,9,28,0.98)] [backdrop-filter:blur(14px)] shadow-[0_16px_40px_rgba(0,0,0,0.55)] p-[0.85rem] flex flex-col gap-[0.55rem]" ref={ref}>
      <p className="text-[0.75rem] font-bold text-text-soft uppercase tracking-[0.06em] m-0">Nome consolidado</p>
      <input
        ref={inputRef}
        className="w-full box-border px-[0.65rem] py-[0.45rem] border border-[rgba(199,149,255,0.35)] rounded-lg bg-[rgba(167,79,255,0.08)] text-text-main text-[0.85rem] font-['inherit'] outline-none transition-[border-color] duration-150 focus:border-[rgba(199,149,255,0.65)]"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onClose();
        }}
        maxLength={60}
        placeholder="Nome do deck"
      />
      {error ? <InlineAlert type="error" className="py-2 text-[0.73rem]">{error}</InlineAlert> : null}
      <div className="flex gap-[0.45rem] justify-end">
        <button className="px-[0.7rem] py-[0.3rem] border border-[rgba(199,149,255,0.25)] rounded-md bg-transparent text-text-soft text-[0.78rem] font-['inherit'] cursor-pointer transition-[background] duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(255,255,255,0.06)]" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          className="px-[0.85rem] py-[0.3rem] border border-[rgba(167,79,255,0.5)] rounded-md bg-[rgba(167,79,255,0.2)] text-[#c4b5fd] text-[0.78rem] font-bold font-['inherit'] cursor-pointer transition-[background,border-color] duration-150 disabled:opacity-[0.45] disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(167,79,255,0.32)] hover:not-disabled:border-[rgba(167,79,255,0.7)]"
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

  if (!deckId) return <span className="text-text-soft">—</span>;

  return (
    <div className="relative flex w-full min-w-0 items-center justify-between gap-1.5">
      <Tooltip content={deckNome || "Ver deck"} focusable={false} className="min-w-0 flex-1 !cursor-pointer">
      <button
        type="button"
        className="inline-flex w-full min-w-0 items-center gap-[0.3rem] px-[0.6rem] py-[0.22rem] border border-[rgba(199,149,255,0.4)] rounded-full bg-[rgba(167,79,255,0.12)] text-[#c4b5fd] text-[0.74rem] font-semibold font-['inherit'] cursor-pointer transition-[background,border-color] duration-[180ms] hover:bg-[rgba(167,79,255,0.22)] hover:border-[rgba(199,149,255,0.6)]"
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
          className="inline-flex items-center justify-center px-[0.35rem] py-[0.2rem] border border-[rgba(199,149,255,0.3)] rounded-md bg-transparent text-text-soft text-[0.72rem] cursor-pointer transition-[background,color,border-color] duration-150 flex-shrink-0 hover:bg-[rgba(167,79,255,0.15)] hover:text-[#c4b5fd] hover:border-line-strong"
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
