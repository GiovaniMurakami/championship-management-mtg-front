import { useState, useEffect } from "react";

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

export function TournamentEditModal({ torneio, isOpen, onClose, onSubmit, loading }) {
    const [form, setForm] = useState({
        nome: "",
        horario: "",
        formato: "standard",
        premio: "",
        maxJogadores: "",
        maxRodadas: "",
        corteTop: "",
        bannerUrl: "",
        linkBanner: "",
        somRodada: "",
        linkLive: "",
    });

    useEffect(() => {
        if (torneio && isOpen) {
            setForm({
                nome: torneio.nome || "",
                horario: toDatetimeLocal(torneio.horario),
                formato: torneio.formato || "standard",
                premio: torneio.premio || "",
                maxJogadores: torneio.maxJogadores ?? "",
                maxRodadas: torneio.maxRodadas ?? torneio.totalRodadas ?? "",
                corteTop: torneio.corteTop ?? "",
                bannerUrl: torneio.bannerUrl || "",
                linkBanner: torneio.linkBanner || "",
                somRodada: torneio.somRodada || "",
                linkLive: torneio.linkLive || "",
            });
        }
    }, [torneio, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            maxJogadores: form.maxJogadores ? Number(form.maxJogadores) : undefined,
            maxRodadas: form.maxRodadas ? Number(form.maxRodadas) : undefined,
            corteTop: form.corteTop ? Number(form.corteTop) : undefined,
        };
        onSubmit(payload);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                                <label htmlFor="edit-maxRodadas" className="text-[#e0e0e0] font-medium text-[0.9rem]">Máx. Rodadas</label>
                                <input id="edit-maxRodadas" name="maxRodadas" type="number" min="1" value={form.maxRodadas} onChange={handleChange} disabled={loading} className={inputClass} />
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
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-bannerUrl" className="text-[#e0e0e0] font-medium text-[0.9rem]">URL do Banner <span className="text-[#beafd7] text-[0.8rem]">(opcional)</span></label>
                            <input id="edit-bannerUrl" name="bannerUrl" type="url" placeholder="https://..." value={form.bannerUrl} onChange={handleChange} disabled={loading} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-somRodada" className="text-[#e0e0e0] font-medium text-[0.9rem]">Som de Nova Rodada <span className="text-[#beafd7] text-[0.8rem]">(opcional)</span></label>
                            <input id="edit-somRodada" name="somRodada" type="url" placeholder="https://.../som.mp3" value={form.somRodada} onChange={handleChange} disabled={loading} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="edit-linkLive" className="text-[#e0e0e0] font-medium text-[0.9rem]">Live no YouTube <span className="text-[#beafd7] text-[0.8rem]">(opcional)</span></label>
                            <input id="edit-linkLive" name="linkLive" type="url" placeholder="https://youtube.com/..." value={form.linkLive} onChange={handleChange} disabled={loading} className={inputClass} />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] bg-transparent cursor-pointer font-medium text-[0.9rem] transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.4)] hover:bg-white/[0.05] disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white border-none rounded-lg font-semibold text-[0.9rem] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:!transform-none"
                        >
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
