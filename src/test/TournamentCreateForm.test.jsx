import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TournamentCreateForm } from "../components/tournament/TournamentCreateForm";

describe("TournamentCreateForm", () => {
    it("apresenta maxRodadas como teto e explica o calculo automatico", () => {
        render(<TournamentCreateForm token="token" onTournamentCreated={vi.fn()} />);

        expect(screen.getByLabelText(/Limite de Rodadas/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Este campo apenas define o teto e impede ultrapassar esse valor/i),
        ).toBeInTheDocument();
    });
});
