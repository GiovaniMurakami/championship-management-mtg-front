import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReviewRoundModal } from "../components/tournament/ReviewRoundModal";

const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    standings: [
        { id: "1", nome: "Ana" },
        { id: "2", nome: "Beto" },
    ],
    partidas: [
        {
            id: "match-1",
            rodada: 2,
            status: "finalizada",
            jogador1Nome: "Ana",
            jogador2Nome: "Beto",
            vitoriasJogador1: 2,
            vitoriasJogador2: 1,
        },
    ],
    onDropPlayer: vi.fn(),
    onNextRound: vi.fn(),
    actionLoading: false,
    droppingPlayerId: "",
    usuarioId: "1",
};

function goToPlayersStep() {
    fireEvent.click(screen.getByRole("button", { name: /Revisar Jogadores/i }));
}

describe("ReviewRoundModal", () => {
    it("mantem check-in obrigatorio em rodadas intermediarias", () => {
        render(
            <ReviewRoundModal
                {...baseProps}
                torneio={{ status: "em_andamento", rodadaAtual: 2, totalRodadas: 5 }}
                pendingCheckinPlayers={[{ id: "2", nome: "Beto" }]}
            />,
        );

        goToPlayersStep();

        expect(screen.getByText(/1 jogador\(es\) sem check-in/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Aguardando check-in/i })).toBeDisabled();
    });

    it("na ultima rodada do suico para de exigir check-in e permite finalizar", () => {
        render(
            <ReviewRoundModal
                {...baseProps}
                torneio={{ status: "em_andamento", rodadaAtual: 5, totalRodadas: 5 }}
                pendingCheckinPlayers={[]}
            />,
        );

        goToPlayersStep();

        expect(screen.getByText(/pronto para finalizar/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Finalizar Torneio/i })).toBeEnabled();
    });

    it("na ultima rodada do suico com corte troca o CTA para entrar no corte", () => {
        const onNextRound = vi.fn();

        render(
            <ReviewRoundModal
                {...baseProps}
                onNextRound={onNextRound}
                torneio={{ status: "em_andamento", rodadaAtual: 5, totalRodadas: 5, corteTop: 8 }}
                pendingCheckinPlayers={[]}
            />,
        );

        goToPlayersStep();

        expect(screen.getByText(/pronto para iniciar o corte top 8/i)).toBeInTheDocument();

        const button = screen.getByRole("button", { name: /Entrar no Corte/i });
        expect(button).toBeEnabled();
        fireEvent.click(button);
        expect(onNextRound).toHaveBeenCalledTimes(1);
    });
});
