import { useState, useRef } from "react";
import { criarTorneio } from "../../services/backendApi";

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
    totalRodadas: "",
    corteTop: "",
    bannerUrl: "",
    bannerLink: "",
    somNovaRodada: "",
    urlLiveYoutube: "",
};

export function TournamentCreateForm({ token, onTournamentCreated }) {
    const [createForm, setCreateForm] = useState(INITIAL_FORM);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const bannerInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleBannerFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        // bannerUrl will be set after presigned URL upload at submit time
        setCreateForm((prev) => ({ ...prev, bannerUrl: "" }));
    };

    const removeBanner = () => {
        setBannerFile(null);
        if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        setBannerPreview(null);
        setCreateForm((prev) => ({ ...prev, bannerUrl: "" }));
        if (bannerInputRef.current) bannerInputRef.current.value = "";
    };

    // TODO: call presigned URL endpoint here, then PUT the file to S3
    // const uploadBannerToS3 = async (file) => {
    //     const { data } = await requestBannerPresignedUrl(file.name, file.type, token);
    //     await fetch(data.presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    //     return data.publicUrl;
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let finalBannerUrl = createForm.bannerUrl;

            if (bannerFile) {
                setUploadingBanner(true);
                // TODO: replace with real presigned URL upload
                // finalBannerUrl = await uploadBannerToS3(bannerFile);
                setUploadingBanner(false);
            }

            const payload = {
                ...createForm,
                bannerUrl: finalBannerUrl || undefined,
                bannerLink: createForm.bannerLink || undefined,
                maxJogadores: createForm.maxJogadores ? Number(createForm.maxJogadores) : undefined,
                totalRodadas: createForm.totalRodadas ? Number(createForm.totalRodadas) : undefined,
                corteTop: createForm.corteTop ? Number(createForm.corteTop) : undefined,
                somNovaRodada: createForm.somNovaRodada || undefined,
                urlLiveYoutube: createForm.urlLiveYoutube || undefined,
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
        <section className="tournament-create-section">
            <div className="create-form-container">
                <h2>Criar Novo Torneio</h2>
                <form onSubmit={handleSubmit} className="tournament-create-form">

                    {/* ── Informações Básicas ── */}
                    <div className="tcf-section">
                        <h3 className="tcf-section-title">Informações Básicas</h3>

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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="formato">Formato</label>
                            <div className="format-select-wrapper">
                                <select
                                    id="formato"
                                    name="formato"
                                    className="format-select"
                                    value={createForm.formato}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                >
                                    {TOURNAMENT_FORMATS.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                                <span className="format-select-arrow" aria-hidden="true">▾</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="premio">
                                Prêmio <span className="optional-label">(opcional)</span>
                            </label>
                            <input
                                id="premio"
                                name="premio"
                                type="text"
                                placeholder="Ex: 1º lugar: booster box"
                                value={createForm.premio}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* ── Estrutura ── */}
                    <div className="tcf-section">
                        <h3 className="tcf-section-title">Estrutura</h3>

                        <div className="tcf-row">
                            <div className="form-group">
                                <label htmlFor="maxJogadores">
                                    Máx. Jogadores <span className="optional-label">(opcional)</span>
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
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="totalRodadas">
                                    Máx. Rodadas <span className="optional-label">(opcional)</span>
                                </label>
                                <input
                                    id="totalRodadas"
                                    name="totalRodadas"
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 5"
                                    value={createForm.totalRodadas}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="corteTop">
                                Corte para Top <span className="optional-label">(opcional)</span>
                            </label>
                            <div className="format-select-wrapper">
                                <select
                                    id="corteTop"
                                    name="corteTop"
                                    className="format-select"
                                    value={createForm.corteTop}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                >
                                    {TOP_CUT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <span className="format-select-arrow" aria-hidden="true">▾</span>
                            </div>
                            <small className="form-hint">
                                Quantos jogadores avançam para a fase eliminatória.
                            </small>
                        </div>
                    </div>

                    {/* ── Banner ── */}
                    <div className="tcf-section">
                        <h3 className="tcf-section-title">Banner</h3>

                        <div className="form-group">
                            <label>
                                Imagem do Banner <span className="optional-label">(opcional)</span>
                            </label>

                            {bannerPreview ? (
                                <div className="tcf-banner-preview">
                                    <img src={bannerPreview} alt="Preview do banner" className="tcf-banner-img" />
                                    <button
                                        type="button"
                                        className="tcf-banner-remove"
                                        onClick={removeBanner}
                                        disabled={isSubmitting}
                                        aria-label="Remover banner"
                                    >
                                        ✕ Remover
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="tcf-upload-btn"
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={isSubmitting}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
                                accept="image/*"
                                className="tcf-hidden-input"
                                onChange={handleBannerFileChange}
                                disabled={isSubmitting}
                            />

                            {bannerFile && (
                                <small className="form-hint tcf-hint-warn">
                                    Upload será realizado ao criar o torneio (endpoint de presigned URL pendente).
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="bannerLink">
                                Link do Banner <span className="optional-label">(opcional)</span>
                            </label>
                            <input
                                id="bannerLink"
                                name="bannerLink"
                                type="url"
                                placeholder="https://..."
                                value={createForm.bannerLink}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            <small className="form-hint">
                                URL para onde o banner redireciona ao ser clicado.
                            </small>
                        </div>
                    </div>

                    {/* ── Mídia ── */}
                    <div className="tcf-section">
                        <h3 className="tcf-section-title">Mídia</h3>

                        <div className="form-group">
                            <label htmlFor="somNovaRodada">
                                Som de Nova Rodada <span className="optional-label">(opcional)</span>
                            </label>
                            <input
                                id="somNovaRodada"
                                name="somNovaRodada"
                                type="url"
                                placeholder="https://.../som.mp3"
                                value={createForm.somNovaRodada}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            <small className="form-hint">
                                URL de um arquivo de áudio (.mp3, .ogg) que toca ao iniciar cada rodada.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="urlLiveYoutube">
                                Live no YouTube <span className="optional-label">(opcional)</span>
                            </label>
                            <input
                                id="urlLiveYoutube"
                                name="urlLiveYoutube"
                                type="url"
                                placeholder="https://youtube.com/watch?v=..."
                                value={createForm.urlLiveYoutube}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            <small className="form-hint">
                                Link da transmissão ao vivo no YouTube para este torneio.
                            </small>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="btn-primary create-tournament-btn"
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
