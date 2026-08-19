import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock("../services/httpClient", () => ({
  default: {
    get: getMock,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import { buscarArquetipoMetagame, buscarMetagame } from "../services/backendApi";

describe("backendApi — metagame", () => {
  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({ formato: "pauper" });
  });

  it("buscarMetagame chama GET /metagame com filtros", async () => {
    await buscarMetagame({ formato: "pauper", dias: 30 });

    expect(getMock).toHaveBeenCalledWith("/metagame", {
      params: { formato: "pauper", dias: 30 },
    });
  });

  it("buscarArquetipoMetagame encodeia formato e slug", async () => {
    await buscarArquetipoMetagame("commander 500", "blue-terror", { dias: 7 });

    expect(getMock).toHaveBeenCalledWith(
      "/metagame/commander%20500/blue-terror",
      { params: { dias: 7 } },
    );
  });
});
