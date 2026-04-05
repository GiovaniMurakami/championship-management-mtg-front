import { useState, useEffect, useRef } from "react";
import { uploadBannerImage, validateBannerImageFile } from "../../utils/bannerUpload";
import { calculateAutomaticSwissRounds, calculateSwissRounds } from "../../utils/tournamentFlow";
import { sanitizeText } from "../../utils/sanitize";

const TOURNAMENT_FORMATS = [
    { value: "standard", label: "Standard" },
    { value: "modern", label: "Modern" },
    { value: "pioneer", label: "Pioneer" },
    { value: "pauper", label: "Pauper" },
    { value: "commander", label: "Commander" },
];

const TOP_CUT_OPTIONS = [
    { value: "", label: "Sem corte" },
    { value: "2", label: "Top 2" },
    { value: "4", label: "Top 4" },
    { value: "8", label: "Top 8" },
    { value: "16", label: "Top 16" },
];

const inputClass =
    "px-4 py-3 border-2 border-[#333] rounded-lg bg-white/[0.05] text-white text-base transition-all duration-300 focus:outline-none focus:border-[#4f46e5] focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] focus:bg-white/[0.1] placeholder:text-[#888] [color-scheme:dark]";

function toDatetimeLocal(dateStr) {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    } catch {
        return "";
    }
}

