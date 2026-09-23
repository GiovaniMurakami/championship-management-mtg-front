import { useEffect, useState } from "react";
import {
  CUSTOM_ROUND_SOUND_ID,
  ROUND_SOUND_PRESETS,
  resolveRoundSoundSelection,
} from "../../constants/roundSounds";
import { TOURNAMENT_INPUT_CLASS } from "../../styles/uiClasses";
import { playRoundSound, unlockRoundSoundPlayer } from "../../utils/roundSoundPlayer";
import { InlineAlert } from "../ui/InlineAlert";

const ROW_CLASS =
  "flex items-stretch gap-1.5 rounded-lg border overflow-hidden transition-all duration-150";
const ROW_SELECTED_CLASS =
  "border-[#7c3aed] shadow-[0_0_0_1px_rgba(124,58,237,0.35)]";
const ROW_IDLE_CLASS =
  "border-[rgba(79,70,229,0.25)]";
const SELECT_BUTTON_CLASS =
  "flex flex-1 items-center gap-2 min-w-0 text-left px-3 py-2 text-[0.85rem] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
const SELECT_SELECTED_CLASS = "bg-[rgba(124,58,237,0.18)] text-white";
const SELECT_IDLE_CLASS =
  "bg-[rgba(79,70,229,0.06)] text-[#d4d4f5] hover:bg-[rgba(79,70,229,0.12)]";
const PLAY_BUTTON_CLASS =
  "shrink-0 px-3 border-l border-[rgba(79,70,229,0.25)] text-[#a5b4fc] hover:text-white hover:bg-[rgba(79,70,229,0.16)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

async function previewSound(url, setPreviewingId, soundId) {
  await unlockRoundSoundPlayer();
  setPreviewingId(soundId);
  const played = await playRoundSound(url);
  setPreviewingId((current) => (current === soundId ? null : current));
  return played;
}

export function RoundSoundPicker({ value, onChange, disabled = false, idPrefix = "round-sound" }) {
  const [selection, setSelection] = useState(() => resolveRoundSoundSelection(value));
  const [previewingId, setPreviewingId] = useState(null);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    setSelection(resolveRoundSoundSelection(value));
  }, [value]);

  const handleSelectPreset = async (preset) => {
    setPreviewError("");
    setSelection(preset.id);
    onChange(preset.url);
    if (!preset.url) return;

    const played = await previewSound(preset.url, setPreviewingId, preset.id);
    if (!played) {
      setPreviewError("Não foi possível reproduzir este som. Tente outro ou use uma URL personalizada.");
    }
  };

  const handleSelectCustom = () => {
    setPreviewError("");
    setSelection(CUSTOM_ROUND_SOUND_ID);
    if (!value || resolveRoundSoundSelection(value) !== CUSTOM_ROUND_SOUND_ID) {
      onChange("");
    }
  };

  const handlePlayPreset = async (event, preset) => {
    event.preventDefault();
    event.stopPropagation();
    if (!preset.url || disabled) return;

    setPreviewError("");
    const played = await previewSound(preset.url, setPreviewingId, preset.id);
    if (!played) {
      setPreviewError("Não foi possível reproduzir este som.");
    }
  };

  const handlePlayCustom = async () => {
    const trimmed = String(value ?? "").trim();
    if (!trimmed || disabled) return;

    setPreviewError("");
    const played = await previewSound(trimmed, setPreviewingId, CUSTOM_ROUND_SOUND_ID);
    if (!played) {
      setPreviewError("URL inválida ou áudio bloqueado pelo navegador.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ROUND_SOUND_PRESETS.map((preset) => {
          const isSelected = selection === preset.id;
          const isPreviewing = previewingId === preset.id;
          return (
            <div
              key={preset.id}
              className={`${ROW_CLASS} ${isSelected ? ROW_SELECTED_CLASS : ROW_IDLE_CLASS}`}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleSelectPreset(preset)}
                className={`${SELECT_BUTTON_CLASS} ${isSelected ? SELECT_SELECTED_CLASS : SELECT_IDLE_CLASS}`}
              >
                <span className="text-lg shrink-0" aria-hidden>{preset.emoji}</span>
                <span className="flex-1 min-w-0 truncate">{preset.label}</span>
              </button>
              {preset.url ? (
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Ouvir ${preset.label}`}
                  title={`Ouvir ${preset.label}`}
                  onClick={(event) => handlePlayPreset(event, preset)}
                  className={`${PLAY_BUTTON_CLASS} ${isSelected ? SELECT_SELECTED_CLASS : SELECT_IDLE_CLASS}`}
                >
                  {isPreviewing ? "…" : "▶"}
                </button>
              ) : null}
            </div>
          );
        })}

        <button
          type="button"
          disabled={disabled}
          onClick={handleSelectCustom}
          className={`${SELECT_BUTTON_CLASS} rounded-lg border ${selection === CUSTOM_ROUND_SOUND_ID ? `${ROW_SELECTED_CLASS} ${SELECT_SELECTED_CLASS}` : `${ROW_IDLE_CLASS} ${SELECT_IDLE_CLASS}`}`}
        >
          <span className="text-lg shrink-0" aria-hidden>🔗</span>
          <span className="flex-1">URL personalizada</span>
        </button>
      </div>

      {selection === CUSTOM_ROUND_SOUND_ID ? (
        <div className="flex flex-col gap-2">
          <input
            id={`${idPrefix}-custom`}
            type="url"
            placeholder="https://.../som.mp3"
            value={value ?? ""}
            onChange={(event) => {
              setPreviewError("");
              onChange(event.target.value);
            }}
            disabled={disabled}
            className={TOURNAMENT_INPUT_CLASS}
          />
          {value?.trim() ? (
            <button
              type="button"
              disabled={disabled}
              onClick={handlePlayCustom}
              className="self-start text-[0.8rem] text-[#a5b4fc] hover:text-white underline-offset-2 hover:underline disabled:opacity-50"
            >
              {previewingId === CUSTOM_ROUND_SOUND_ID ? "Carregando..." : "Ouvir prévia"}
            </button>
          ) : null}
        </div>
      ) : null}

      {previewError ? (
        <InlineAlert type="error" className="py-2 text-[0.78rem]">{previewError}</InlineAlert>
      ) : null}

      <p className="text-[0.78rem] text-[#8ea0c7] m-0">
        O som toca para todos os jogadores quando uma nova rodada é iniciada.
      </p>
    </div>
  );
}
