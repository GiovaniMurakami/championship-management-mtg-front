import { describe, expect, it } from "vitest";
import { formatIsoDatesInMessage } from "../utils/brasiliaTime";

describe("formatIsoDatesInMessage", () => {
  it("converte timestamp da API para horário amigável de Brasília", () => {
    expect(formatIsoDatesInMessage(
      "O check-in só abre 1 hora antes do torneio (a partir de 2026-08-31T19:00:00.000-03:00).",
    )).toBe(
      "O check-in só abre 1 hora antes do torneio (a partir de 31/08/2026 às 19:00, horário de Brasília).",
    );
  });

  it("mantém mensagens sem timestamp", () => {
    expect(formatIsoDatesInMessage("Você já realizou o check-in."))
      .toBe("Você já realizou o check-in.");
  });
});
