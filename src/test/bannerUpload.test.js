import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
    calcularDimensoesOg,
    validateBannerImageFile,
    otimizarBannerParaUpload,
    OG_BANNER_MAX_WIDTH,
    OG_BANNER_MAX_HEIGHT,
    OG_BANNER_TARGET_BYTES,
} from "../utils/bannerUpload";

describe("calcularDimensoesOg", () => {
    it("não amplia imagens menores que o limite", () => {
        expect(calcularDimensoesOg(800, 400)).toEqual({ width: 800, height: 400 });
    });

    it("reduz mantendo proporção para caber em 1200x630", () => {
        const { width, height } = calcularDimensoesOg(1776, 886);
        expect(width).toBeLessThanOrEqual(OG_BANNER_MAX_WIDTH);
        expect(height).toBeLessThanOrEqual(OG_BANNER_MAX_HEIGHT);
        expect(width / height).toBeCloseTo(1776 / 886, 2);
    });
});

describe("validateBannerImageFile", () => {
    it("aceita jpeg/png", () => {
        const file = new File([new Uint8Array(10)], "b.png", { type: "image/png" });
        expect(validateBannerImageFile(file)).toBeNull();
    });

    it("rejeita tipo inválido", () => {
        const file = new File([new Uint8Array(10)], "b.pdf", { type: "application/pdf" });
        expect(validateBannerImageFile(file)?.code).toBe("invalid-file-type");
    });
});

describe("otimizarBannerParaUpload", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "Image",
            class {
                onload = null;
                onerror = null;
                naturalWidth = 1776;
                naturalHeight = 886;
                width = 1776;
                height = 886;
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
                fillStyle: "",
                fillRect: vi.fn(),
                drawImage: vi.fn(),
            }),
            toBlob: (cb, _type, quality) => {
                // Simula compressão: qualidade menor → blob menor
                const size = Math.round(OG_BANNER_TARGET_BYTES * (0.5 + quality));
                cb(new Blob([new Uint8Array(size)], { type: "image/jpeg" }));
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

    it("converte PNG grande em JPEG otimizado", async () => {
        const png = new File([new Uint8Array(2_000_000)], "banner.png", { type: "image/png" });
        const out = await otimizarBannerParaUpload(png);

        expect(out.type).toBe("image/jpeg");
        expect(out.name).toMatch(/\.jpg$/);
        expect(out.size).toBeLessThanOrEqual(OG_BANNER_TARGET_BYTES * 1.4);
    });

    it("não reprocessa JPEG já pequeno", async () => {
        const jpg = new File([new Uint8Array(50_000)], "banner.jpg", { type: "image/jpeg" });
        const out = await otimizarBannerParaUpload(jpg);
        expect(out).toBe(jpg);
    });
});
