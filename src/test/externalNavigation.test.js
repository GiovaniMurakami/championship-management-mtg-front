import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveExternalNavigationTarget } from "../utils/externalNavigation";

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

async function loadExternalNavigationWithDefaults() {
  vi.stubEnv("VITE_APP_URL", "");
  vi.stubEnv("VITE_WORDPRESS_EMBED_URL", "");
  vi.stubEnv("VITE_WORDPRESS_APP_URL", "");
  vi.resetModules();
  return import("../utils/externalNavigation");
}

describe("build public app urls", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("gera url publica para torneio", async () => {
    const { buildTournamentExternalUrl } = await loadExternalNavigationWithDefaults();
    expect(buildTournamentExternalUrl("abc-123")).toBe(
      "https://app.tiagofuguete.com.br/torneios/abc-123",
    );
  });

  it("gera url publica para ingresso em torneio", async () => {
    const { buildTournamentJoinExternalUrl } = await loadExternalNavigationWithDefaults();
    expect(buildTournamentJoinExternalUrl("join-555")).toBe(
      "https://app.tiagofuguete.com.br/torneio/ingressar/join-555",
    );
  });

  it("gera url publica para convite de time", async () => {
    const { buildTeamInviteExternalUrl } = await loadExternalNavigationWithDefaults();
    expect(buildTeamInviteExternalUrl("invite-22")).toBe(
      "https://app.tiagofuguete.com.br/times?convite=invite-22",
    );
  });

  it("gera url publica dinamica para a rota atual do app", async () => {
    const { buildExternalAppUrlForPath } = await loadExternalNavigationWithDefaults();
    expect(buildExternalAppUrlForPath("/torneios/abc-123?aba=mesas")).toBe(
      "https://app.tiagofuguete.com.br/torneios/abc-123?aba=mesas",
    );
  });

  it("gera url publica para termos de uso", async () => {
    const { buildExternalAppUrlForPath } = await loadExternalNavigationWithDefaults();
    expect(buildExternalAppUrlForPath("/termos-de-uso")).toBe(
      "https://app.tiagofuguete.com.br/termos-de-uso",
    );
  });
});

describe("build wordpress embed urls", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("gera url do embed WordPress para sincronizar rota com o parent", async () => {
    const { buildWordpressEmbedUrlForPath } = await loadExternalNavigationWithDefaults();
    expect(buildWordpressEmbedUrlForPath("/torneios/abc-123?aba=mesas")).toBe(
      "https://tiagofuguete.com.br/app-torneios?appPath=%2Ftorneios%2Fabc-123%3Faba%3Dmesas",
    );
  });
});
