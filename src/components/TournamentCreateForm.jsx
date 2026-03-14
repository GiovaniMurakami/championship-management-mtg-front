import { useState } from "react";
import { criarTorneio } from "../services/backendApi";

export function TournamentCreateForm({ token, onTournamentCreated }) {
    const [createForm, setCreateForm] = useState({
        nome: "",
        horario: "",
        formato: "standard",
        premio: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await criarTorneio(createForm, token);
            setCreateForm({ nome: "", horario: "", formato: "standard" });
            onTournamentCreated();
        } catch (error) {
            setError("Erro ao criar torneio. Tente novamente.");
            console.error("Erro ao criar torneio:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <section className="tournament-create-section">
            <div className="create-form-container">
                <h2>Criar Novo Torneio</h2>
                <form onSubmit={handleSubmit} className="tournament-create-form">
                    <div className="form-group">
                        <label htmlFor="nome">Nome do Torneio</label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            placeholder="Ex: FNM Standard"
                            value={createForm.nome}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="horario">Data e Hora</label>
                        <input
                            id="horario"
                            name="horario"
                            type="datetime-local"
                            value={createForm.horario}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="premio">Prêmio <span className="optional-label">(opcional)</span></label>
                        <input
                            id="premio"
                            name="premio"
                            type="text"
                            placeholder="Ex: 1º lugar: booster box"
                            value={createForm.premio}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="formato">Formato</label>
                        <select
                            id="formato"
                            name="formato"
                            value={createForm.formato}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="standard">Standard</option>
                            <option value="modern">Modern</option>
                            <option value="pioneer">Pioneer</option>
                            <option value="commander">Commander</option>
                        </select>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="btn-primary create-tournament-btn"
                        disabled={loading}
                    >
                        {loading ? "Criando..." : "Criar Torneio"}
                    </button>
                </form>
            </div>
        </section>
    );
}