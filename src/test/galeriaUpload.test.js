import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("../services/backendApi", () => ({
  obterPresignedUrl: vi.fn(),
  uploadParaS3: vi.fn(),
  cadastrarFotoGaleria: vi.fn(),
}));

import {
  validateGaleriaImageFile,
  otimizarFotoGaleriaParaWebp,
  uploadFotosGaleriaEmLote,
  GALERIA_TARGET_BYTES,
} from "../utils/galeriaUpload";
import { cadastrarFotoGaleria, obterPresignedUrl, uploadParaS3 } from "../services/backendApi";

describe("validateGaleriaImageFile", () => {
  it("rejeita tipo inválido", () => {
    const erro = validateGaleriaImageFile(new File(["x"], "a.pdf", { type: "application/pdf" }));
    expect(erro?.code).toBe("invalid-file-type");
  });

  it("aceita jpeg", () => {
    expect(validateGaleriaImageFile(new File(["x"], "a.jpg", { type: "image/jpeg" }))).toBeNull();
  });
});

describe("otimizarFotoGaleriaParaWebp", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "Image",
      class {
        onload = null;
        onerror = null;
        naturalWidth = 3200;
        naturalHeight = 2400;
        width = 3200;
        height = 2400;
        set src(_v) {
          queueMicrotask(() => this.onload?.());
        }
      },
    );

    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();

    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: vi.fn(),
      }),
      toBlob: (cb, _type, quality) => {
        const size = Math.round(GALERIA_TARGET_BYTES * (0.4 + quality * 0.5));
        cb(new Blob([new Uint8Array(size)], { type: "image/webp" }));
      },
    };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag, options) => {
      if (tag === "canvas") return canvas;
      return originalCreateElement(tag, options);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("converte PNG para WebP otimizado", async () => {
    const png = new File([new Uint8Array(2_000_000)], "foto.png", { type: "image/png" });
    const out = await otimizarFotoGaleriaParaWebp(png);

    expect(out.type).toBe("image/webp");
    expect(out.name).toMatch(/\.webp$/);
    expect(out.size).toBeLessThanOrEqual(GALERIA_TARGET_BYTES * 1.2);
  });
});

describe("uploadFotosGaleriaEmLote", () => {
  beforeEach(() => {
    vi.mocked(obterPresignedUrl).mockResolvedValue({
      uploadUrl: "https://s3.example/upload",
      urlPublica: "https://s3.example/foto.webp",
    });
    vi.mocked(uploadParaS3).mockResolvedValue(undefined);
    vi.mocked(cadastrarFotoGaleria).mockResolvedValue({ id: "1" });

    vi.stubGlobal(
      "Image",
      class {
        onload = null;
        naturalWidth = 100;
        naturalHeight = 100;
        width = 100;
        height = 100;
        set src(_v) {
          queueMicrotask(() => this.onload?.());
        }
      },
    );
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: vi.fn() }),
      toBlob: (cb) => cb(new Blob([new Uint8Array(10)], { type: "image/webp" })),
    };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag, options) => {
      if (tag === "canvas") return canvas;
      return originalCreateElement(tag, options);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("envia várias fotos em paralelo e reporta progresso", async () => {
    const arquivos = [
      new File([new Uint8Array(20)], "a.jpg", { type: "image/jpeg" }),
      new File([new Uint8Array(20)], "b.jpg", { type: "image/jpeg" }),
      new File([new Uint8Array(20)], "c.jpg", { type: "image/jpeg" }),
    ];
    const progressos = [];
    const resultado = await uploadFotosGaleriaEmLote(arquivos, "token", {
      concurrency: 3,
      onProgress: (done, total) => progressos.push([done, total]),
    });

    expect(resultado.enviadas).toBe(3);
    expect(resultado.falhas).toHaveLength(0);
    expect(cadastrarFotoGaleria).toHaveBeenCalledTimes(3);
    expect(progressos.at(-1)).toEqual([3, 3]);
  });
});
