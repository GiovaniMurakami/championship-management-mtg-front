import { useCallback, useRef, useState } from "react";
import { criarTorneio } from "../../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../../utils/bannerUpload";
import { sanitizeText } from "../../utils/sanitize";
import { TOURNAMENT_FORMATS, TOP_CUT_OPTIONS } from "../../constants/tournament";
import { Button, Checkbox, SelectField, FormFeedback, FormSection } from "../ui";
import { RoundSoundPicker } from "./RoundSoundPicker";
import { StoryFundoPicker } from "./StoryFundoPicker";
import { Top8StoryPreview } from "./Top8StoryPreview";
import {
  FORM_COUNTER_CLASS,
  FORM_LABEL_CLASS,
  FORM_PAGE_SHELL_CLASS,
  FORM_PAGE_TITLE_CLASS,
  FORM_TEXTAREA_CLASS,
  TOURNAMENT_INPUT_CLASS,
} from "../../styles/uiClasses";

const INITIAL_FORM = {
  nome: "",
  horario: "",
  formato: "standard",
  descricao: "",
  regras: "",
  maxJogadores: "",
  maxRodadas: "",
  corteTop: "",
  linkBanner: "",
  somRodada: "",
  linkLive: "",
  secreto: false,
  exibirNomeJogador: "nome",
};

const TEXTAREA_CLASS = `${FORM_TEXTAREA_CLASS} min-h-[120px]`;
const TOURNAMENT_SELECT_CLASS = `${TOURNAMENT_INPUT_CLASS} pr-10`;

const optionalTrimmed = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
};

function FieldLabel({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className={FORM_LABEL_CLASS}>
      {children}
      {hint ? <span className="font-normal normal-case tracking-normal text-text-muted"> {hint}</span> : null}
    </label>
  );
}

