import { describe, expect, it } from "vitest";
import {
  isTorneioIdOuSlug,
  metagameBreakdownPath,
  tournamentPath,
  tournamentShortId,
} from "../utils/tournamentUrl";

describe("tournamentUrl", () => {
  const torneio = {
    id: "9d8cc51b-425e-47a9-a7a8-3cd3e6657599",
    nome: "Super Pauper 50K - Fuguete Edition",
  };

  it("monta short id com 5 primeiros + slug do nome", () => {
    expect(tournamentShortId(torneio)).toBe("9d8cc-super-pauper-50k-fuguete-edition");
  });

  it("monta path do breakdown com short id", () => {
    expect(metagameBreakdownPath(torneio)).toBe(
      "/metagame/breakdown?torneioId=9d8cc-super-pauper-50k-fuguete-edition",
    );
  });

  it("reusa o mesmo padrão no path do torneio", () => {
    expect(tournamentPath(torneio)).toBe("/torneios/9d8cc-super-pauper-50k-fuguete-edition");
  });

  it("aceita uuid ou slug curto", () => {
    expect(isTorneioIdOuSlug(torneio.id)).toBe(true);
    expect(isTorneioIdOuSlug("9d8cc-super-pauper-50k-fuguete-edition")).toBe(true);
    expect(isTorneioIdOuSlug("abc")).toBe(false);
  });
});
