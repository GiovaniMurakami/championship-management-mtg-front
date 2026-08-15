import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cadastrarStoryFundo, listarStoryFundos } from "../../services/backendApi";
import { uploadStoryFundoImage, validateBannerImageFile } from "../../utils/bannerUpload";
import { FormFeedback, SelectField } from "../ui";
import { FORM_LABEL_CLASS, TOURNAMENT_INPUT_CLASS } from "../../styles/uiClasses";

const TOURNAMENT_SELECT_CLASS = `${TOURNAMENT_INPUT_CLASS} pr-10`;
const MODE_DEFAULT = "__default__";
const MODE_NEW = "__new__";
const MODE_EXISTING = "__existing__";

/**
 * Seletor de fundo do story: catálogo nomeado, padrão ou cadastro de novo (nome + imagem).
 * ref.resolveForSubmit(onProgress) → URL final ("" = padrão).
 */
export const StoryFundoPicker = forwardRef(function StoryFundoPicker(
  {
    token,
    valueUrl = "",
    disabled = false,
    onPreviewUrlChange,
  },
  ref,
) {
  const [fundos, setFundos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(() => (valueUrl ? MODE_EXISTING : MODE_DEFAULT));
  const [novoNome, setNovoNome] = useState("");
  const [novoFile, setNovoFile] = useState(null);
  const [novoPreview, setNovoPreview] = useState(null);
  const [localError, setLocalError] = useState("");
  const fileRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    listarStoryFundos(token)
      .then((data) => {
        if (cancelled) return;
        const list = data?.fundos || data || [];
        setFundos(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setFundos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!valueUrl) {
      setSelectedId((prev) => (prev === MODE_EXISTING ? MODE_DEFAULT : prev));
      return;
    }
    if (!fundos.length) {
      setSelectedId(MODE_EXISTING);
      return;
    }
    const match = fundos.find((f) => f.url === valueUrl);
    setSelectedId(match ? match.id : MODE_EXISTING);
  }, [valueUrl, fundos]);

  const previewUrl =
    selectedId === MODE_DEFAULT
      ? ""
      : selectedId === MODE_NEW
        ? (novoPreview || "")
        : selectedId === MODE_EXISTING
          ? (valueUrl || "")
          : (fundos.find((f) => f.id === selectedId)?.url || valueUrl || "");

  useEffect(() => {
    if (loading) return;
    onPreviewUrlChange?.(previewUrl);
  }, [previewUrl, onPreviewUrlChange, loading]);

  stateRef.current = { selectedId, fundos, novoNome, novoFile, valueUrl };

  useImperativeHandle(ref, () => ({
    async resolveForSubmit(onProgress) {
      const { selectedId: mode, fundos: list, novoNome: nomeRaw, novoFile: file, valueUrl: fallback } =
        stateRef.current;

      if (mode === MODE_DEFAULT) return "";
      if (mode === MODE_EXISTING) return fallback || "";

      if (mode !== MODE_NEW) {
        const fundo = list.find((f) => f.id === mode);
        return fundo?.url || fallback || "";
      }

      const nome = String(nomeRaw || "").trim();
      if (!nome) {
        const err = new Error("Informe o nome do fundo do story.");
        err.userMessage = err.message;
        throw err;
      }
      if (!file) {
        const err = new Error("Selecione a imagem do novo fundo do story.");
        err.userMessage = err.message;
        throw err;
      }

      const url = await uploadStoryFundoImage(file, token, onProgress);
      const criado = await cadastrarStoryFundo({ nome, url }, token);
      const criadoData = criado?.data ?? criado;
      setFundos((prev) => {
        const next = [...prev.filter((f) => f.id !== criadoData.id), criadoData];
        next.sort((a, b) => String(a.nome).localeCompare(String(b.nome), "pt-BR"));
        return next;
      });
      setSelectedId(criadoData.id);
      setNovoFile(null);
      setNovoPreview(null);
      setNovoNome("");
      return criadoData.url;
    },
    clear() {
      setSelectedId(MODE_DEFAULT);
      setNovoNome("");
      setNovoFile(null);
      setNovoPreview(null);
      setLocalError("");
      if (fileRef.current) fileRef.current.value = "";
    },
  }));

  const handleSelect = (event) => {
    const next = event.target.value;
    setSelectedId(next);
    setLocalError("");
    if (next !== MODE_NEW) {
      setNovoFile(null);
      setNovoPreview(null);
      setNovoNome("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLocalError("");
    const validationError = validateBannerImageFile(file);
    if (validationError) {
      setLocalError(validationError.userMessage);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setNovoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNovoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const options = [
    { value: MODE_DEFAULT, label: "Fundo padrão" },
    ...(selectedId === MODE_EXISTING && valueUrl
      ? [{ value: MODE_EXISTING, label: "Fundo atual (do torneio copiado)" }]
      : []),
    ...fundos.map((f) => ({ value: f.id, label: f.nome })),
    { value: MODE_NEW, label: "+ Cadastrar novo fundo…" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className={FORM_LABEL_CLASS} htmlFor="story-fundo-select">
          Fundo do story <span className="font-normal normal-case tracking-normal text-[#8f82ad]">(opcional)</span>
        </label>
        <SelectField
          id="story-fundo-select"
          name="storyFundoSelect"
          value={selectedId}
          onChange={handleSelect}
          disabled={disabled || loading}
          className={TOURNAMENT_SELECT_CLASS}
          iconClassName="text-[#c795ff]"
          options={options}
        />
        {loading ? <p className="m-0 text-[0.78rem] text-[#8f82ad]">Carregando fundos…</p> : null}
      </div>

      {selectedId === MODE_NEW && (
        <div className="flex flex-col gap-2 rounded-lg border border-[rgba(79,70,229,0.25)] bg-[rgba(79,70,229,0.05)] p-3">
          <label className={FORM_LABEL_CLASS} htmlFor="story-fundo-nome">
            Nome do fundo
          </label>
          <input
            id="story-fundo-nome"
            type="text"
            maxLength={100}
            placeholder="Ex: FUGUETE CHAMP"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            disabled={disabled}
            className={TOURNAMENT_INPUT_CLASS}
            required
          />
          {novoPreview ? (
            <div className="relative max-w-[220px] overflow-hidden rounded-lg border border-[rgba(79,70,229,0.3)]">
              <img src={novoPreview} alt="Novo fundo" className="block w-full max-h-[160px] object-cover" />
              <button
                type="button"
                className="absolute top-2 right-2 rounded-[6px] border border-[rgba(239,68,68,0.4)] bg-[rgba(0,0,0,0.65)] px-[10px] py-[3px] text-[0.75rem] font-semibold text-[#fca5a5]"
                onClick={() => {
                  setNovoFile(null);
                  setNovoPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                disabled={disabled}
              >
                X Remover
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="flex w-full max-w-[280px] items-center justify-center gap-[0.6rem] rounded-lg border-2 border-dashed border-[rgba(79,70,229,0.4)] bg-[rgba(79,70,229,0.04)] px-4 py-[0.85rem] text-[0.9rem] text-[#a5b4fc] disabled:opacity-50"
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
            >
              Selecionar imagem
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFile}
            disabled={disabled}
          />
          <p className="m-0 text-[0.75rem] text-[#8f82ad]">
            O nome fica salvo no catálogo para reutilizar em outros torneios.
          </p>
        </div>
      )}

      {localError ? <FormFeedback message={localError} variant="error" /> : null}
    </div>
  );
});
