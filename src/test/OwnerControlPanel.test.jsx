import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OwnerControlPanel } from "../components/tournament/OwnerControlPanel";

function createBaseProps(overrides = {}) {
    return {
        torneio: {
            id: "t-1",
            status: "inscricoes_abertas",
            rodadaAtual: 0,
            totalRodadas: 4,
            donoId: "owner-1",
        },
        standings: [],
        usuarioId: "owner-1",
        pendingCheckinPlayers: [],
        canManage: true,
        onStartTournament: vi.fn(),
        onNextRound: vi.fn(),
        onDropPlayersWithoutDeck: vi.fn(),
        onDropPlayersWithoutCheckin: vi.fn(),
        onDropPlayer: vi.fn(),
        onEditResult: vi.fn(),
        onRefazerRodada: vi.fn(),
        onEncerrarTorneio: vi.fn(),
        actionLoading: false,
        adminActionKey: "",
        droppingPlayerId: "",
        partidas: [],
        ...overrides,
    };
}

describe("OwnerControlPanel", () => {
    it("mostra inicio e ações de limpeza antes do torneio começar", () => {
        const props = createBaseProps({
            standings: [
                { id: "1", nome: "Ana", deckConfirmado: true, checkinRodada: 0 },
                { id: "2", nome: "Beto", checkinRodada: 0 },
                { id: "3", nome: "Caio", deckConfirmado: true, checkinRodada: -1 },
            ],
        });

        render(<OwnerControlPanel {...props} />);

        expect(screen.getByRole("button", { name: "Dropar sem deck (1)" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Dropar sem check-in (1)" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /Iniciar Torneio/i }));
        fireEvent.click(screen.getByRole("button", { name: /Dropar sem deck/i }));
        fireEvent.click(screen.getByRole("button", { name: /Dropar sem check-in/i }));

        expect(props.onStartTournament).toHaveBeenCalledTimes(1);
        expect(props.onDropPlayersWithoutDeck).toHaveBeenCalledWith(["2"]);
        expect(props.onDropPlayersWithoutCheckin).toHaveBeenCalledWith(["3"]);
        expect(screen.queryByRole("button", { name: /Revisar Rodada/i })).not.toBeInTheDocument();
    });

    it("mantem apenas a limpeza por check-in depois que o torneio inicia", () => {
        const props = createBaseProps({
            torneio: {
                id: "t-1",
                status: "em_andamento",
                rodadaAtual: 2,
                totalRodadas: 4,
                donoId: "owner-1",
            },
            standings: [
                { id: "1", nome: "Ana", pontos: 6, checkinRodada: 2 },
                { id: "2", nome: "Beto", pontos: 3, checkinRodada: -1 },
            ],
            pendingCheckinPlayers: [{ id: "2", nome: "Beto" }],
        });

        render(<OwnerControlPanel {...props} />);

        expect(screen.getByRole("button", { name: "Dropar sem check-in (1)" })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /Dropar sem check-in/i }));

        expect(screen.queryByRole("button", { name: /Iniciar Torneio/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Dropar sem deck/i })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Revisar Rodada/i })).toBeInTheDocument();
        expect(props.onDropPlayersWithoutCheckin).toHaveBeenCalledWith(["2"]);
    });

    it("refaz a rodada após confirmação na modal", () => {
        const props = createBaseProps({
            torneio: {
                id: "t-1",
                status: "em_andamento",
                rodadaAtual: 3,
                totalRodadas: 4,
                donoId: "owner-1",
            },
        });

        render(<OwnerControlPanel {...props} />);
        fireEvent.click(screen.getByRole("button", { name: /Refazer rodada/i }));

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/As partidas desta rodada serão removidas/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /^Confirmar$/i }));
        expect(props.onRefazerRodada).toHaveBeenCalledTimes(1);
    });

    it("cancela o refazer rodada pela modal sem chamar o handler", () => {
        const props = createBaseProps({
            torneio: {
                id: "t-1",
                status: "em_andamento",
                rodadaAtual: 3,
                totalRodadas: 4,
                donoId: "owner-1",
            },
        });

        render(<OwnerControlPanel {...props} />);
        fireEvent.click(screen.getByRole("button", { name: /Refazer rodada/i }));
        fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

        expect(props.onRefazerRodada).not.toHaveBeenCalled();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("encerra o torneio após confirmação na modal", () => {
        const props = createBaseProps({
            torneio: {
                id: "t-1",
                status: "em_andamento",
                rodadaAtual: 2,
                totalRodadas: 4,
                donoId: "owner-1",
            },
        });

        render(<OwnerControlPanel {...props} />);
        fireEvent.click(screen.getByRole("button", { name: /Encerrar torneio/i }));

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/O ranking atual será considerado final/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /Confirmar encerramento/i }));
        expect(props.onEncerrarTorneio).toHaveBeenCalledTimes(1);
    });

    it("cancela o encerramento pela modal sem chamar o handler", () => {
        const props = createBaseProps({
            torneio: {
                id: "t-1",
                status: "em_andamento",
                rodadaAtual: 2,
                totalRodadas: 4,
                donoId: "owner-1",
            },
        });

        render(<OwnerControlPanel {...props} />);
        fireEvent.click(screen.getByRole("button", { name: /Encerrar torneio/i }));
        fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

        expect(props.onEncerrarTorneio).not.toHaveBeenCalled();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("mostra observação de contestação na aba Contestadas", () => {
        const props = createBaseProps({
            torneio: {
                id: "t-1",
                status: "em_andamento",
                rodadaAtual: 1,
                totalRodadas: 3,
                donoId: "owner-1",
            },
            standings: [
                { id: "u-1", nome: "Ana" },
                { id: "u-2", nome: "Beto" },
            ],
            partidas: [
                {
                    id: "p-1",
                    rodada: 1,
                    jogador1Id: "u-1",
                    jogador2Id: "u-2",
                    vitoriasJogador1: 2,
                    vitoriasJogador2: 0,
                    status: "finalizada",
                    contestado: true,
                    observacaoContestacao: "Placar digitado invertido",
                },
            ],
        });

        render(<OwnerControlPanel {...props} />);
        fireEvent.click(screen.getByRole("button", { name: /Contestadas/i }));

        expect(screen.getByText(/Observação: Placar digitado invertido/i)).toBeInTheDocument();
    });

    it("ordena a lista pelo mesmo nome exibido ao jogador", () => {
        const props = createBaseProps({
            standings: [
                { id: "1", nome: "ZuluNick", usuario: { nome: "Ana Real" }, deckConfirmado: true, checkinRodada: 0 },
                { id: "2", nome: "AlphaNick", usuario: { nome: "Zeca Real" }, deckConfirmado: true, checkinRodada: 0 },
            ],
        });

        render(<OwnerControlPanel {...props} />);
        fireEvent.click(screen.getByRole("button", { name: /Lista de jogadores/i }));

        const alpha = screen.getByText("AlphaNick");
        const zulu = screen.getByText("ZuluNick");
        expect(alpha.compareDocumentPosition(zulu) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("limita a soma do placar a três", async () => {
        const props = createBaseProps({
            torneio: { id: "t-1", status: "em_andamento", rodadaAtual: 1, totalRodadas: 3 },
            standings: [{ id: "1", nome: "Ana" }, { id: "2", nome: "Beto" }],
            partidas: [{ id: "p-1", rodada: 1, mesa: 1, jogador1Id: "1", jogador2Id: "2", jogador1Nome: "Ana", jogador2Nome: "Beto", vitoriasJogador1: 0, vitoriasJogador2: 0, status: "pendente" }],
        });

        render(<OwnerControlPanel {...props} />);
        fireEvent.click(screen.getByRole("button", { name: /Lista de mesas/i }));
        fireEvent.click(screen.getByRole("button", { name: "Editar" }));

        const increaseButtons = screen.getAllByRole("button", { name: "Aumentar" });
        fireEvent.click(increaseButtons[0]);
        fireEvent.click(increaseButtons[0]);
        fireEvent.click(increaseButtons[1]);

        expect(increaseButtons[1]).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "Confirmar resultado" }));
        await waitFor(() => {
            expect(props.onEditResult).toHaveBeenCalledWith("p-1", { vitoriasJogador1: 2, vitoriasJogador2: 1 });
        });
    });
});
