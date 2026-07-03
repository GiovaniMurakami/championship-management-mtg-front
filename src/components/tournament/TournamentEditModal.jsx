import { useEffect, useRef, useState } from "react";
import { uploadBannerImage, validateBannerImageFile } from "../../utils/bannerUpload";
import { calculateAutomaticSwissRounds, calculateSwissRounds } from "../../utils/tournamentFlow";
import { sanitizeText } from "../../utils/sanitize";
import { toDatetimeLocalBrasilia } from "../../utils/brasiliaTime";
import { TOURNAMENT_FORMATS, TOP_CUT_OPTIONS } from "../../constants/tournament";
import { BTN_GHOST, BTN_PRIMARY, FORM_COUNTER_CLASS, FORM_TEXTAREA_CLASS, TOURNAMENT_INPUT_CLASS } from "../../styles/uiClasses";
import { FormFeedback, FormSection, SelectField } from "../ui";
import { RoundSoundPicker } from "./RoundSoundPicker";

function toDatetimeLocal(dateStr) {
  return toDatetimeLocalBrasilia(dateStr);
}

const TEXTAREA_CLASS = `${FORM_TEXTAREA_CLASS} min-h-[120px]`;
const TOURNAMENT_SELECT_CLASS = `${TOURNAMENT_INPUT_CLASS} pr-10`;

const optionalTrimmed = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
};

