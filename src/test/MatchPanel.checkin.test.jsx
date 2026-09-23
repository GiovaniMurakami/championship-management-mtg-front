import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MatchPanel } from "../components/tournament/MatchPanel";

const pendingProps = {
  myMatch: null,
  usuario: { id: "u1" },
  onReportResult: vi.fn(),
  onContestResult: vi.fn(),
  onConfirmResult: vi.fn(),
  actionLoading: false,
  torneio: { status: "em_andamento", rodadaAtual: 2, rodadaPublicada: true },
  isOwner: false,
  currentPlayer: { id: "u1", checkinRodada: 0 },
  onCheckin: vi.fn(),
};

describe("MatchPanel check-in", () => {
  it("mostra o botão de confirmar presença quando o check-in está pendente", () => {
    render(<MatchPanel {...pendingProps} />);
    expect(screen.getByRole("button", { name: "Confirmar presença" })).toBeEnabled();
  });

  it("substitui o botão por um loader enquanto o check-in está em andamento", () => {
    render(<MatchPanel {...pendingProps} actionLoading isCheckingIn />);
    expect(screen.queryByRole("button", { name: "Confirmar presença" })).not.toBeInTheDocument();
    expect(screen.getByText("Confirmando sua presença...")).toBeInTheDocument();
    expect(screen.getByText("Aguarde, isso pode levar alguns segundos.")).toBeInTheDocument();
  });
});