export function TournamentEditModal({ torneio, isOpen, onClose, onSubmit, loading, token }) {
    const [form, setForm] = useState({
        nome: "",
        horario: "",
        formato: "standard",
        premio: "",
        maxJogadores: "",
        maxRodadas: "",
        corteTop: "",
        linkBanner: "",
        somRodada: "",
        linkLive: "",
        secreto: false,
    });
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [bannerError, setBannerError] = useState("");
    const bannerInputRef = useRef(null);
    const existingBannerUrlRef = useRef("");

    useEffect(() => {
        if (torneio && isOpen) {
            existingBannerUrlRef.current = torneio.bannerUrl || "";
            queueMicrotask(() => {
                setBannerFile(null);
                setBannerPreview(torneio.bannerUrl || null);
                setBannerError("");
                setUploadProgress(0);
                setForm({
                    nome: torneio.nome || "",
                    horario: toDatetimeLocal(torneio.horario),
                    formato: torneio.formato || "standard",
                    premio: torneio.premio || "",
                    maxJogadores: torneio.maxJogadores ?? "",
                    maxRodadas: torneio.maxRodadas ?? "",
                    corteTop: torneio.corteTop ?? "",
                    linkBanner: torneio.linkBanner || "",
                    somRodada: torneio.somRodada || "",
                    linkLive: torneio.linkLive || "",
                    secreto: torneio.secreto ?? false,
                });
            });
        }
    }, [torneio, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleBannerFileChange = (e) => {
        const file = e.target.files?.[0];
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

    const isUploading = uploadingBanner;
    const isDisabled = loading || isUploading;
    const totalCheckin = Number(torneio?.totalCheckin || 0);
    const automaticSwissRounds = calculateAutomaticSwissRounds(totalCheckin);
    const limitedSwissRounds = calculateSwissRounds(totalCheckin, form.maxRodadas);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let bannerUrl = existingBannerUrlRef.current;
        setBannerError("");

        if (bannerFile && token) {
            setUploadingBanner(true);
            setUploadProgress(0);
            try {
                bannerUrl = await uploadBannerImage(bannerFile, token, setUploadProgress);
            } catch (err) {
                setBannerError(err.userMessage || err.message || "Falha ao enviar o banner. Tente novamente.");
                setUploadingBanner(false);
                return;
            }
            setUploadingBanner(false);
        }

        const payload = {
            ...form,
            nome: sanitizeText(form.nome),
            premio: sanitizeText(form.premio),
            bannerUrl,
            maxJogadores: form.maxJogadores ? Number(form.maxJogadores) : undefined,
            maxRodadas: form.maxRodadas ? Number(form.maxRodadas) : undefined,
            corteTop: form.corteTop ? Number(form.corteTop) : undefined,
        };
        onSubmit(payload);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[#110a22] border border-[rgba(217,180,255,0.2)] rounded-2xl w-full max-w-[580px] max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[slide-up_220ms_ease-out]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(217,180,255,0.15)]">
                    <h2 className="text-white font-semibold text-[1.2rem] m-0">Editar Torneio</h2>
                    <button
                        type="button"
                        className="text-[#beafd7] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.08]"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid gap-5">
                    {/* Informações Básicas */}
                    <div className="flex flex-col gap-4 p-4 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)]">
                        <h3 className="text-[0.75rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                            Informações Básicas
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-nome" className="text-[#e0e0e0] font-medium text-[0.9rem]">Nome do Torneio</label>
                            <input id="edit-nome" name="nome" type="text" value={form.nome} onChange={handleChange} required disabled={loading} className={inputClass} />
                        </div>
                        <div className="flex items-center gap-3 py-1">
                            <input
                                id="edit-secreto"
                                name="secreto"
                                type="checkbox"
                                checked={form.secreto}
                                onChange={handleChange}
                                disabled={isDisabled}
                                className="w-4 h-4 rounded border-[#555] bg-white/[0.05] accent-[#4f46e5] cursor-pointer"
                            />
                            <label htmlFor="edit-secreto" className="text-[#e0e0e0] font-medium text-[0.9rem] cursor-pointer select-none">
                                Torneio Secreto
                                <span className="block text-[0.75rem] font-normal text-[#888] mt-[0.1rem]">Não aparece em listagens públicas; compartilhe o link diretamente.</span>
                            </label>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-horario" className="text-[#e0e0e0] font-medium text-[0.9rem]">Data e Hora</label>
                            <input id="edit-horario" name="horario" type="datetime-local" value={form.horario} onChange={handleChange} required disabled={loading} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-formato" className="text-[#e0e0e0] font-medium text-[0.9rem]">Formato</label>
                            <div className="relative">
                                <select id="edit-formato" name="formato" value={form.formato} onChange={handleChange} disabled={loading} className={`${inputClass} w-full appearance-none pr-10`}>
                                    {TOURNAMENT_FORMATS.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                                <span className="absolute right-[0.9rem] top-1/2 -translate-y-1/2 text-[#a5b4fc] pointer-events-none" aria-hidden="true">▾</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-premio" className="text-[#e0e0e0] font-medium text-[0.9rem]">Prêmio <span className="text-[#beafd7] text-[0.8rem]">(opcional)</span></label>
                            <input id="edit-premio" name="premio" type="text" value={form.premio} onChange={handleChange} disabled={loading} className={inputClass} />
                        </div>
                    </div>

                    {/* Estrutura */}
                    <div className="flex flex-col gap-4 p-4 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)]">
                        <h3 className="text-[0.75rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                            Estrutura
                        </h3>
                        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="edit-maxJogadores" className="text-[#e0e0e0] font-medium text-[0.9rem]">Máx. Jogadores</label>
                                <input id="edit-maxJogadores" name="maxJogadores" type="number" min="2" value={form.maxJogadores} onChange={handleChange} disabled={loading} className={inputClass} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="edit-maxRodadas" className="text-[#e0e0e0] font-medium text-[0.9rem]">Limite de Rodadas</label>
                                <input id="edit-maxRodadas" name="maxRodadas" type="number" min="1" value={form.maxRodadas} onChange={handleChange} disabled={loading} aria-describedby="edit-maxRodadas-help" className={inputClass} />
                                <small id="edit-maxRodadas-help" className="text-[#a3a3a3] text-[0.8rem]">
                                    O sistema calcula as rodadas automaticamente pelo numero de jogadores com check-in. Este campo apenas define o teto e impede ultrapassar esse valor.
                                </small>
                                {totalCheckin > 0 && (
                                    <small className="text-[#a5b4fc] text-[0.8rem]">
                                        Com {totalCheckin} jogador(es) em check-in, o suíço teria {automaticSwissRounds} rodada(s) automaticamente{form.maxRodadas ? ` e ficaria limitado a ${limitedSwissRounds}.` : "."}
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-corteTop" className="text-[#e0e0e0] font-medium text-[0.9rem]">Corte para Top</label>
                            <div className="relative">
                                <select id="edit-corteTop" name="corteTop" value={form.corteTop} onChange={handleChange} disabled={loading} className={`${inputClass} w-full appearance-none pr-10`}>
                                    {TOP_CUT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <span className="absolute right-[0.9rem] top-1/2 -translate-y-1/2 text-[#a5b4fc] pointer-events-none" aria-hidden="true">▾</span>
                            </div>
                        </div>
                    </div>

                    {/* Mídia */}
                    <div className="flex flex-col gap-4 p-4 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)]">
                        <h3 className="text-[0.75rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                            Mídia
                        </h3>

                        {/* Banner upload */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[#e0e0e0] font-medium text-[0.9rem]">
                                Imagem do Banner <span className="text-[#beafd7] text-[0.8rem]">(opcional)</span>
                            </label>

                            {bannerPreview ? (
                                <div className="relative rounded-lg overflow-hidden border border-[rgba(79,70,229,0.3)]">
                                    <img src={bannerPreview} alt="Preview do banner" className="block w-full max-h-[160px] object-cover" />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bg-[rgba(0,0,0,0.65)] text-[#fca5a5] border border-[rgba(239,68,68,0.4)] rounded-[6px] py-[3px] px-[10px] text-[0.75rem] font-semibold cursor-pointer transition-all duration-150 hover:bg-[rgba(239,68,68,0.35)] disabled:opacity-50"
                                        onClick={removeBanner}
                                        disabled={isDisabled}
                                        aria-label="Remover banner"
                                    >
                                        ✕ Remover
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-[0.6rem] w-full py-[0.75rem] px-4 border-2 border-dashed border-[rgba(79,70,229,0.4)] rounded-lg bg-[rgba(79,70,229,0.04)] text-[#a5b4fc] text-[0.85rem] cursor-pointer transition-all duration-200 hover:border-[#a5b4fc] hover:bg-[rgba(79,70,229,0.1)] hover:text-[#c7d2fe] disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={isDisabled}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <polyline points="16 16 12 12 8 16" />
                                        <line x1="12" y1="12" x2="12" y2="21" />
                                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                    </svg>
                                    Selecionar imagem
                                </button>
                            )}

                            <input
                                ref={bannerInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={handleBannerFileChange}
                                disabled={isDisabled}
                            />

                            {bannerError && (
                                <small className="text-[#fca5a5] text-[0.8rem]">{bannerError}</small>
                            )}

                            {isUploading && (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[0.75rem] text-[#a5b4fc]">
                                        <span>Enviando banner…</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] transition-[width] duration-200"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-linkBanner" className="text-[#e0e0e0] font-medium text-[0.9rem]">Link do Banner <span className="text-[#beafd7] text-[0.8rem]">(opcional)</span></label>
                            <input id="edit-linkBanner" name="linkBanner" type="url" placeholder="https://..." value={form.linkBanner} onChange={handleChange} disabled={isDisabled} className={inputClass} />
                            <small className="text-[#a3a3a3] text-[0.8rem]">URL para onde o banner redireciona ao ser clicado (não é a imagem).</small>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-somRodada" className="text-[#e0e0e0] font-medium text-[0.9rem]">Som de Nova Rodada <span className="text-[#beafd7] text-[0.8rem]">(opcional)</span></label>
                            <input id="edit-somRodada" name="somRodada" type="url" placeholder="https://.../som.mp3" value={form.somRodada} onChange={handleChange} disabled={isDisabled} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-linkLive" className="text-[#e0e0e0] font-medium text-[0.9rem]">Live no YouTube <span className="text-[#beafd7] text-[0.8rem]">(opcional)</span></label>
                            <input id="edit-linkLive" name="linkLive" type="url" placeholder="https://youtube.com/..." value={form.linkLive} onChange={handleChange} disabled={isDisabled} className={inputClass} />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDisabled}
                            className="px-5 py-2.5 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] bg-transparent cursor-pointer font-medium text-[0.9rem] transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.4)] hover:bg-white/[0.05] disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="px-5 py-2.5 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white border-none rounded-lg font-semibold text-[0.9rem] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:!transform-none"
                        >
                            {isUploading ? "Enviando banner..." : loading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
