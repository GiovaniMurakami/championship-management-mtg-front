import { buscarCartasPorNome } from "../../services/scryfallApi";
import { loadCardImagesForDeck, loadImageFromUrl } from "./deckImageCanvas";

const BRAND_FOOTER_URL = "/images/top8/rodape.png.png";

/**
 * Resolve metadados e imagens das cartas para o canvas do deck (16:9 / 9:16).
 * Retorna null se a operação for cancelada no meio.
 */
export async function carregarArteDoDeck(deck, { isCancelled = () => false, onProgress } = {}) {
  const report = (stage, progress) => onProgress?.({ stage, progress });
  const allCards = [...(deck?.maindeck || []), ...(deck?.sideboard || [])];
  const unique = [...new Map(allCards.map((c) => [c.nome, c])).values()];
  const map = {};

  report("meta", 5);

  const logoPromise = loadImageFromUrl(BRAND_FOOTER_URL, { crossOrigin: null, retries: 0 }).catch(() => null);
  const resolved = await buscarCartasPorNome(unique.map((c) => c.nome));
  if (isCancelled()) return null;

  unique.forEach((card, index) => {
    const data = resolved[index];
    map[card.nome] = {
      cmc: data?.cmc ?? 0,
      typeLine: data?.typeLine || "",
      imagem: data?.imagem || "",
      img: null,
    };
  });

  report("imgs", 40);

  const images = await loadCardImagesForDeck(
    unique.map((card) => ({
      nome: card.nome,
      imagem: map[card.nome]?.imagem || "",
    })),
    {
      concurrency: 6,
      isCancelled,
      onProgress: (done, total) => {
        report("imgs", 40 + Math.round((done / Math.max(total, 1)) * 55));
      },
    },
  );

  if (isCancelled()) return null;

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
        isCancelled,
      },
    );
    if (isCancelled()) return null;
    failedIndexes.forEach(({ card }, retryIndex) => {
      if (retryImages[retryIndex] && map[card.nome]) {
        map[card.nome].img = retryImages[retryIndex];
      }
    });
  }

  const brandImage = await logoPromise;
  if (isCancelled()) return null;

  report("done", 100);
  return { cardDataMap: map, brandImage };
}
