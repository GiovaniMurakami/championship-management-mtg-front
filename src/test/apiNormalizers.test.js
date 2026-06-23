import { describe, expect, it } from "vitest";
import {
  normalizeListarDecksResponse,
  normalizeListarTorneiosResponse,
} from "../services/apiNormalizers";
import { extractValidationMessages, formatApiErrorMessage } from "../utils/apiError";
import { isValidUuid } from "../utils/validateUuid";
import { clampLimite, clampOffset } from "../utils/pagination";

describe("apiNormalizers", () => {
  it("normaliza resposta paginada de decks", () => {
    const result = normalizeListarDecksResponse({
      decks: [{ id: "1", nome: "Azorius" }],
      total: 42,
      limite: 20,
      offset: 0,
    });

    expect(result.decks).toHaveLength(1);
    expect(result.total).toBe(42);
    expect(result.limite).toBe(20);
    expect(result.offset).toBe(0);
  });

  it("aceita array legado de decks", () => {
    const result = normalizeListarDecksResponse([{ id: "1" }, { id: "2" }]);
    expect(result.decks).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("normaliza resposta paginada de torneios", () => {
    const result = normalizeListarTorneiosResponse({
      torneios: [{ id: "t1" }],
      total: 5,
      limite: 10,
      offset: 20,
    });

    expect(result.torneios).toHaveLength(1);
    expect(result.total).toBe(5);
    expect(result.limite).toBe(10);
    expect(result.offset).toBe(20);
  });
});

describe("apiError", () => {
  it("extrai erros como strings", () => {
    const messages = extractValidationMessages({
      mensagem: "Dados inválidos",
      erros: ["id deve ser um UUID válido.", "limite deve ser entre 1 e 100"],
    });
    expect(messages).toEqual([
      "id deve ser um UUID válido.",
      "limite deve ser entre 1 e 100",
    ]);
  });

  it("extrai erros Zod-like", () => {
    const messages = extractValidationMessages({
      errors: [{ message: "E-mail inválido" }],
    });
    expect(messages).toEqual(["E-mail inválido"]);
  });

  it("usa mensagem quando não há erros", () => {
    expect(formatApiErrorMessage({ mensagem: "Origem não permitida." }))
      .toBe("Origem não permitida.");
  });
});

describe("validateUuid", () => {
  it("valida UUID v4", () => {
    expect(isValidUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUuid("not-a-uuid")).toBe(false);
    expect(isValidUuid("")).toBe(false);
  });
});

describe("pagination", () => {
  it("limita limite entre 1 e 100", () => {
    expect(clampLimite(0)).toBe(1);
    expect(clampLimite(50)).toBe(50);
    expect(clampLimite(200)).toBe(100);
  });

  it("garante offset >= 0", () => {
    expect(clampOffset(-5)).toBe(0);
    expect(clampOffset(10)).toBe(10);
  });
});
