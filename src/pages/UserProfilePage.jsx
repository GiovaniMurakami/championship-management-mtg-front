import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState, PageShell, SkeletonUserProfile } from "../components";
import { PAGE_TITLES } from "../constants/pageTitles";
import { usePageTitle } from "../hooks/usePageTitle";
import { buscarPerfilPublico } from "../services/backendApi";
import { buscarCartasPorNome } from "../services/scryfallApi";
import { useAuth } from "../context/AuthContext";
import { CompetitiveStats } from "../components/ui/CompetitiveStats";
import { tournamentPath } from "../utils/tournamentUrl";
import { deckPath } from "../utils/deckUrl";

export function UserProfilePage() {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deckImages, setDeckImages] = useState({});
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const { usuario: usuarioLogado, handleProfilePhoto } = useAuth();
  usePageTitle(perfil?.usuario?.nome || PAGE_TITLES.perfilUsuario);

  useEffect(() => {
    let active = true;
    buscarPerfilPublico(id)
      .then((data) => active && setPerfil(data))
      .catch((err) => active && setError(err.message || "Não foi possível carregar o perfil."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    const decks = perfil?.decks || [];
    const withCard = decks.filter((deck) => deck.cartaFundo);
    if (withCard.length === 0) return undefined;
    let active = true;
    buscarCartasPorNome(withCard.map((deck) => deck.cartaFundo)).then((cards) => {
      if (!active) return;
      setDeckImages(Object.fromEntries(cards.map((card, index) => card?.imagem ? [withCard[index].id, card.artCrop || card.imagem] : null).filter(Boolean)));
    });
    return () => { active = false; };
  }, [perfil]);

  if (loading) return <PageShell><SkeletonUserProfile /></PageShell>;
  if (error || !perfil) return (
    <PageShell>
      <EmptyState
        icon="👤"
        title={error === "Usuário não encontrado" ? "Perfil não encontrado" : "Não foi possível carregar o perfil"}
        description={error || "Tente atualizar a página."}
      />
    </PageShell>
  );

  const { usuario, estatisticas, decks, ultimosTorneios = [] } = perfil;
  const isOwnProfile = String(usuarioLogado?.id || "") === String(usuario.id);
  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    setPhotoMessage("");
    try {
      const updatedUsuario = await handleProfilePhoto(file);
      if (updatedUsuario) setPerfil((current) => ({ ...current, usuario: { ...current.usuario, ...updatedUsuario } }));
      setPhotoMessage("Foto atualizada");
    } catch (uploadError) {
      setPhotoMessage(uploadError.message || "Não foi possível enviar a foto.");
    } finally {
      setPhotoLoading(false);
      event.target.value = "";
    }
  };
  return (
    <PageShell className="pb-16">
      <section className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(48,31,76,0.72),rgba(24,20,38,0.88))] px-7 py-8 shadow-[0_24px_70px_rgba(3,2,8,0.28)] backdrop-blur-2xl max-sm:px-5 max-sm:py-6">
        <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-brand/15 blur-3xl" />
        <div className="relative flex items-center gap-5 max-sm:items-start">
        {isOwnProfile ? (
          <label className={`group relative flex h-[76px] w-[76px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[linear-gradient(145deg,rgba(167,79,255,0.5),rgba(85,40,135,0.45))] text-2xl font-semibold text-white shadow-[0_10px_35px_rgba(0,0,0,0.28)] transition hover:border-white/40 max-sm:h-16 max-sm:w-16 ${photoLoading ? "pointer-events-none opacity-70" : ""}`} title="Alterar foto de perfil">
            {usuario.fotoUrl ? <img src={usuario.fotoUrl} alt={`Foto de ${usuario.nome}`} className="h-full w-full object-cover" /> : usuario.nome?.[0]?.toUpperCase() || "?"}
            <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[0.62rem] font-bold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{photoLoading ? "Enviando" : "Alterar"}</span>
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" disabled={photoLoading} onChange={uploadPhoto} aria-label="Alterar foto de perfil" />
          </label>
        ) : (
          <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[linear-gradient(145deg,rgba(167,79,255,0.5),rgba(85,40,135,0.45))] text-2xl font-semibold text-white shadow-[0_10px_35px_rgba(0,0,0,0.28)] max-sm:h-16 max-sm:w-16">
            {usuario.fotoUrl ? <img src={usuario.fotoUrl} alt={`Foto de ${usuario.nome}`} className="h-full w-full object-cover" /> : usuario.nome?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="m-0 truncate text-[2rem] font-semibold tracking-[-0.035em] text-white max-sm:text-[1.55rem]">{usuario.nome}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.82rem] text-text-soft">
            {usuario.nickMTGO && <span className="rounded-full bg-white/[0.07] px-2.5 py-1">MTGO · {usuario.nickMTGO}</span>}
            {usuario.nickArena && <span className="rounded-full bg-white/[0.07] px-2.5 py-1">Arena · {usuario.nickArena}</span>}
            <span className="rounded-full bg-white/[0.07] px-2.5 py-1">Desde {new Date(usuario.criadoEm).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</span>
          </div>
          {isOwnProfile && <p className={`mb-0 mt-2 text-xs ${photoMessage === "Foto atualizada" ? "text-emerald-300" : "text-text-subtle"}`}>{photoMessage || "Clique na foto para alterar · recomendado: 512 × 512 px"}</p>}
        </div>
        </div>
      </section>

      <CompetitiveStats stats={estatisticas} expressiveResults={usuario.resultadosExpressivos ?? 0} className="mb-10" />

      <section className="mb-12">
        <div className="mb-5">
          <h2 className="m-0 text-[1.55rem] font-semibold tracking-[-0.025em] text-text-main">Últimos torneios</h2>
          <p className="m-0 mt-1 text-[0.9rem] text-text-subtle">Seu desempenho mais recente</p>
        </div>
        {ultimosTorneios.length === 0 ? (
          <div className="rounded-2xl border border-line-soft bg-surface/60 p-5 text-sm text-text-soft">Nenhum resultado de torneio disponível.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {ultimosTorneios.map((torneio) => (
              <Link key={torneio.id} to={tournamentPath(torneio)} className="group rounded-[1.35rem] border border-white/[0.09] bg-white/[0.045] p-5 no-underline shadow-[0_14px_40px_rgba(3,2,8,0.16)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.065] hover:shadow-[0_20px_50px_rgba(3,2,8,0.28)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0"><span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-brand">{torneio.formato}</span><h3 className="mb-1 mt-2 line-clamp-2 min-h-[2.5rem] text-[1rem] font-semibold leading-tight text-text-main transition-colors group-hover:text-white">{torneio.nome}</h3></div>
                  <strong className="shrink-0 text-[1.35rem] font-semibold tracking-[-0.03em] text-brand">{torneio.winrate}%</strong>
                </div>
                <time className="mt-1 block text-xs text-text-subtle">{new Date(torneio.horario).toLocaleDateString("pt-BR")}</time>
                <div className="mt-4 flex gap-3 border-t border-white/[0.07] pt-3 text-xs font-semibold"><span className="text-emerald-300">{torneio.vitorias}V</span><span className="text-red-300">{torneio.derrotas}D</span><span className="text-text-soft">{torneio.empates}E</span><span className="ml-auto text-text-subtle">{torneio.totalPartidas} partidas</span></div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mb-5 flex items-end justify-between gap-3">
        <div><h2 className="m-0 text-[1.55rem] font-semibold tracking-[-0.025em] text-text-main">Decks públicos</h2><p className="m-0 mt-1 text-[0.9rem] text-text-subtle">{decks.length} deck{decks.length === 1 ? "" : "s"} na coleção</p></div>
      </div>
      {decks.length === 0 ? (
        <EmptyState icon="🃏" title="Nenhum deck público" description="Este jogador ainda não publicou decks." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {decks.map((deck) => (
            <Link key={deck.id} to={deckPath(deck, { view: true })} state={{ readOnly: true }} className="group overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.04] no-underline shadow-[0_16px_45px_rgba(3,2,8,0.2)] transition duration-300 hover:-translate-y-1.5 hover:border-white/[0.16] hover:shadow-[0_22px_55px_rgba(3,2,8,0.34)]">
              <div className="relative h-48 bg-[radial-gradient(circle_at_70%_40%,rgba(87,20,166,0.5),transparent_60%),linear-gradient(135deg,#1a0d36,#0d071e)] bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.025]" style={deckImages[deck.id] ? { backgroundImage: `url(${deckImages[deck.id]})` } : undefined}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[rgba(8,6,15,0.88)]" />
                <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-xl">{deck.formato}</span>
              </div>
              <div className="p-5 pt-4">
                <h3 className="mb-3 mt-0 truncate text-[1.05rem] font-semibold tracking-[-0.01em] text-text-main group-hover:text-white">{deck.nome}</h3>
                <div className="flex justify-between text-xs text-text-subtle"><span>{deck.visualizacoes} visualizações</span><span>{new Date(deck.criadoEm).toLocaleDateString("pt-BR")}</span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
