import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildVisualCanvas,
  fetchCardImg,
  loadCardImagesForDeck,
  mapWithConcurrency,
  toCanvasImageUrl,
} from "../components/deck/deckImageCanvas";

describe("deckImageCanvas image loading", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "Image",
      class MockImage {
        constructor() {
          this.crossOrigin = null;
          this.onload = null;
          this.onerror = null;
          this._src = "";
        }

        set src(value) {
          this._src = value;
          queueMicrotask(() => {
            if (String(value).includes("fail")) {
              this.onerror?.();
            } else {
              this.onload?.();
            }
          });
        }

        get src() {
          return this._src;
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("converte URL large para normal no canvas", () => {
    expect(
      toCanvasImageUrl("https://cards.scryfall.io/large/front/a/b/abcd.jpg"),
    ).toBe("https://cards.scryfall.io/normal/front/a/b/abcd.jpg");
  });

  it("prioriza URL conhecida e evita chamar a API named", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const img = await fetchCardImg(
      "Lightning Bolt",
      "https://cards.scryfall.io/large/front/1/2/bolt.jpg",
    );

    expect(img).toBeTruthy();
    expect(img.src).toContain("/normal/front/1/2/bolt.jpg");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("carrega varias cartas em paralelo preservando a ordem", async () => {
    const order = [];
    const results = await mapWithConcurrency(
      ["a", "b", "c", "d"],
      2,
      async (item) => {
        order.push(`start:${item}`);
        await new Promise((r) => setTimeout(r, item === "a" ? 30 : 5));
        order.push(`end:${item}`);
        return item.toUpperCase();
      },
    );

    expect(results).toEqual(["A", "B", "C", "D"]);
    expect(order.indexOf("start:b")).toBeLessThan(order.indexOf("end:a"));
  });

  it("loadCardImagesForDeck usa URLs e reporta progresso", async () => {
    const progress = [];
    const images = await loadCardImagesForDeck(
      [
        { nome: "Bolt", imagem: "https://cards.scryfall.io/large/front/1/2/bolt.jpg" },
        { nome: "Brainstorm", imagem: "https://cards.scryfall.io/large/front/3/4/bs.jpg" },
      ],
      {
        concurrency: 2,
        onProgress: (done, total) => progress.push([done, total]),
      },
    );

    expect(images).toHaveLength(2);
    expect(images.every(Boolean)).toBe(true);
    expect(progress.at(-1)).toEqual([2, 2]);
  });
});

describe("deckImageCanvas sideboard", () => {
  afterEach(() => vi.restoreAllMocks());
  it.each(["16x9", "9x16"])("desenha todas as cópias sem o selo de quantidade em %s", (ratio) => {
    const gradient = { addColorStop: vi.fn() };
    const ctx = new Proxy({
      measureText: vi.fn(() => ({ width: 40 })),
      createLinearGradient: vi.fn(() => gradient),
      createRadialGradient: vi.fn(() => gradient),
    }, { get(target, key) { return target[key] ?? (target[key] = vi.fn()); } });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    const img = { width: 488, height: 680 };
    buildVisualCanvas({ nome: "Deck", formato: "pauper", maindeck: [], sideboard: [{ nome: "Negate", quantidade: 4 }] }, { Negate: { img } }, "Jogador", ratio);
    expect(ctx.drawImage.mock.calls.filter(([image]) => image === img)).toHaveLength(4);
    expect(ctx.fillText.mock.calls.some(([text]) => /[×x]\s*4|4\s*[×x]/.test(String(text)))).toBe(false);
  });
});
