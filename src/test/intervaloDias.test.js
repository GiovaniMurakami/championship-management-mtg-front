import { describe, expect, it } from "vitest";
import { intervaloUltimosDias, resolverPeriodoPerfil } from "../utils/intervaloDias";

describe("intervaloUltimosDias", () => {
  it("inclui hoje e os 29 dias anteriores nos últimos 30 dias", () => {
    expect(intervaloUltimosDias(30, "2026-03-01")).toEqual({
      dataInicio: "2026-01-31",
      dataFim: "2026-03-01",
    });
  });

  it("usa o período personalizado e trata a ausência de parâmetro como 30 dias", () => {
    expect(resolverPeriodoPerfil({ dataInicio: "2026-08-01", dataFim: "2026-08-31", dias: "7" })).toEqual({
      dataInicio: "2026-08-01",
      dataFim: "2026-08-31",
    });
    expect(resolverPeriodoPerfil({ dias: "tudo" })).toEqual({});
    expect(resolverPeriodoPerfil({})).toEqual(intervaloUltimosDias(30));
  });
});
