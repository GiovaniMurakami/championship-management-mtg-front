import { useEffect, useState } from "react";
import { buscarCartaPorNome } from "../../services/scryfallApi";
import { fetchCardImg, buildListCanvas, buildVisualCanvas } from "./deckImageCanvas";
import { Tooltip } from "../ui/Tooltip";

export function DeckImageModal({ deck, ownerName, onClose }) {
  const [cardDataMap, setCardDataMap] = useState({});
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("meta"); // "meta" | "imgs" | "done"
  const [layout, setLayout] = useState("lista"); // "lista" | "visual"
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ratio, setRatio] = useState("16x9"); // "16x9" | "9x16" — visual mode only

  // build canvas preview whenever stage, layout or ratio changes
  useEffect(() => {
    const build = async () => {
      const listReady = stage === "imgs" || stage === "done";
      const visualReady = stage === "done";
      const canBuild = layout === "lista" ? listReady : visualReady;
      if (!canBuild) { setPreviewUrl(null); return; }
      const canvas = layout === "lista"
        ? buildListCanvas(deck, cardDataMap, ownerName)
        : buildVisualCanvas(deck, cardDataMap, ownerName, ratio);
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.92));
    };
    build();
  }, [stage, layout, ratio, deck, cardDataMap, ownerName]);

  // load card metadata + images
  useEffect(() => {
    let cancelled = false;
    const allCards = [...(deck.maindeck || []), ...(deck.sideboard || [])];
    const unique = [...new Map(allCards.map(c => [c.nome, c])).values()];
    const map = {};

    async function run() {
      // Stage 1: metadata (cmc, typeLine) — enables list export
      setStage("meta");
      for (let i = 0; i < unique.length; i++) {
        if (cancelled) return;
        setProgress(Math.round(((i + 1) / unique.length) * 45));
        try {
          const data = await buscarCartaPorNome(unique[i].nome);
          map[unique[i].nome] = { cmc: data?.cmc ?? 0, typeLine: data?.typeLine || "", imagem: data?.imagem || "", img: null };
        } catch {
          map[unique[i].nome] = { cmc: 0, typeLine: "", imagem: "", img: null };
        }
        await new Promise(r => setTimeout(r, 55));
      }
      // metadata complete → list mode can download now
      if (!cancelled) setCardDataMap({ ...map });

      // Stage 2: blob images for visual canvas
      setStage("imgs");
      for (let i = 0; i < unique.length; i++) {
        if (cancelled) return;
        setProgress(45 + Math.round(((i + 1) / unique.length) * 50));
        const img = await fetchCardImg(unique[i].nome);
        if (map[unique[i].nome]) map[unique[i].nome].img = img;
        await new Promise(r => setTimeout(r, 55));
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

  // list export available as soon as metadata is done; visual needs images
  const canDownload = layout === "lista"
    ? (stage === "imgs" || stage === "done")
    : stage === "done";

  const handleDownload = () => {
    const canvas = layout === "lista"
      ? buildListCanvas(deck, cardDataMap, ownerName)
      : buildVisualCanvas(deck, cardDataMap, ownerName, ratio);
    const safeName = (deck.nome || "deck")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase();
    const a = document.createElement("a");
    a.download = `${safeName}-${layout}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const loadingDone = stage === "done";

  return (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(5,2,14,0.92)] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-[0.75rem] w-full max-w-[min(98vw,1500px)]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── top bar ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.95rem] font-bold text-[#c4b5fd] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
            {deck.nome}
          </span>

          {/* layout toggle */}
          <div className="flex items-center gap-[2px] bg-[rgba(255,255,255,0.04)] border border-[rgba(217,180,255,0.15)] rounded-lg p-[3px] flex-shrink-0">
            {[
              { key: "lista", label: "Lista", hint: "portrait · exporta mais rápido" },
              { key: "visual", label: "Visual", hint: "landscape · requer imagens" },
            ].map(({ key, label, hint }) => (
              <Tooltip
                key={key}
                content={hint}
                focusable={false}
              >
              <button
                type="button"
                onClick={() => setLayout(key)}
                className={`px-[0.75rem] py-[0.3rem] rounded-[0.4rem] text-[0.78rem] font-semibold transition-all duration-150 ${
                  layout === key
                    ? "bg-[rgba(79,70,229,0.4)] text-white border border-[rgba(99,102,241,0.5)]"
                    : "text-[#888] hover:text-[#c0bfff] border border-transparent"
                }`}
              >
                {label}
              </button>
              </Tooltip>
            ))}
          </div>

          {/* ratio toggle — visual mode only */}
          {layout === "visual" && (
            <div className="flex items-center gap-[2px] bg-[rgba(255,255,255,0.04)] border border-[rgba(217,180,255,0.15)] rounded-lg p-[3px] flex-shrink-0">
              {[
                { key: "16x9", label: "16:9" },
                { key: "9x16", label: "9:16" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRatio(key)}
                  className={`px-[0.65rem] py-[0.3rem] rounded-[0.4rem] text-[0.75rem] font-semibold transition-all duration-150 ${
                    ratio === key
                      ? "bg-[rgba(79,70,229,0.4)] text-white border border-[rgba(99,102,241,0.5)]"
                      : "text-[#888] hover:text-[#c0bfff] border border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* download button */}
            {canDownload && (
              <Tooltip content={`Salvar imagem do deck como PNG (${layout === "lista" ? "lista de cartas" : `visual ${ratio}`})`} focusable={false}>
              <button
                className="inline-flex items-center gap-[0.3rem] px-[0.9rem] py-[0.38rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.78rem] font-bold cursor-pointer transition-[background,border-color] duration-150 hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)]"
                onClick={handleDownload}
              >
                ↓ Salvar imagem
              </button>
              </Tooltip>
            )}
            {/* early-available indicator for list when images are still loading */}
            {layout === "lista" && stage === "imgs" && (
              <span className="text-[0.72rem] text-[#22c55e] font-medium">
                pronto para exportar
              </span>
            )}
            <button
              className="w-8 h-8 flex items-center justify-center border border-[rgba(199,149,255,0.25)] rounded-full bg-transparent text-[#beafd7] text-[1.2rem] cursor-pointer transition-[background,color] duration-150 flex-shrink-0 hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f5edff]"
              onClick={onClose}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── loading bar (shown until fully done, but download unlocks per mode) ── */}
        {!loadingDone && (
          <div className="flex flex-col items-center gap-3 py-3">
            <div className="w-full max-w-[440px] h-[5px] rounded-full bg-[rgba(167,79,255,0.15)] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
              />
            </div>
            <p className="text-[0.8rem] text-[#beafd7] m-0">
              {stage === "meta"
                ? `Buscando dados das cartas… ${progress}%`
                : `Carregando imagens para o modo Visual… ${progress}%`}
            </p>
          </div>
        )}

        {/* ── preview panel ── */}
        <div
          className="rounded-[0.85rem] border border-[rgba(199,149,255,0.2)] overflow-hidden"
          style={{ background: "#09050f", minHeight: "40vh" }}
        >
          {previewUrl ? (
            <div className="flex items-center justify-center p-2">
              <img src={previewUrl} alt="Preview" className="max-h-[82vh] max-w-full block" style={{ width: "auto", height: "auto" }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4 min-h-[40vh]">
              {!loadingDone && layout === "visual" ? (
                <>
                  <div className="w-[200px] h-[5px] rounded-full bg-[rgba(167,79,255,0.15)] overflow-hidden">
                    <div className="h-full rounded-full transition-[width] duration-200"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }} />
                  </div>
                  <p className="text-[0.8rem] text-[#beafd7] m-0">
                    {stage === "meta" ? `Buscando dados… ${progress}%` : `Carregando imagens… ${progress}%`}
                  </p>
                </>
              ) : (
                <p className="text-[0.82rem] text-[#6b4a9e] m-0">Preparando preview…</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
