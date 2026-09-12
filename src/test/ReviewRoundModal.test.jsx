import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReviewRoundModal } from "../components/tournament/ReviewRoundModal";

const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    standings: [
        { id: "1", nome: "Ana", deckNome: "Affinity" },
        { id: "2", nome: "Beto", deckNome: "Burn" },
    ],
    partidas: [
        {
            id: "match-1",
            rodada: 2,
            status: "finalizada",
            jogador1Id: "1",
            jogador2Id: "2",
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
    it("oferece finalizar ou jogar mais uma rodada ao terminar o suíço", () => {
        const onNextRound = vi.fn();
        render(<ReviewRoundModal {...baseProps} onNextRound={onNextRound} torneio={{ status: "em_andamento", rodadaAtual: 2, totalRodadas: 2 }} />);
        goToPlayersStep();
        expect(screen.getByRole("button", { name: "Finalizar Torneio" })).toBeEnabled();
        fireEvent.click(screen.getByRole("button", { name: "Jogar mais uma rodada" }));
        expect(onNextRound).toHaveBeenCalledWith(true);
    });

    it("mostra os decks junto aos jogadores quando a partida está finalizada", () => {
        render(
            <ReviewRoundModal
                {...baseProps}
                torneio={{ status: "em_andamento", rodadaAtual: 2, totalRodadas: 5 }}
                pendingCheckinPlayers={[]}
            />,
        );

        expect(screen.getByText("Ana · Affinity")).toBeInTheDocument();
        expect(screen.getByText("Beto · Burn")).toBeInTheDocument();
    });

    it("exibe aviso informativo de presença pendente sem bloquear o botão", () => {
        render(
            <ReviewRoundModal
                {...baseProps}
                torneio={{ status: "em_andamento", rodadaAtual: 2, totalRodadas: 5 }}
                pendingCheckinPlayers={[{ id: "2", nome: "Beto" }]}
            />,
        );

        goToPlayersStep();

        expect(screen.getAllByText(/1 jogador\(es\) ainda não confirmaram presença/i).length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: /Iniciar Próxima Rodada/i })).toBeEnabled();
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

    it("depois de gerar a proxima rodada permanece aberta para publicar as mesas", async () => {
        const onNextRound = vi.fn().mockResolvedValue(true);
        const onPublishRound = vi.fn().mockResolvedValue(true);
        const onClose = vi.fn();
        const { rerender } = render(
            <ReviewRoundModal
                {...baseProps}
                onClose={onClose}
                onNextRound={onNextRound}
                onPublishRound={onPublishRound}
                torneio={{ status: "em_andamento", rodadaAtual: 2, totalRodadas: 5 }}
            />,
        );

        goToPlayersStep();
        fireEvent.click(screen.getByRole("button", { name: /Iniciar Próxima Rodada/i }));
        await waitFor(() => expect(onNextRound).toHaveBeenCalledTimes(1));
        expect(onClose).not.toHaveBeenCalled();

        rerender(
            <ReviewRoundModal
                {...baseProps}
                onClose={onClose}
                onNextRound={onNextRound}
                onPublishRound={onPublishRound}
                torneio={{ status: "em_andamento", rodadaAtual: 3, totalRodadas: 5, rodadaPublicada: false }}
                partidas={[{
                    id: "match-2",
                    rodada: 3,
                    status: "pendente",
                    jogador1Nome: "Ana",
                    jogador2Nome: "Beto",
                }]}
            />,
        );

        expect(screen.getByRole("button", { name: /Publicar mesas/i })).toBeEnabled();
        fireEvent.click(screen.getByRole("button", { name: /Publicar mesas/i }));
        await waitFor(() => expect(onPublishRound).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Revisar Jogadores/i })).not.toBeInTheDocument();
    });
});