export function TournamentEditModal({ torneio, isOpen, onClose, onSubmit, loading, token }) {
  const [form, setForm] = useState({
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
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bannerError, setBannerError] = useState("");
  const bannerInputRef = useRef(null);
  const existingBannerUrlRef = useRef("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!torneio || !isOpen) return;
    existingBannerUrlRef.current = torneio.bannerUrl || "";
    setBannerFile(null);
    setBannerPreview(torneio.bannerUrl || null);
    setBannerError("");
    setUploadProgress(0);
    setForm({
      nome: torneio.nome || "",
      horario: toDatetimeLocal(torneio.horario),
      formato: torneio.formato || "standard",
      descricao: torneio.descricao || torneio.premio || "",
      regras: torneio.regras || "",
      maxJogadores: torneio.maxJogadores ?? "",
      maxRodadas: torneio.maxRodadas ?? "",
      corteTop: torneio.corteTop ?? "",
      linkBanner: torneio.linkBanner || "",
      somRodada: torneio.somRodada || "",
      linkLive: torneio.linkLive || "",
      secreto: torneio.secreto ?? false,
      exibirNomeJogador: torneio.exibirNomeJogador || "nome",
    });
  }, [torneio, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const isUploading = uploadingBanner;
  const isDisabled = loading || isUploading;
  const totalCheckin = Number(torneio?.totalCheckin || 0);
  const automaticSwissRounds = calculateAutomaticSwissRounds(totalCheckin);
  const limitedSwissRounds = calculateSwissRounds(totalCheckin, form.maxRodadas);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setBannerError("");
    setUploadProgress(0);
    existingBannerUrlRef.current = "";
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let bannerUrl = existingBannerUrlRef.current;
    setBannerError("");

    if (bannerFile && token) {
      setUploadingBanner(true);
      setUploadProgress(0);
      try {
        bannerUrl = await uploadBannerImage(bannerFile, token, setUploadProgress);
      } catch (err) {
        setBannerError(err.userMessage || err.message || "Falha ao enviar o banner.");
        setUploadingBanner(false);
        return;
      }
      setUploadingBanner(false);
    }

    const payload = {
      ...form,
      nome: sanitizeText(form.nome),
      descricao: optionalTrimmed(sanitizeText(form.descricao)),
      regras: optionalTrimmed(sanitizeText(form.regras)),
      linkBanner: optionalTrimmed(form.linkBanner),
      somRodada: optionalTrimmed(form.somRodada),
      linkLive: optionalTrimmed(form.linkLive),
      maxJogadores: form.maxJogadores ? Number(form.maxJogadores) : undefined,
      maxRodadas: form.maxRodadas ? Number(form.maxRodadas) : undefined,
      corteTop: form.corteTop ? Number(form.corteTop) : undefined,
    };

    if (bannerUrl || torneio?.bannerUrl) {
      payload.bannerUrl = bannerUrl;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="bg-[#110a22] border border-[rgba(217,180,255,0.2)] rounded-2xl w-full max-w-[620px] max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(217,180,255,0.15)]">
          <h2 className="text-white font-semibold text-[1.2rem] m-0">Editar Torneio</h2>
          <button type="button" className="text-[#beafd7] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08]" onClick={onClose} aria-label="Fechar">X</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid gap-5">
          <FormSection title="Informacoes Basicas">
            <input name="nome" type="text" value={form.nome} onChange={handleChange} required disabled={isDisabled} className={TOURNAMENT_INPUT_CLASS} />
            <div className="flex items-center gap-3 py-1">
              <input id="secreto" name="secreto" type="checkbox" checked={form.secreto} onChange={handleChange} disabled={isDisabled} className="w-4 h-4 rounded accent-[#8e39ed] cursor-pointer" />
              <label htmlFor="secreto" className="text-[#e0e0e0] font-medium text-[0.95rem] cursor-pointer select-none">
                Torneio Secreto
                <span className="block text-[0.78rem] font-normal text-[#888] mt-[0.1rem]">Nao aparece em listagens publicas; compartilhe o link diretamente.</span>
              </label>
            </div>
            <div className="grid gap-2">
              <label htmlFor="exibirNomeJogador" className="text-[#e0e0e0] font-medium text-[0.95rem]">Exibir Nome do Jogador Como</label>
              <SelectField
                id="exibirNomeJogador"
                name="exibirNomeJogador"
                value={form.exibirNomeJogador}
                onChange={handleChange}
                disabled={isDisabled}
                className={TOURNAMENT_SELECT_CLASS}
                iconClassName="text-[#c795ff]"
                options={[
                  { value: "nome", label: "Nome completo" },
                  { value: "nickMOL", label: "Nick MOL" },
                  { value: "nickArena", label: "Nick Arena" },
                ]}
              />
            </div>
            <input name="horario" type="datetime-local" value={form.horario} onChange={handleChange} required disabled={isDisabled} className={TOURNAMENT_INPUT_CLASS} />
            <SelectField
              name="formato"
              value={form.formato}
              onChange={handleChange}
              disabled={isDisabled}
              className={TOURNAMENT_SELECT_CLASS}
              iconClassName="text-[#c795ff]"
              options={TOURNAMENT_FORMATS.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
            />
            <textarea name="descricao" rows="4" maxLength={4000} value={form.descricao} onChange={handleChange} disabled={isDisabled} className={TEXTAREA_CLASS} placeholder="Resumo do torneio, premiacao e informacoes importantes..." />
            <span className={FORM_COUNTER_CLASS}>{form.descricao.length}/4000</span>
            <textarea name="regras" rows="5" maxLength={4000} value={form.regras} onChange={handleChange} disabled={isDisabled} className={TEXTAREA_CLASS} placeholder="Tempo de rodada, regras da casa, orientacoes e excecoes..." />
            <span className={FORM_COUNTER_CLASS}>{form.regras.length}/4000</span>
          </FormSection>

          <FormSection title="Estrutura">
            <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
              <input name="maxJogadores" type="number" min="2" value={form.maxJogadores} onChange={handleChange} disabled={isDisabled} className={TOURNAMENT_INPUT_CLASS} placeholder="Max. jogadores" />
              <div className="grid gap-1.5">
                <input name="maxRodadas" type="number" min="1" value={form.maxRodadas} onChange={handleChange} disabled={isDisabled} className={TOURNAMENT_INPUT_CLASS} placeholder="Limite de rodadas" />
                <small className="text-[#a3a3a3] text-[0.8rem]">O sistema calcula o suico automaticamente. Este campo apenas limita o teto.</small>
                {totalCheckin > 0 && <small className="text-[#a5b4fc] text-[0.8rem]">Com {totalCheckin} jogador(es), o suico teria {automaticSwissRounds} rodada(s){form.maxRodadas ? ` e ficaria limitado a ${limitedSwissRounds}.` : "."}</small>}
              </div>
            </div>
            <SelectField
              name="corteTop"
              value={form.corteTop}
              onChange={handleChange}
              disabled={isDisabled}
              className={TOURNAMENT_SELECT_CLASS}
              iconClassName="text-[#c795ff]"
              options={TOP_CUT_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </FormSection>

          <FormSection title="Midia">

            {bannerPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-[rgba(79,70,229,0.3)]">
                <img src={bannerPreview} alt="Preview do banner" className="block w-full max-h-[160px] object-cover" />
                <button type="button" className="absolute top-2 right-2 bg-[rgba(0,0,0,0.65)] text-[#fca5a5] border border-[rgba(239,68,68,0.4)] rounded-[6px] py-[3px] px-[10px] text-[0.75rem] font-semibold cursor-pointer transition-all duration-150 hover:bg-[rgba(239,68,68,0.35)] disabled:opacity-50" onClick={removeBanner} disabled={isDisabled}>X Remover</button>
              </div>
            ) : (
              <button type="button" className="flex items-center justify-center gap-[0.6rem] w-full py-[0.75rem] px-4 border-2 border-dashed border-[rgba(79,70,229,0.4)] rounded-lg bg-[rgba(79,70,229,0.04)] text-[#a5b4fc] text-[0.85rem] cursor-pointer transition-all duration-200 hover:border-[#a5b4fc] hover:bg-[rgba(79,70,229,0.1)] hover:text-[#c7d2fe] disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => bannerInputRef.current?.click()} disabled={isDisabled}>
                Selecionar imagem
              </button>
            )}

            <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleBannerFileChange} disabled={isDisabled} />
            {bannerError ? <FormFeedback message={bannerError} variant="error" /> : null}
            {isUploading && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[0.75rem] text-[#a5b4fc]">
                  <span>Enviando banner...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#8e39ed] to-[#5f23b3] transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <input name="linkBanner" type="url" placeholder="Link do banner" value={form.linkBanner} onChange={handleChange} disabled={isDisabled} className={TOURNAMENT_INPUT_CLASS} />
            <div className="flex flex-col gap-2">
              <label className="text-[#e0e0e0] font-medium text-[0.95rem]">Som de nova rodada</label>
              <RoundSoundPicker
                idPrefix="edit-som-rodada"
                value={form.somRodada}
                onChange={(somRodada) => setForm((prev) => ({ ...prev, somRodada }))}
                disabled={isDisabled}
              />
            </div>
            <input name="linkLive" type="url" placeholder="Live no YouTube" value={form.linkLive} onChange={handleChange} disabled={isDisabled} className={TOURNAMENT_INPUT_CLASS} />
          </FormSection>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} disabled={isDisabled} className={BTN_GHOST}>Cancelar</button>
            <button type="submit" disabled={isDisabled} className={BTN_PRIMARY}>
              {isUploading ? "Enviando banner..." : loading ? "Salvando..." : "Salvar Alteracoes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
