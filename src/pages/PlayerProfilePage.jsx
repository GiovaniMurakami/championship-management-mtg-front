import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buscarRankUsuario } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/ui/PageShell";
import { InlineAlert } from "../components/ui/InlineAlert";
import { RankBadge, RankProgressBar, RankInfoTooltip } from "../components/rank";
import { extractResumoRank } from "../utils/rank";

export function PlayerProfilePage() {
  const { usuarioId } = useParams();
  const { token, usuario: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await buscarRankUsuario(usuarioId, token);
        if (cancelled) return;
        const usuario = data?.usuario ?? data;
        setProfile({
          id: usuario?.id || usuarioId,
          nome: usuario?.nome || data?.nome || "Jogador",
          ...usuario,
          ...extractResumoRank(data),
          ...extractResumoRank(usuario),
        });
      } catch (err) {
        if (!cancelled) setError(err.message || "Jogador não encontrado.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [usuarioId, token]);

  const isSelf = String(currentUser?.id) === String(usuarioId);

  return (
    <PageShell className="max-w-[720px]">
      <Link
        to="/ranking"
        className="inline-flex items-center gap-1 text-[#beafd7] text-[0.85rem] no-underline mb-5 hover:text-[#c795ff] transition-colors"
      >
        ← Voltar ao ranking
      </Link>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 bg-white/[0.06] rounded-lg" />
          <div className="h-28 bg-white/[0.04] rounded-xl" />
        </div>
      ) : error ? (
        <InlineAlert type="error">{error}</InlineAlert>
      ) : profile ? (
        <>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(167,79,255,0.35)] border border-[rgba(199,149,255,0.4)] text-[1.4rem] font-bold text-[#f5edff]">
              {(profile.nome?.[0] ?? "?").toUpperCase()}
            </span>
            <div>
              <h1 className="m-0 text-white text-[2rem] font-['Bebas_Neue',sans-serif] tracking-[0.03em]">
                {profile.nome}
              </h1>
              {isSelf && (
                <p className="m-0 mt-1 text-[0.8rem] text-[#86efac]">Seu perfil público</p>
              )}
            </div>
            <RankBadge rank={profile.rank} size="lg" className="ml-auto" />
          </div>

          <RankProgressBar usuario={profile} className="mb-4" />

          <RankInfoTooltip>
            <p className="m-0 text-[0.82rem] text-[#beafd7] cursor-help border-b border-dotted border-[rgba(190,175,215,0.35)] inline-block">
              Perder para jogador de rank menor custa mais pontos
            </p>
          </RankInfoTooltip>
        </>
      ) : null}
    </PageShell>
  );
}
