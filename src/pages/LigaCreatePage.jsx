import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { criarLiga, atualizarLiga, buscarLiga, listarTorneios } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { EmptyState } from "../components/ui/EmptyState";
import { BackButton, FormFeedback, FormField, FormSection, PageShell } from "../components/ui";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_SUBMIT,
  FORM_LABEL_CLASS,
  FORM_PAGE_SHELL_CLASS,
  FORM_PAGE_TITLE_CLASS,
  TOURNAMENT_INPUT_CLASS,
} from "../styles/uiClasses";
import { logError } from "../utils/logger";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { uploadBannerImage, validateBannerImageFile } from "../utils/bannerUpload";
import { formatBrasiliaDate } from "../utils/brasiliaTime";

const buildTorneiosParams = ({ dataInicio, dataFim }) => {
  const params = new URLSearchParams();
  if (dataInicio) params.set("dataInicio", dataInicio);
  if (dataFim) params.set("dataFim", dataFim);
  return params;
};

export function LigaCreatePage({ editMode = false }) {
  const { id: ligaId } = useParams();
  const { token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const bannerInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [form, setForm] = useState({ nome: "", descricao: "", tipo: "individual" });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerRemovido, setBannerRemovido] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filtrosTorneio, setFiltrosTorneio] = useState({
    dataInicio: searchParams.get("dataInicio") || "",
    dataFim: searchParams.get("dataFim") || "",
  });
  const filtrosIniciaisRef = useRef(filtrosTorneio);
  const [torneiosDisponiveis, setTorneiosDisponiveis] = useState([]);
  const [torneiosSelecionados, setTorneiosSelecionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(editMode);
  const [loadingTorneios, setLoadingTorneios] = useState(false);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  usePageTitle(
    editMode ? (form.nome || PAGE_TITLES.editarLiga) : PAGE_TITLES.criarLiga,
    { loading: editMode && loadingData && !form.nome },
  );

  const carregarTorneios = useCallback(async (params) => {
    if (!token) return;
    setLoadingTorneios(true);
    try {
      const torneiosData = await listarTorneios(token, params);
      setTorneiosDisponiveis(torneiosData.torneios || []);
    } catch (err) {
      logError("Erro ao carregar torneios:", err);
      setError("Erro ao carregar torneios.");
    } finally {
      setLoadingTorneios(false);
    }
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const torneiosParams = buildTorneiosParams(filtrosIniciaisRef.current);
      const [torneiosData, ligaData] = await Promise.all([
        listarTorneios(token, torneiosParams),
        editMode && ligaId ? buscarLiga(ligaId, token) : Promise.resolve(null),
      ]);
      setTorneiosDisponiveis(torneiosData.torneios || []);
      if (ligaData) {
        const liga = ligaData.liga || ligaData;
        setForm({ nome: liga.nome || "", descricao: liga.descricao || "", tipo: liga.tipo || "individual" });
        setBannerPreview(liga.bannerUrl || null);
        const ids = (liga.torneios || []).map((t) => t.id ?? t);
        setTorneiosSelecionados(ids.map(String));
      }
    } catch (err) {
      logError("Erro ao carregar dados:", err);
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

  const handleBannerChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setError(validationError.userMessage);
      return;
    }
    setError("");
    setBannerFile(file);
    setBannerRemovido(false);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setBannerRemovido(true);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltrosTorneio((prev) => ({ ...prev, [name]: value }));
    setFilterError("");
  };

  const handleFiltrarTorneios = async () => {
    const { dataInicio, dataFim } = filtrosTorneio;
    setFilterError("");
    setError("");

    if (dataInicio && dataFim && dataInicio > dataFim) {
      setFilterError("A data inicial não pode ser maior que a data final.");
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (dataInicio) nextParams.set("dataInicio", dataInicio);
    else nextParams.delete("dataInicio");
    if (dataFim) nextParams.set("dataFim", dataFim);
    else nextParams.delete("dataFim");
    setSearchParams(nextParams, { replace: true });
    await carregarTorneios(buildTorneiosParams(filtrosTorneio));
  };

  const handleLimparFiltrosTorneio = async () => {
    setFiltrosTorneio({ dataInicio: "", dataFim: "" });
    setFilterError("");
    setError("");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("dataInicio");
    nextParams.delete("dataFim");
    setSearchParams(nextParams, { replace: true });
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
    const next = Array.from(new Set([...torneiosSelecionados, ...idsFiltrados]));
    const adicionados = next.length - torneiosSelecionados.length;
    setTorneiosSelecionados(next);
    addToast(
      adicionados > 0
        ? `${adicionados} torneio(s) filtrado(s) adicionados.`
        : "Todos os torneios filtrados já estavam selecionados.",
      { type: adicionados > 0 ? "success" : "info" },
    );
  };

  const handleRemoverTodosFiltrados = () => {
    const idsFiltrados = new Set(torneiosDisponiveis.map((torneio) => String(torneio.id)));
    const next = torneiosSelecionados.filter((id) => !idsFiltrados.has(id));
    const removidos = torneiosSelecionados.length - next.length;
    setTorneiosSelecionados(next);
    addToast(
      removidos > 0
        ? `${removidos} torneio(s) filtrado(s) removidos.`
        : "Nenhum torneio filtrado estava selecionado.",
      { type: removidos > 0 ? "success" : "info" },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let bannerUrl;
      if (bannerFile) bannerUrl = await uploadBannerImage(bannerFile, token, setUploadProgress);
      const payload = {
        ...form,
        torneioIds: torneiosSelecionados,
        ...(bannerUrl ? { bannerUrl } : {}),
        ...(editMode && bannerRemovido ? { bannerUrl: "" } : {}),
      };
      if (editMode && ligaId) {
        await atualizarLiga(ligaId, payload, token);
      } else {
        await criarLiga(payload, token);
      }
      addToast(editMode ? "Liga atualizada com sucesso." : "Liga criada com sucesso.", { type: "success" });
      navigate("/ligas");
    } catch (err) {
      setError(editMode ? "Erro ao atualizar liga." : "Erro ao criar liga.");
      addToast(editMode ? "Erro ao atualizar liga." : "Erro ao criar liga.", { type: "error" });
      logError(err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
      <BackButton
        className="mb-6"
        onClick={() => navigate(editMode && ligaId ? `/ligas/${ligaId}` : "/ligas")}
      />

      <section className={FORM_PAGE_SHELL_CLASS}>
        <div className="max-w-[600px] mx-auto">
          <h2 className={FORM_PAGE_TITLE_CLASS}>
            {editMode ? "Editar Liga" : "Criar Nova Liga"}
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-6">

            <FormSection title="Informações">
              <FormField
                id="liga-nome"
                name="nome"
                label="Nome da Liga"
                size="page"
                placeholder="Ex: Liga Mensal Standard"
                value={form.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <div className="grid gap-2">
                <span className={FORM_LABEL_CLASS}>Banner da liga <span className="normal-case tracking-normal font-normal text-[#8f82ad]">(opcional)</span></span>
                {bannerPreview ? (
                  <div className="grid gap-3">
                    <img src={bannerPreview} alt="Preview do banner da liga" className="h-36 w-full rounded-xl border border-[rgba(199,149,255,0.3)] object-cover" />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={loading} className={BTN_SECONDARY}>Trocar imagem</button>
                      <button type="button" onClick={handleRemoveBanner} disabled={loading} className="px-4 py-2 rounded-lg border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.07)] text-[#fca5a5] font-semibold hover:bg-[rgba(239,68,68,0.16)] disabled:opacity-50">Remover</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={loading} className={`${BTN_SECONDARY} justify-self-start`}>Selecionar banner</button>
                )}
                <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleBannerChange} className="hidden" />
                {loading && bannerFile && uploadProgress > 0 && (
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full bg-gradient-to-r from-[#8e39ed] to-[#5f23b3]" style={{ width: `${uploadProgress}%` }} /></div>
                )}
              </div>
              <FormField
                id="liga-descricao"
                name="descricao"
                label="Descrição (opcional)"
                size="page"
                multiline
                rows={3}
                placeholder="Descreva a liga..."
                value={form.descricao}
                onChange={handleChange}
                disabled={loading}
              />
              <div className="grid gap-2">
                <span className={FORM_LABEL_CLASS}>Tipo de Liga</span>
                <div className="flex gap-3">
                  {[
                    { value: "individual", label: "Individual" },
                    { value: "times", label: "Times" },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-2 flex-1 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                        form.tipo === value
                          ? "border-[rgba(199,149,255,0.45)] bg-[rgba(167,79,255,0.12)]"
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
                        className="accent-[#8e39ed]"
                      />
                      <span className="text-[#f5edff] text-[0.9rem] font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </FormSection>

            <FormSection title="Torneios" subtitle="(opcional)">
              <div className="grid grid-cols-1 min-[560px]:grid-cols-2 gap-3">
                <FormField
                  id="torneio-data-inicio"
                  name="dataInicio"
                  label="Data inicial"
                  type="date"
                  size="page"
                  value={filtrosTorneio.dataInicio}
                  onChange={handleFiltroChange}
                  disabled={loading || loadingTorneios}
                />
                <FormField
                  id="torneio-data-fim"
                  name="dataFim"
                  label="Data final"
                  type="date"
                  size="page"
                  value={filtrosTorneio.dataFim}
                  onChange={handleFiltroChange}
                  disabled={loading || loadingTorneios}
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleFiltrarTorneios}
                  disabled={loading || loadingTorneios}
                  className={BTN_PRIMARY}
                >
                  {loadingTorneios ? "Filtrando..." : "Filtrar"}
                </button>
                <button
                  type="button"
                  onClick={handleLimparFiltrosTorneio}
                  disabled={loading || loadingTorneios}
                  className={BTN_SECONDARY}
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
                <button
                  type="button"
                  onClick={handleRemoverTodosFiltrados}
                  disabled={loading || loadingTorneios || torneiosDisponiveis.length === 0}
                  className="px-4 py-2 rounded-lg border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.07)] text-[#fca5a5] cursor-pointer font-semibold transition-all duration-200 hover:bg-[rgba(239,68,68,0.16)] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Remover filtrados
                </button>
              </div>
              {filterError ? <FormFeedback message={filterError} variant="error" /> : null}
              {loadingTorneios ? (
                <p className="text-[#888] text-[0.875rem] m-0">Carregando torneios...</p>
              ) : torneiosDisponiveis.length === 0 ? (
                <EmptyState
                  title="Nenhum torneio disponível"
                  description="Ajuste o período ou limpe os filtros para buscar outros torneios."
                  action={
                    <button
                      type="button"
                      onClick={handleLimparFiltrosTorneio}
                      className="px-4 py-2 rounded-lg border border-[rgba(217,180,255,0.2)] bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-semibold hover:text-white hover:border-[rgba(199,149,255,0.45)] transition-colors"
                    >
                      Limpar filtros
                    </button>
                  }
                />
              ) : (
                <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {torneiosDisponiveis.map((torneio) => {
                    const selected = torneiosSelecionados.includes(String(torneio.id));
                    return (
                      <label
                        key={torneio.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                          selected
                            ? "border-[rgba(199,149,255,0.45)] bg-[rgba(167,79,255,0.12)]"
                            : "border-[rgba(217,180,255,0.12)] bg-white/[0.02] hover:border-[rgba(217,180,255,0.25)] hover:bg-white/[0.04]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#8e39ed] cursor-pointer"
                          checked={selected}
                          onChange={() => toggleTorneio(torneio.id)}
                          disabled={loading || loadingTorneios}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="flex items-center gap-2 text-[#f5edff] text-[0.88rem] font-medium min-w-0">
                            <span className="truncate">{torneio.nome}</span>
                            {torneio.horario && (
                              <span className="shrink-0 text-[0.74rem] font-normal text-[#a99cbe]">· {formatBrasiliaDate(torneio.horario)}</span>
                            )}
                          </span>
                          <span className="text-[#beafd7] text-[0.77rem]">{(torneio.formato || "").toUpperCase()}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {torneiosSelecionados.length > 0 && (
                <p className="text-[#c795ff] text-[0.8rem] m-0">
                  {torneiosDisponiveis.length} filtrado(s), {torneiosSelecionados.length} selecionado(s)
                </p>
              )}
            </FormSection>

            {error ? <FormFeedback message={error} variant="error" /> : null}

            <button type="submit" className={BTN_SUBMIT} disabled={loading}>
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
