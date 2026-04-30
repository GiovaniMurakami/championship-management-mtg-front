import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { criarLiga, atualizarLiga, buscarLiga, listarTorneios } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/ui/PageShell";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";


export function LigaCreatePage({ editMode = false }) {
  const { id: ligaId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nome: "", descricao: "", tipo: "individual" });
  const [filtrosTorneio, setFiltrosTorneio] = useState({ dataInicio: "", dataFim: "" });
  const [torneiosDisponiveis, setTorneiosDisponiveis] = useState([]);
  const [torneiosSelecionados, setTorneiosSelecionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(editMode);
  const [loadingTorneios, setLoadingTorneios] = useState(false);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  const carregarTorneios = useCallback(async (params) => {
    if (!token) return;
    setLoadingTorneios(true);
    try {
      const torneiosData = await listarTorneios(token, params);
      setTorneiosDisponiveis(torneiosData.torneios || []);
    } catch (err) {
      console.error("Erro ao carregar torneios:", err);
      setError("Erro ao carregar torneios.");
    } finally {
      setLoadingTorneios(false);
    }
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [torneiosData, ligaData] = await Promise.all([
        listarTorneios(token),
        editMode && ligaId ? buscarLiga(ligaId, token) : Promise.resolve(null),
      ]);
      setTorneiosDisponiveis(torneiosData.torneios || []);
      if (ligaData) {
        const liga = ligaData.liga || ligaData;
        setForm({ nome: liga.nome || "", descricao: liga.descricao || "", tipo: liga.tipo || "individual" });
        const ids = (liga.torneios || []).map((t) => t.id ?? t);
        setTorneiosSelecionados(ids.map(String));
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados.");
    } finally {
      setLoadingData(false);
    }
  }, [token, editMode, ligaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltrosTorneio((prev) => ({ ...prev, [name]: value }));
    setFilterError("");
  };

  const buildTorneiosParams = ({ dataInicio, dataFim }) => {
    const params = new URLSearchParams();
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim) params.set("dataFim", dataFim);
    return params;
  };

  const handleFiltrarTorneios = async () => {
    const { dataInicio, dataFim } = filtrosTorneio;
    setFilterError("");
    setError("");

    if (dataInicio && dataFim && dataInicio > dataFim) {
      setFilterError("A data inicial não pode ser maior que a data final.");
      return;
    }

    await carregarTorneios(buildTorneiosParams(filtrosTorneio));
  };

  const handleLimparFiltrosTorneio = async () => {
    setFiltrosTorneio({ dataInicio: "", dataFim: "" });
    setFilterError("");
    setError("");
    await carregarTorneios();
  };

  const toggleTorneio = (id) => {
    const strId = String(id);
    setTorneiosSelecionados((prev) =>
      prev.includes(strId) ? prev.filter((t) => t !== strId) : [...prev, strId]
    );
  };

  const handleAdicionarTodosFiltrados = () => {
    const idsFiltrados = torneiosDisponiveis.map((torneio) => String(torneio.id));
    setTorneiosSelecionados((prev) => Array.from(new Set([...prev, ...idsFiltrados])));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        torneioIds: torneiosSelecionados,
      };
      if (editMode && ligaId) {
        await atualizarLiga(ligaId, payload, token);
      } else {
        await criarLiga(payload, token);
      }
      navigate("/ligas");
    } catch (err) {
      setError(editMode ? "Erro ao atualizar liga." : "Erro ao criar liga.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <PageShell>
        <div className="animate-pulse max-w-[600px] mx-auto">
          <div className="h-8 w-48 bg-white/[0.06] rounded mb-8" />
          <div className="h-[400px] bg-white/[0.03] rounded-xl" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <button
        className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 mb-6 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px]"
        type="button"
        onClick={() => navigate(editMode && ligaId ? `/ligas/${ligaId}` : "/ligas")}
      >
        ← Voltar
      </button>

      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-8 mb-8 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-[768px]:p-6">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-white text-center mb-8 text-[1.8rem] font-semibold max-[768px]:text-[1.5rem]">
            {editMode ? "Editar Liga" : "Criar Nova Liga"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-6">

            {/* Informações */}
            <div className="flex flex-col gap-4 p-5 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)]">
              <h3 className="text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 mb-1 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                Informações
              </h3>
              <div className="flex flex-col gap-2">
                <label htmlFor="liga-nome" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                  Nome da Liga
                </label>
                <input
                  id="liga-nome"
                  name="nome"
                  type="text"
                  placeholder="Ex: Liga Mensal Standard"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={TOURNAMENT_INPUT_CLASS}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="liga-descricao" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                  Descrição <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                </label>
                <textarea
                  id="liga-descricao"
                  name="descricao"
                  placeholder="Descreva a liga..."
                  value={form.descricao}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  className={`${TOURNAMENT_INPUT_CLASS} resize-y min-h-[80px]`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#e0e0e0] font-medium text-[0.95rem]">Tipo de Liga</label>
                <div className="flex gap-3">
                  {[
                    { value: "individual", label: "Individual" },
                    { value: "times", label: "Times" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-2 flex-1 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                        form.tipo === value
                          ? "border-[rgba(79,70,229,0.6)] bg-[rgba(79,70,229,0.12)]"
                          : "border-[rgba(217,180,255,0.12)] bg-white/[0.02] hover:border-[rgba(217,180,255,0.25)] hover:bg-white/[0.04]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipo"
                        value={value}
                        checked={form.tipo === value}
                        onChange={handleChange}
                        disabled={loading}
                        className="accent-[#4f46e5]"
                      />
                      <span className="text-[#f5edff] text-[0.9rem] font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Torneios */}
            <div className="flex flex-col gap-4 p-5 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)]">
              <h3 className="text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 mb-1 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                Torneios <span className="text-[#beafd7] text-[0.75rem] normal-case tracking-normal font-normal">(opcional)</span>
              </h3>
              <div className="grid grid-cols-1 min-[560px]:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label htmlFor="torneio-data-inicio" className="text-[#e0e0e0] font-medium text-[0.9rem]">
                    Data inicial
                  </label>
                  <input
                    id="torneio-data-inicio"
                    name="dataInicio"
                    type="date"
                    value={filtrosTorneio.dataInicio}
                    onChange={handleFiltroChange}
                    disabled={loading || loadingTorneios}
                    className={TOURNAMENT_INPUT_CLASS}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="torneio-data-fim" className="text-[#e0e0e0] font-medium text-[0.9rem]">
                    Data final
                  </label>
                  <input
                    id="torneio-data-fim"
                    name="dataFim"
                    type="date"
                    value={filtrosTorneio.dataFim}
                    onChange={handleFiltroChange}
                    disabled={loading || loadingTorneios}
                    className={TOURNAMENT_INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleFiltrarTorneios}
                  disabled={loading || loadingTorneios}
                  className="px-4 py-2 rounded-lg border border-[#4f46e5] bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] cursor-pointer font-semibold transition-all duration-200 hover:bg-[#4f46e5] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingTorneios ? "Filtrando..." : "Filtrar"}
                </button>
                <button
                  type="button"
                  onClick={handleLimparFiltrosTorneio}
                  disabled={loading || loadingTorneios}
                  className="px-4 py-2 rounded-lg border border-[rgba(217,180,255,0.18)] bg-white/[0.03] text-[#beafd7] cursor-pointer font-semibold transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.45)] hover:bg-white/[0.06] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={handleAdicionarTodosFiltrados}
                  disabled={loading || loadingTorneios || torneiosDisponiveis.length === 0}
                  className="px-4 py-2 rounded-lg border border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.1)] text-[#86efac] cursor-pointer font-semibold transition-all duration-200 hover:bg-[rgba(34,197,94,0.18)] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Adicionar todos
                </button>
              </div>
              {filterError && (
                <div className="bg-[rgba(239,68,68,0.1)] border border-[#ef4444] text-[#fca5a5] px-3 py-2 rounded-[6px] text-[0.85rem]">
                  {filterError}
                </div>
              )}
              {loadingTorneios ? (
                <p className="text-[#888] text-[0.875rem] m-0">Carregando torneios...</p>
              ) : torneiosDisponiveis.length === 0 ? (
                <p className="text-[#888] text-[0.875rem] m-0">Nenhum torneio disponível.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {torneiosDisponiveis.map((torneio) => {
                    const selected = torneiosSelecionados.includes(String(torneio.id));
                    return (
                      <label
                        key={torneio.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                          selected
                            ? "border-[rgba(79,70,229,0.6)] bg-[rgba(79,70,229,0.12)]"
                            : "border-[rgba(217,180,255,0.12)] bg-white/[0.02] hover:border-[rgba(217,180,255,0.25)] hover:bg-white/[0.04]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#4f46e5] cursor-pointer"
                          checked={selected}
                          onChange={() => toggleTorneio(torneio.id)}
                          disabled={loading || loadingTorneios}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="block text-[#f5edff] text-[0.88rem] font-medium truncate">{torneio.nome}</span>
                          <span className="text-[#beafd7] text-[0.77rem]">{(torneio.formato || "").toUpperCase()}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {torneiosSelecionados.length > 0 && (
                <p className="text-[#a5b4fc] text-[0.8rem] m-0">
                  {torneiosSelecionados.length} torneio(s) selecionado(s)
                </p>
              )}
            </div>

            {error && (
              <div className="bg-[rgba(239,68,68,0.1)] border border-[#ef4444] text-[#fca5a5] px-3 py-3 rounded-[6px] text-[0.9rem] text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white border-none px-8 py-4 rounded-lg text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:!transform-none"
              disabled={loading}
            >
              {loading
                ? editMode ? "Salvando..." : "Criando..."
                : editMode ? "Salvar Alterações" : "Criar Liga"}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
