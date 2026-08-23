import { useEffect, useMemo, useState } from "react";
import { buscarCartasPorNome } from "../../services/scryfallApi";
import { loadCardImagesForDeck, buildVisualCanvas } from "./deckImageCanvas";
import { Tooltip } from "../ui/Tooltip";

export function DeckImageModal({ deck, ownerName, onClose }) {
  const [cardDataMap, setCardDataMap] = useState({});
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("meta"); // "meta" | "imgs" | "done"
  const [ratio, setRatio] = useState("16x9"); // "16x9" | "9x16"

  const previewUrl = useMemo(() => {
    if (stage !== "done") return null;
    const canvas = buildVisualCanvas(deck, cardDataMap, ownerName, ratio);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, [stage, ratio, deck, cardDataMap, ownerName]);

  useEffect(() => {
    let cancelled = false;
    const allCards = [...(deck.maindeck || []), ...(deck.sideboard || [])];
    const unique = [...new Map(allCards.map((c) => [c.nome, c])).values()];
    const map = {};

    async function run() {
      setStage("meta");
      setProgress(5);

      const resolved = await buscarCartasPorNome(unique.map((c) => c.nome));
      if (cancelled) return;

      unique.forEach((card, index) => {
        const data = resolved[index];
        map[card.nome] = {
          cmc: data?.cmc ?? 0,
          typeLine: data?.typeLine || "",
          imagem: data?.imagem || "",
          img: null,
        };
      });

      setCardDataMap({ ...map });
      setProgress(40);
      setStage("imgs");

      const images = await loadCardImagesForDeck(
        unique.map((card) => ({
          nome: card.nome,
          imagem: map[card.nome]?.imagem || "",
        })),
        {
          concurrency: 6,
          isCancelled: () => cancelled,
          onProgress: (done, total) => {
            if (cancelled) return;
            setProgress(40 + Math.round((done / Math.max(total, 1)) * 55));
          },
        },
      );

      if (cancelled) return;

      unique.forEach((card, index) => {
        if (map[card.nome]) map[card.nome].img = images[index] || null;
      });

      const failedIndexes = unique
        .map((card, index) => ({ card, index }))
        .filter(({ index }) => !images[index]);

      if (failedIndexes.length > 0) {
        const retryImages = await loadCardImagesForDeck(
          failedIndexes.map(({ card }) => ({
            nome: card.nome,
            imagem: "",
          })),
          {
            concurrency: 2,
            isCancelled: () => cancelled,
          },
        );
        if (cancelled) return;
        failedIndexes.forEach(({ card }, retryIndex) => {
          if (retryImages[retryIndex] && map[card.nome]) {
            map[card.nome].img = retryImages[retryIndex];
          }
        });
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

  const canDownload = stage === "done";
  const loadingDone = stage === "done";

  const handleDownload = () => {
    const canvas = buildVisualCanvas(deck, cardDataMap, ownerName, ratio);
    const safeName = (deck.nome || "deck")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").toLowerCase();
    const a = document.createElement("a");
    a.download = `${safeName}-${ratio}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-[rgba(5,2,14,0.92)] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-[0.75rem] w-full max-w-[min(98vw,1500px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.95rem] font-bold text-[#c4b5fd] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
            {deck.nome}
          </span>

          <div className="flex items-center gap-[2px] bg-[rgba(255,255,255,0.04)] border border-line-soft rounded-lg p-[3px] flex-shrink-0">
            {[
              { key: "16x9", label: "16:9" },
              { key: "9x16", label: "9:16" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRatio(key)}
                className={`px-[0.65rem] py-[0.3rem] rounded-md text-[0.75rem] font-semibold transition-all duration-150 ${
                  ratio === key
                    ? "bg-[rgba(79,70,229,0.4)] text-white border border-[rgba(99,102,241,0.5)]"
                    : "text-[#888] hover:text-[#c0bfff] border border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {canDownload && (
              <Tooltip content={`Salvar imagem do deck como PNG (visual ${ratio})`} focusable={false}>
                <button
                  className="inline-flex items-center gap-[0.3rem] px-[0.9rem] py-[0.38rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.78rem] font-bold cursor-pointer transition-[background,border-color] duration-150 hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)]"
                  onClick={handleDownload}
                >
                  ↓ Salvar imagem
                </button>
              </Tooltip>
            )}
            <button
              className="w-8 h-8 flex items-center justify-center border border-[rgba(199,149,255,0.25)] rounded-full bg-transparent text-text-soft text-[1.2rem] cursor-pointer transition-[background,color] duration-150 flex-shrink-0 hover:bg-[rgba(255,255,255,0.08)] hover:text-text-main"
              onClick={onClose}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>

        {!loadingDone && (
          <div className="flex flex-col items-center gap-3 py-3">
            <div className="w-full max-w-[440px] h-[5px] rounded-full bg-[rgba(167,79,255,0.15)] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
              />
            </div>
            <p className="text-[0.8rem] text-text-soft m-0">
              {stage === "meta"
                ? `Buscando dados das cartas… ${progress}%`
                : `Carregando imagens… ${progress}%`}
            </p>
          </div>
        )}

        <div
          className="rounded-lg border border-[rgba(199,149,255,0.2)] overflow-hidden"
          style={{ background: "#09050f", minHeight: "40vh" }}
        >
          {previewUrl ? (
            <div className="flex items-center justify-center p-2">
              <img src={previewUrl} alt="Preview" className="max-h-[82vh] max-w-full block" style={{ width: "auto", height: "auto" }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4 min-h-[40vh]">
              {!loadingDone ? (
                <>
                  <div className="w-[200px] h-[5px] rounded-full bg-[rgba(167,79,255,0.15)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-200"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                    />
                  </div>
                  <p className="text-[0.8rem] text-text-soft m-0">
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
