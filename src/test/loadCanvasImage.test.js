import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { blobParecePaginaWeb, buildS3ImageProxyUrl, isS3HttpUrl } from "../utils/loadCanvasImage";

describe("blobParecePaginaWeb", () => {
  it("rejeita HTML devolvido por rewrite SPA", () => {
    expect(blobParecePaginaWeb(new Blob(["<html></html>"], { type: "text/html" }))).toBe(true);
  });

  it("nao rejeita jpeg, octet-stream nem tipo vazio", () => {
    expect(blobParecePaginaWeb(new Blob([new Uint8Array([0xff, 0xd8])], { type: "image/jpeg" }))).toBe(false);
    expect(blobParecePaginaWeb(new Blob([new Uint8Array([0xff, 0xd8])], { type: "application/octet-stream" }))).toBe(false);
    expect(blobParecePaginaWeb(new Blob([new Uint8Array([0xff, 0xd8])], { type: "" }))).toBe(false);
  });

  it("nao rejeita text/plain — S3 as vezes salva jpeg com mime errado", () => {
    expect(blobParecePaginaWeb(new Blob([new Uint8Array([0xff, 0xd8])], { type: "text/plain" }))).toBe(false);
  });
});

describe("isS3HttpUrl", () => {
  it("reconhece URL publica virtual-hosted do S3", () => {
    expect(isS3HttpUrl("https://meu-bucket.s3.us-east-1.amazonaws.com/imagens/a.jpg")).toBe(true);
    expect(isS3HttpUrl("https://meu-bucket.s3.amazonaws.com/imagens/a.jpg")).toBe(true);
  });

  it("rejeita data URL e outros hosts", () => {
    expect(isS3HttpUrl("data:image/jpeg;base64,xx")).toBe(false);
    expect(isS3HttpUrl("https://api.scryfall.com/foo.jpg")).toBe(false);
  });
});

describe("buildS3ImageProxyUrl", () => {
  const s3 = "https://meu-bucket.s3.us-east-1.amazonaws.com/imagens/a.jpg";

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("em DEV usa o proxy Vite", () => {
    vi.stubEnv("DEV", true);
    expect(buildS3ImageProxyUrl(s3)).toBe(`/__s3-image?url=${encodeURIComponent(s3)}`);
  });
});
