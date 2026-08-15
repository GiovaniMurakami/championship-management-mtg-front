import {
  earliestMsUntilAblyWindow,
  isTournamentAblyWindowOpen,
  msUntilTournamentAblyWindow,
} from "../utils/ablyTournamentWindow";

const MIN = 60 * 1000;

describe("ablyTournamentWindow", () => {
  const horario = "2026-08-15T18:00:00.000-03:00";
  const start = new Date(horario).getTime();

  it("nao abre para visitante sem torneio ou torneio finalizado", () => {
    expect(isTournamentAblyWindowOpen(null)).toBe(false);
    expect(isTournamentAblyWindowOpen({ status: "finalizado", horario })).toBe(false);
  });

  it("abre sempre com torneio em andamento", () => {
    expect(isTournamentAblyWindowOpen({
      status: "em_andamento",
      horario: "2099-01-01T12:00:00.000Z",
    })).toBe(true);
  });

  it("abre 15 minutos antes do horario e permanece depois", () => {
    expect(isTournamentAblyWindowOpen(
      { status: "inscricoes_abertas", horario },
      start - 15 * MIN,
    )).toBe(true);
    expect(isTournamentAblyWindowOpen(
      { status: "inscricoes_abertas", horario },
      start - 15 * MIN + 1,
    )).toBe(true);
    expect(isTournamentAblyWindowOpen(
      { status: "inscricoes_abertas", horario },
      start + 30 * MIN,
    )).toBe(true);
  });

  it("nao abre mais de 15 minutos antes", () => {
    expect(isTournamentAblyWindowOpen(
      { status: "inscricoes_abertas", horario },
      start - 15 * MIN - 1,
    )).toBe(false);
  });

  it("calcula espera ate a janela e o mais proximo da lista", () => {
    expect(msUntilTournamentAblyWindow(
      { status: "inscricoes_abertas", horario },
      start - 20 * MIN,
    )).toBe(5 * MIN);
    expect(msUntilTournamentAblyWindow(
      { status: "em_andamento", horario },
      start - 20 * MIN,
    )).toBe(0);
    expect(msUntilTournamentAblyWindow({ status: "finalizado", horario })).toBe(null);

    expect(earliestMsUntilAblyWindow([
      { status: "finalizado", horario },
      { status: "inscricoes_abertas", horario },
    ], start - 40 * MIN)).toBe(25 * MIN);
  });
});