export function TournamentCreateForm({ token, onTournamentCreated, initialValues }) {
  const {
    storyFundoUrl: initialStoryFundoUrl = "",
    storyFundoTextoRodape: initialStoryFundoTextoRodape = "claro",
    bannerUrl: initialBannerUrl = "",
    ...formInitialValues
  } = initialValues ?? {};
  const [createForm, setCreateForm] = useState(() => ({ ...INITIAL_FORM, ...formInitialValues }));
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(initialBannerUrl || null);
  const [existingBannerUrl, setExistingBannerUrl] = useState(initialBannerUrl || "");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bannerError, setBannerError] = useState("");
  const [storyPreview, setStoryPreview] = useState(initialStoryFundoUrl || "");
  const [storyPreviewTextoRodape, setStoryPreviewTextoRodape] = useState(initialStoryFundoTextoRodape);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [storyUploadProgress, setStoryUploadProgress] = useState(0);
  const [storyError, setStoryError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bannerInputRef = useRef(null);
  const storyFundoPickerRef = useRef(null);

  const isSubmitting = loading || uploadingBanner || uploadingStory;

  const handleStoryPreviewUrlChange = useCallback((url) => {
    setStoryPreview(url || "");
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBannerFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerError("");
    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setBannerError(validationError.userMessage);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
      return;
    }
    setBannerFile(file);
    setExistingBannerUrl("");
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setExistingBannerUrl("");
    setBannerError("");
    setUploadProgress(0);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setBannerError("");
    setStoryError("");

    try {
      let bannerUrl = existingBannerUrl || undefined;
      let storyFundoUrl;
      let storyFundoTextoRodape = "escuro";

      if (bannerFile) {
        setUploadingBanner(true);
        setUploadProgress(0);
        bannerUrl = await uploadBannerImage(bannerFile, token, setUploadProgress);
        setUploadingBanner(false);
      }

      setUploadingStory(true);
      setStoryUploadProgress(0);
      const storyResult = await storyFundoPickerRef.current?.resolveForSubmit(setStoryUploadProgress);
      storyFundoUrl = storyResult?.url || "";
      storyFundoTextoRodape = storyResult?.textoRodape || "escuro";
      setUploadingStory(false);

      const payload = {
        ...createForm,
        nome: sanitizeText(createForm.nome),
        descricao: optionalTrimmed(sanitizeText(createForm.descricao)),
        regras: optionalTrimmed(sanitizeText(createForm.regras)),
        linkBanner: optionalTrimmed(createForm.linkBanner),
        somRodada: optionalTrimmed(createForm.somRodada),
        linkLive: optionalTrimmed(createForm.linkLive),
        ...(bannerUrl ? { bannerUrl } : {}),
        ...(storyFundoUrl ? { storyFundoUrl } : {}),
        storyFundoTextoRodape,
        maxJogadores: createForm.maxJogadores ? Number(createForm.maxJogadores) : undefined,
        maxRodadas: createForm.maxRodadas ? Number(createForm.maxRodadas) : undefined,
        corteTop: createForm.corteTop ? Number(createForm.corteTop) : undefined,
      };

      await criarTorneio(payload, token);
      setCreateForm(INITIAL_FORM);
      removeBanner();
      storyFundoPickerRef.current?.clear();
      setStoryPreview("");
      onTournamentCreated?.();
    } catch (err) {
      if (err?.code || err?.userMessage) {
        const message = err.userMessage || err.message;
        if (uploadingStory) setStoryError(message);
        else if (err?.code) setBannerError(message);
        else setStoryError(message);
      } else {
        setError(err.message || "Erro ao criar torneio. Tente novamente.");
      }
    } finally {
      setLoading(false);
      setUploadingBanner(false);
      setUploadingStory(false);
    }
  };

  return (
    <section className={`${FORM_PAGE_SHELL_CLASS} max-[480px]:p-4`}>
      <div className="max-w-[700px] mx-auto">
        <h2 className={`${FORM_PAGE_TITLE_CLASS} max-[480px]:text-[1.5rem]`}>Criar Novo Torneio</h2>

        <form onSubmit={handleSubmit} className="grid gap-6 max-[768px]:gap-5 max-[480px]:gap-4">
          <FormSection title="Informações Básicas">

            <div className="grid gap-2">
              <FieldLabel htmlFor="nome">Nome do Torneio</FieldLabel>
              <input id="nome" name="nome" type="text" placeholder="Ex: FNM Standard" value={createForm.nome} onChange={handleChange} required disabled={isSubmitting} className={TOURNAMENT_INPUT_CLASS} />
            </div>

            <div className="flex items-center gap-3 py-1">
              <Checkbox id="secreto" name="secreto" checked={createForm.secreto} onChange={handleChange} disabled={isSubmitting} />
              <label htmlFor="secreto" className="text-[#e0e0e0] font-medium text-[0.95rem] cursor-pointer select-none">
                Torneio Secreto
                <span className="block text-[0.78rem] font-normal text-[#888] mt-[0.1rem]">Não aparece em listagens públicas; compartilhe o link diretamente.</span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#e0e0e0] font-medium text-[0.95rem]">Exibir Nome do Jogador Como</label>
              <SelectField
                name="exibirNomeJogador"
                value={createForm.exibirNomeJogador}
                onChange={handleChange}
                disabled={isSubmitting}
                className={TOURNAMENT_SELECT_CLASS}
                iconClassName="text-brand"
                options={[
                  { value: "nome", label: "Nome completo" },
                  { value: "nickMOL", label: "Nick MOL" },
                  { value: "nickArena", label: "Nick Arena" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="horario" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                Data e Hora
                <span className="block text-[0.78rem] font-normal text-[#888] mt-[0.1rem]">Horário de Brasília (UTC-3)</span>
              </label>
              <input id="horario" name="horario" type="datetime-local" value={createForm.horario} onChange={handleChange} required disabled={isSubmitting} className={TOURNAMENT_INPUT_CLASS} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="formato" className="text-[#e0e0e0] font-medium text-[0.95rem]">Formato</label>
              <SelectField
                id="formato"
                name="formato"
                value={createForm.formato}
                onChange={handleChange}
                disabled={isSubmitting}
                className={TOURNAMENT_SELECT_CLASS}
                iconClassName="text-brand"
                options={TOURNAMENT_FORMATS.map((formato) => ({
                  value: formato.value,
                  label: formato.label,
                }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="descricao" className="text-[#e0e0e0] font-medium text-[0.95rem]">Descrição <span className="text-text-soft text-[0.82rem]">(opcional)</span></label>
              <textarea id="descricao" name="descricao" rows="4" maxLength={4000} placeholder="Resumo do torneio, premiação e informações importantes..." value={createForm.descricao} onChange={handleChange} disabled={isSubmitting} className={TEXTAREA_CLASS} />
              <span className={FORM_COUNTER_CLASS}>{createForm.descricao.length}/4000</span>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="regras" className="text-[#e0e0e0] font-medium text-[0.95rem]">Regras do Torneio <span className="text-text-soft text-[0.82rem]">(opcional)</span></label>
              <textarea id="regras" name="regras" rows="5" maxLength={4000} placeholder="Tempo de rodada, regras da casa, orientações e exceções..." value={createForm.regras} onChange={handleChange} disabled={isSubmitting} className={TEXTAREA_CLASS} />
              <span className={FORM_COUNTER_CLASS}>{createForm.regras.length}/4000</span>
            </div>
          </FormSection>

          <FormSection title="Estrutura">

            <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
              <div className="flex flex-col gap-2">
                <label htmlFor="maxJogadores" className="text-[#e0e0e0] font-medium text-[0.95rem]">Max. Jogadores <span className="text-text-soft text-[0.82rem]">(opcional)</span></label>
                <input id="maxJogadores" name="maxJogadores" type="number" min="2" placeholder="Ex: 32" value={createForm.maxJogadores} onChange={handleChange} disabled={isSubmitting} className={TOURNAMENT_INPUT_CLASS} />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="maxRodadas" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                  Total de rodadas Swiss <span className="text-text-soft text-[0.82rem]">(opcional)</span>
                </label>
                <input
                  id="maxRodadas"
                  name="maxRodadas"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="Ex: 8"
                  value={createForm.maxRodadas}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={TOURNAMENT_INPUT_CLASS}
                />
                <small className="text-[#a3a3a3] text-[0.8rem]">
                  Pode forçar mais ou menos rodadas que o cálculo automático (com base nos jogadores com check-in no início).
                  Se vazio, o sistema usa o automático.
                </small>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="corteTop" className="text-[#e0e0e0] font-medium text-[0.95rem]">Corte para Top <span className="text-text-soft text-[0.82rem]">(opcional)</span></label>
              <SelectField
                id="corteTop"
                name="corteTop"
                value={createForm.corteTop}
                onChange={handleChange}
                disabled={isSubmitting}
                className={TOURNAMENT_SELECT_CLASS}
                iconClassName="text-brand"
                options={TOP_CUT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
            </div>
          </FormSection>

          <FormSection title="Banner">

            <div className="flex flex-col gap-2">
              <label className="text-[#e0e0e0] font-medium text-[0.95rem]">Imagem do Banner <span className="text-text-soft text-[0.82rem]">(opcional)</span></label>

              {bannerPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-[rgba(79,70,229,0.3)]">
                  <img src={bannerPreview} alt="Preview do banner" className="block w-full max-h-[180px] object-cover" />
                  <button type="button" className="absolute top-2 right-2 bg-[rgba(0,0,0,0.65)] text-[#fca5a5] border border-[rgba(239,68,68,0.4)] rounded-md py-[3px] px-[10px] text-[0.75rem] font-semibold cursor-pointer transition-all duration-150 hover:bg-[rgba(239,68,68,0.35)] disabled:opacity-50" onClick={removeBanner} disabled={isSubmitting} aria-label="Remover banner">
                    X Remover
                  </button>
                </div>
              ) : (
                <button type="button" className="flex items-center justify-center gap-[0.6rem] w-full py-[0.85rem] px-4 border-2 border-dashed border-[rgba(79,70,229,0.4)] rounded-lg bg-[rgba(79,70,229,0.04)] text-[#a5b4fc] text-[0.9rem] cursor-pointer transition-all duration-200 hover:border-[#a5b4fc] hover:bg-[rgba(79,70,229,0.1)] hover:text-[#c7d2fe] disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => bannerInputRef.current?.click()} disabled={isSubmitting}>
                  Selecionar imagem
                </button>
              )}

              <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleBannerFileChange} disabled={isSubmitting} />

              {bannerError ? <FormFeedback message={bannerError} variant="error" /> : null}

              {uploadingBanner && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[0.78rem] text-[#a5b4fc]">
                    <span>Enviando banner...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="linkBanner" className="text-[#e0e0e0] font-medium text-[0.95rem]">Link do Banner <span className="text-text-soft text-[0.82rem]">(opcional)</span></label>
              <input id="linkBanner" name="linkBanner" type="url" placeholder="https://..." value={createForm.linkBanner} onChange={handleChange} disabled={isSubmitting} className={TOURNAMENT_INPUT_CLASS} />
            </div>
          </FormSection>

          <FormSection title="Story Top 8">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="flex flex-col gap-2">
                <StoryFundoPicker
                  ref={storyFundoPickerRef}
                  token={token}
                  valueUrl={initialStoryFundoUrl || ""}
                  valueTextoRodape={initialStoryFundoTextoRodape}
                  disabled={isSubmitting}
                  onPreviewUrlChange={handleStoryPreviewUrlChange}
                  onTextoRodapeChange={setStoryPreviewTextoRodape}
                />
                {storyError ? <FormFeedback message={storyError} variant="error" /> : null}
                {uploadingStory && (
                  <div className="flex flex-col gap-1.5 max-w-[280px]">
                    <div className="flex justify-between text-[0.78rem] text-[#a5b4fc]">
                      <span>Enviando / salvando fundo...</span>
                      <span>{storyUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] transition-[width] duration-200" style={{ width: `${storyUploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <Top8StoryPreview
                horario={createForm.horario}
                storyFundoUrl={storyPreview || ""}
                textoRodape={storyPreviewTextoRodape}
              />
            </div>
          </FormSection>

          <FormSection title="Midia">

            <div className="flex flex-col gap-2">
              <label className="text-[#e0e0e0] font-medium text-[0.95rem]">
                Som de Nova Rodada <span className="text-text-soft text-[0.82rem]">(opcional)</span>
              </label>
              <RoundSoundPicker
                idPrefix="create-som-rodada"
                value={createForm.somRodada}
                onChange={(somRodada) => setCreateForm((prev) => ({ ...prev, somRodada }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="linkLive" className="text-[#e0e0e0] font-medium text-[0.95rem]">Live no YouTube <span className="text-text-soft text-[0.82rem]">(opcional)</span></label>
              <input id="linkLive" name="linkLive" type="url" placeholder="https://youtube.com/watch?v=..." value={createForm.linkLive} onChange={handleChange} disabled={isSubmitting} className={TOURNAMENT_INPUT_CLASS} />
            </div>
          </FormSection>

          {error ? <FormFeedback message={error} variant="error" /> : null}

          <Button type="submit" size="lg" block loading={isSubmitting}>
            {uploadingBanner ? "Enviando banner..." : loading ? "Criando..." : "Criar Torneio"}
          </Button>
        </form>
      </div>
    </section>
  );
}
