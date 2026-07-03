import { describe, expect, it } from "vitest";
import {
  buildExternalAppUrlForPath,
  buildTeamInviteExternalUrl,
  buildTournamentExternalUrl,
  buildTournamentJoinExternalUrl,
  resolveExternalNavigationTarget,
} from "../utils/externalNavigation";

describe("resolveExternalNavigationTarget", () => {
  it("redireciona torneioId para a tela de detalhe do torneio", () => {
    const target = resolveExternalNavigationTarget({
      pathname: "/",
      search: "?torneioId=abc-123",
    });

    expect(target).toEqual({
      pathname: "/torneios/abc-123",
      search: "",
    });
  });

  it("preserva filtros da tela de times ao usar rota externa", () => {
    const target = resolveExternalNavigationTarget({
      pathname: "/",
      search: "?rota=times&nome=Rocket&pagina=2",
    });

    expect(target).toEqual({
      pathname: "/times",
      search: "?nome=Rocket&pagina=2",
    });
  });

  it("abre visualizacao de deck em modo somente leitura", () => {
    const target = resolveExternalNavigationTarget({
      pathname: "/",
      search: "?deckId=deck-9",
    });

    expect(target).toEqual({
      pathname: "/editar-deck/deck-9",
      search: "?modo=visualizar",
    });
  });

  it("direciona para a edicao de um time quando a rota explicita for informada", () => {
    const target = resolveExternalNavigationTarget({
      pathname: "/",
      search: "?rota=editar-time&timeId=time-7",
    });

    expect(target).toEqual({
      pathname: "/times/time-7/editar",
      search: "",
    });
  });

  it("redireciona token de ingresso para a rota interna do torneio em andamento", () => {
    const target = resolveExternalNavigationTarget({
      pathname: "/",
      search: "?ingressoToken=join-555",
    });

    expect(target).toEqual({
      pathname: "/torneio/ingressar/join-555",
      search: "",
    });
  });

  it("redireciona rota externa de termos de uso", () => {
    const target = resolveExternalNavigationTarget({
      pathname: "/",
      search: "?rota=termos-de-uso",
    });

    expect(target).toEqual({
      pathname: "/termos-de-uso",
      search: "",
    });
  });

  it("redireciona appPath para uma rota interna preservando parametros extras", () => {
    const target = resolveExternalNavigationTarget({
      pathname: "/",
      search: "?appPath=%2Ftorneios%2Fabc-123%3Faba%3Dmesas&origem=wordpress",
    });

    expect(target).toEqual({
      pathname: "/torneios/abc-123",
      search: "?aba=mesas&origem=wordpress",
    });
  });

  it("ignora appPath externo ou sem barra inicial", () => {
    const target = resolveExternalNavigationTarget({
      pathname: "/",
      search: "?appPath=https%3A%2F%2Fevil.example%2Ftorneios%2Fabc-123",
    });

    expect(target).toBeNull();
  });
});

describe("build external wordpress urls", () => {
  it("gera url externa para torneio", () => {
    expect(buildTournamentExternalUrl("abc-123")).toBe(
      "https://www.tiagofuguete.com.br/app-torneios?torneioId=abc-123",
    );
  });

  it("gera url externa para ingresso em torneio", () => {
    expect(buildTournamentJoinExternalUrl("join-555")).toBe(
      "https://www.tiagofuguete.com.br/app-torneios?ingressoToken=join-555",
    );
  });

  it("gera url externa para convite de time", () => {
    expect(buildTeamInviteExternalUrl("invite-22")).toBe(
      "https://www.tiagofuguete.com.br/app-torneios?rota=times&convite=invite-22",
    );
  });

  it("gera url externa dinamica para a rota atual do app", () => {
    expect(buildExternalAppUrlForPath("/torneios/abc-123?aba=mesas")).toBe(
      "https://www.tiagofuguete.com.br/app-torneios?appPath=%2Ftorneios%2Fabc-123%3Faba%3Dmesas",
    );
  });

  it("gera url externa para termos de uso", () => {
    expect(buildExternalAppUrlForPath("/termos-de-uso")).toBe(
      "https://www.tiagofuguete.com.br/app-torneios?appPath=%2Ftermos-de-uso",
    );
  });
});
