import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { TournamentCreateForm } from "../components";

export function TournamentCreatePage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const handleTournamentCreated = () => {
        navigate("/torneios");
    };

    return (
        <div className="tournament-page">
            <button className="td-back-btn" type="button" onClick={() => navigate("/torneios")}>
                ← Voltar para torneios
            </button>

            <h1>Criar Torneio</h1>

            <TournamentCreateForm token={token} onTournamentCreated={handleTournamentCreated} />
        </div>
    );
}