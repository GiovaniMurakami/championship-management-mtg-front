import { fireEvent, render, screen } from "@testing-library/react";
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
                { id: "1", nome: "Ana", deckConfirmado: true, checkIn: true },
                { id: "2", nome: "Beto", checkIn: true },
                { id: "3", nome: "Caio", deckConfirmado: true },
            ],
        });

        render(<OwnerControlPanel {...props} />);

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

        fireEvent.click(screen.getByRole("button", { name: /Dropar sem check-in/i }));

        expect(screen.queryByRole("button", { name: /Iniciar Torneio/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Dropar sem deck/i })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Revisar Rodada/i })).toBeInTheDocument();
        expect(props.onDropPlayersWithoutCheckin).toHaveBeenCalledWith(["2"]);
    });
});