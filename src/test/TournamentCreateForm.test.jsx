import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TournamentCreateForm } from "../components/tournament/TournamentCreateForm";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ token: "token", isAdmin: false, usuario: null }),
}));

describe("TournamentCreateForm", () => {
    it("apresenta maxRodadas como total de rodadas Swiss opcional", () => {
        render(<TournamentCreateForm token="token" onTournamentCreated={vi.fn()} />);

        expect(screen.getByLabelText(/Total de rodadas Swiss/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Pode forçar mais ou menos rodadas que o cálculo automático/i),
        ).toBeInTheDocument();
    });
});
