export function LigaRankingSection({ ranking, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[1rem] border border-[rgba(217,180,255,0.1)] bg-white/[0.03] h-[200px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!ranking) return null;

  const jogadores = ranking.rankingJogadores || ranking.jogadores || ranking.players || [];
  const decks = ranking.rankingDecks || ranking.decks || [];
  const cartas = ranking.rankingCartas || ranking.cartas || ranking.cards || [];

  const thClass = "px-4 py-3 text-left text-[0.75rem] font-bold tracking-[0.07em] uppercase text-[#2ccfb4] border-b border-[rgba(44,207,180,0.15)]";
  const tdClass = "px-4 py-3 text-[0.88rem] text-[#beafd7] border-b border-[rgba(217,180,255,0.07)]";
  const tdHighlight = "px-4 py-3 text-[0.88rem] text-[#f5edff] font-medium border-b border-[rgba(217,180,255,0.07)]";
  const sectionClass = "bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1rem] border border-[rgba(217,180,255,0.15)] overflow-hidden";
  const sectionHeadClass = "px-5 py-4 border-b border-[rgba(217,180,255,0.15)] bg-white/[0.02]";

  return (
    <div className="grid gap-6">
      {/* Jogadores */}
      {jogadores.length > 0 && (
        <div className={sectionClass}>
          <div className={sectionHeadClass}>
            <h3 className="m-0 text-[#f5edff] font-semibold text-[1rem]">Ranking de Jogadores</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Jogador</th>
                  <th className={thClass}>Pontos</th>
                  <th className={thClass}>V</th>
                  <th className={thClass}>D</th>
                  <th className={thClass}>E</th>
                </tr>
              </thead>
              <tbody>
                {jogadores.map((j, idx) => {
                  const pos = j.posicao ?? idx + 1;
                  const nome = j.jogador?.nome || j.nome || j.usuario?.nome || "—";
                  return (
                    <tr key={j.jogador?.id ?? j.id ?? j.usuarioId ?? idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className={tdClass}>
                        {pos === 1 ? (
                          <span className="text-[#fbbf24] font-bold">🥇</span>
                        ) : pos === 2 ? (
                          <span className="text-[#94a3b8] font-bold">🥈</span>
                        ) : pos === 3 ? (
                          <span className="text-[#cd7f32] font-bold">🥉</span>
                        ) : (
                          <span className="text-[#beafd7]">{pos}</span>
                        )}
                      </td>
                      <td className={tdHighlight}>{nome}</td>
                      <td className={`${tdClass} font-semibold text-[#f0b429]`}>{j.pontos ?? "—"}</td>
                      <td className={`${tdClass} text-[#22c55e]`}>{j.vitorias ?? j.wins ?? "—"}</td>
                      <td className={`${tdClass} text-[#ef4444]`}>{j.derrotas ?? j.losses ?? "—"}</td>
                      <td className={`${tdClass} text-[#fbbf24]`}>{j.empates ?? j.draws ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decks */}
      {decks.length > 0 && (
        <div className={sectionClass}>
          <div className={sectionHeadClass}>
            <h3 className="m-0 text-[#f5edff] font-semibold text-[1rem]">Ranking de Decks</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Arquétipo</th>
                  <th className={thClass}>Usos</th>
                  <th className={thClass}>Vitórias</th>
                </tr>
              </thead>
              <tbody>
                {decks.map((d, idx) => (
                  <tr key={d.id ?? d.nome ?? idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className={tdClass}>{d.posicao ?? idx + 1}</td>
                    <td className={tdHighlight}>{d.nome || d.archetype || d.nomeArquetipo || "—"}</td>
                    <td className={tdClass}>{d.totalUsos ?? d.usos ?? d.uses ?? "—"}</td>
                    <td className={`${tdClass} text-[#22c55e]`}>{d.vitorias ?? d.wins ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cartas */}
      {cartas.length > 0 && (
        <div className={sectionClass}>
          <div className={sectionHeadClass}>
            <h3 className="m-0 text-[#f5edff] font-semibold text-[1rem]">Ranking de Cartas</h3>
            <p className="m-0 mt-1 text-[#beafd7] text-[0.8rem]">Ordenado por popularidade</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Carta</th>
                  <th className={thClass}>Total de Cópias</th>
                  <th className={thClass}>Qtd. de Decks</th>
                </tr>
              </thead>
              <tbody>
                {cartas.map((c, idx) => (
                  <tr key={c.id ?? c.nome ?? idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className={tdClass}>{c.posicao ?? idx + 1}</td>
                    <td className={tdHighlight}>{c.nome || c.name || "—"}</td>
                    <td className={tdClass}>{c.totalCopias ?? c.totalCopies ?? "—"}</td>
                    <td className={tdClass}>{c.totalDecks ?? c.quantidadeDecks ?? c.deckCount ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {jogadores.length === 0 && decks.length === 0 && cartas.length === 0 && (
        <p className="text-center text-[#888] py-10 text-base">Nenhum dado de ranking disponível ainda.</p>
      )}
    </div>
  );
}
