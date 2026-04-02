import { useState } from "react";
import { criarTorneio } from "../../services/backendApi";
import { ImageUploader } from "../ui";

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

const INITIAL_FORM = {
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
};

const inputClass =
    "px-4 py-3 border-2 border-[#333] rounded-lg bg-white/[0.05] text-white text-base transition-all duration-300 focus:outline-none focus:border-[#4f46e5] focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] focus:bg-white/[0.1] placeholder:text-[#888] [color-scheme:dark]";

export function TournamentCreateForm({ token, onTournamentCreated }) {
    const [createForm, setCreateForm] = useState(INITIAL_FORM);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const removeBanner = () => {
        setCreateForm((prev) => ({ ...prev, bannerUrl: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let bannerUrl = createForm.bannerUrl;

            const payload = {
                ...createForm,
                bannerUrl,
                maxJogadores: createForm.maxJogadores ? Number(createForm.maxJogadores) : undefined,
                maxRodadas: createForm.maxRodadas ? Number(createForm.maxRodadas) : undefined,
                corteTop: createForm.corteTop ? Number(createForm.corteTop) : undefined,
            };

            await criarTorneio(payload, token);
            setCreateForm(INITIAL_FORM);
            removeBanner();
            onTournamentCreated?.();
        } catch (err) {
            setError("Erro ao criar torneio. Tente novamente.");
            console.error("Erro ao criar torneio:", err);
        } finally {
            setLoading(false);
            setUploadingBanner(false);
        }
    };

    const isSubmitting = loading || uploadingBanner;

    return (
        <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-8 mb-8 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-[768px]:p-6 max-[480px]:p-4">
            <div className="max-w-[600px] mx-auto">
                <h2 className="text-white text-center mb-8 text-[1.8rem] font-semibold max-[768px]:text-[1.5rem] max-[480px]:text-[1.3rem] max-[480px]:mb-6">
                    Criar Novo Torneio
                </h2>
                <form onSubmit={handleSubmit} className="grid gap-6 max-[768px]:gap-5 max-[480px]:gap-4">

                    {/* ── Informações Básicas ── */}
                    <div className="flex flex-col gap-4 p-5 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)] max-[480px]:p-4">
                        <h3 className="text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 mb-1 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                            Informações Básicas
                        </h3>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="nome" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                Nome do Torneio
                            </label>
                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                placeholder="Ex: FNM Standard"
                                value={createForm.nome}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="horario" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                Data e Hora
                            </label>
                            <input
                                id="horario"
                                name="horario"
                                type="datetime-local"
                                value={createForm.horario}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="formato" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                Formato
                            </label>
                            <div className="relative">
                                <select
                                    id="formato"
                                    name="formato"
                                    value={createForm.formato}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`${inputClass} w-full appearance-none pr-10`}
                                >
                                    {TOURNAMENT_FORMATS.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                                <span className="absolute right-[0.9rem] top-1/2 -translate-y-1/2 text-[#a5b4fc] text-[1.1rem] pointer-events-none" aria-hidden="true">▾</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="premio" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                Prêmio <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                            </label>
                            <input
                                id="premio"
                                name="premio"
                                type="text"
                                placeholder="Ex: 1º lugar: booster box"
                                value={createForm.premio}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* ── Estrutura ── */}
                    <div className="flex flex-col gap-4 p-5 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)] max-[480px]:p-4">
                        <h3 className="text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 mb-1 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                            Estrutura
                        </h3>

                        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="maxJogadores" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                    Máx. Jogadores <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                                </label>
                                <input
                                    id="maxJogadores"
                                    name="maxJogadores"
                                    type="number"
                                    min="2"
                                    placeholder="Ex: 32"
                                    value={createForm.maxJogadores}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="maxRodadas" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                    Máx. Rodadas <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                                </label>
                                <input
                                    id="maxRodadas"
                                    name="maxRodadas"
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 5"
                                    value={createForm.maxRodadas}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="corteTop" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                Corte para Top <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="corteTop"
                                    name="corteTop"
                                    value={createForm.corteTop}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`${inputClass} w-full appearance-none pr-10`}
                                >
                                    {TOP_CUT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <span className="absolute right-[0.9rem] top-1/2 -translate-y-1/2 text-[#a5b4fc] text-[1.1rem] pointer-events-none" aria-hidden="true">▾</span>
                            </div>
                            <small className="text-[#a3a3a3] text-[0.8rem]">
                                Quantos jogadores avançam para a fase eliminatória.
                            </small>
                        </div>
                    </div>

                    {/* ── Banner ── */}
                    <div className="flex flex-col gap-4 p-5 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)] max-[480px]:p-4">
                        <h3 className="text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 mb-1 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                            Banner
                        </h3>

                        <div className="flex flex-col gap-2">
                            <ImageUploader
                                value={createForm.bannerUrl}
                                onChange={(url) => setCreateForm((prev) => ({ ...prev, bannerUrl: url }))}
                                uploadType="banner-torneio"
                                label="Banner do Torneio"
                            />
                            {createForm.bannerUrl && (
                                <small className="text-[#fbbf24] text-[0.8rem]">
                                    Banner enviado.
                                </small>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="linkBanner" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                Link do Banner <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                            </label>
                            <input
                                id="linkBanner"
                                name="linkBanner"
                                type="url"
                                placeholder="https://..."
                                value={createForm.linkBanner}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                            <small className="text-[#a3a3a3] text-[0.8rem]">
                                URL para onde o banner redireciona ao ser clicado.
                            </small>
                        </div>
                    </div>

                    {/* ── Mídia ── */}
                    <div className="flex flex-col gap-4 p-5 border border-[rgba(79,70,229,0.2)] rounded-[10px] bg-[rgba(79,70,229,0.04)] max-[480px]:p-4">
                        <h3 className="text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#a5b4fc] m-0 mb-1 pb-2 border-b border-[rgba(79,70,229,0.18)]">
                            Mídia
                        </h3>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="somRodada" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                Som de Nova Rodada <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                            </label>
                            <input
                                id="somRodada"
                                name="somRodada"
                                type="url"
                                placeholder="https://.../som.mp3"
                                value={createForm.somRodada}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                            <small className="text-[#a3a3a3] text-[0.8rem]">
                                URL de um arquivo de áudio (.mp3, .ogg) que toca ao iniciar cada rodada.
                            </small>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="linkLive" className="text-[#e0e0e0] font-medium text-[0.95rem]">
                                Live no YouTube <span className="text-[#beafd7] text-[0.82rem]">(opcional)</span>
                            </label>
                            <input
                                id="linkLive"
                                name="linkLive"
                                type="url"
                                placeholder="https://youtube.com/watch?v=..."
                                value={createForm.linkLive}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={inputClass}
                            />
                            <small className="text-[#a3a3a3] text-[0.8rem]">
                                Link da transmissão ao vivo no YouTube para este torneio.
                            </small>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-[rgba(239,68,68,0.1)] border border-[#ef4444] text-[#fca5a5] px-3 py-3 rounded-[6px] text-[0.9rem] text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white border-none px-8 py-4 rounded-lg text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(79,70,229,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:!transform-none max-[768px]:py-[0.875rem] max-[768px]:text-base"
                        disabled={isSubmitting}
                    >
                        {uploadingBanner
                            ? "Enviando banner..."
                            : loading
                                ? "Criando..."
                                : "Criar Torneio"}
                    </button>
                </form>
            </div>
        </section>
    );
}
