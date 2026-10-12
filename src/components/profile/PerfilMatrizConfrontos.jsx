function tomCelula(winrate, partidas) {
  if (!partidas) return "text-text-muted";
  if (winrate > 50) return "bg-success/20 text-text-main";
  if (winrate < 50) return "bg-danger/20 text-text-main";
  return "bg-surface-raised text-text-main";
}

function Celula({ stats, label }) {
  if (!stats?.partidas) {
    return <td className="border border-line-soft p-3 text-center text-text-muted" aria-label={`${label}: sem partidas`}>—</td>;
  }
  return (
    <td className={`border border-line-soft p-3 text-center tabular-nums ${tomCelula(stats.winrate, stats.partidas)}`} aria-label={`${label}: ${stats.winrate}% em ${stats.partidas} partidas`} title={`${stats.vitorias} vitórias · ${stats.derrotas} derrotas · ${stats.empates} empates`}>
      <strong className="block text-base">{stats.winrate}%</strong>
      <span className="text-xs text-text-soft">{stats.partidas} {stats.partidas === 1 ? "partida" : "partidas"}</span>
    </td>
  );
}

export function PerfilMatrizConfrontos({ matriz }) {
  if (!matriz) return null;
  const linhas = matriz.linhas || [];
  const adversarios = matriz?.adversarios || [];
  if (linhas.length === 0) {
    return (
      <section className="mb-12" aria-labelledby="perfil-confrontos-title">
        <h2 id="perfil-confrontos-title" className="m-0 text-[1.55rem] font-semibold tracking-[-0.025em] text-text-main">Confrontos</h2>
        <p className="mb-5 mt-1 text-sm text-text-subtle">Winrate de cada deck jogado contra os decks enfrentados.</p>
        <p className="rounded-2xl border border-line-soft bg-surface/60 p-5 text-sm text-text-soft">Ainda não há confrontos entre decks neste período.</p>
      </section>
    );
  }

  return (
    <section className="mb-12" aria-labelledby="perfil-confrontos-title">
      <h2 id="perfil-confrontos-title" className="m-0 text-[1.55rem] font-semibold tracking-[-0.025em] text-text-main">Confrontos</h2>
      <p className="mb-4 mt-1 text-sm text-text-subtle">A linha é o deck jogado. A coluna é o deck enfrentado. O winrate inclui empates no total.</p>
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-text-soft">
        <span className="rounded-md bg-danger/20 px-2 py-1">Abaixo de 50%</span>
        <span className="rounded-md bg-surface-raised px-2 py-1">50%</span>
        <span className="rounded-md bg-success/20 px-2 py-1">Acima de 50%</span>
      </div>
      <div role="region" aria-label="Matriz de confrontos do perfil" tabIndex={0} className="max-h-[70vh] overflow-auto rounded-xl border border-line-soft focus-visible:outline-2 focus-visible:outline-brand">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Winrate do deck da linha contra o deck da coluna.</caption>
          <thead className="sticky top-0 z-20">
            <tr>
              <th scope="col" className="sticky left-0 z-30 min-w-40 border border-line-soft bg-surface p-3 text-left text-text-main">Seu deck</th>
              <th scope="col" className="min-w-24 border border-line-soft bg-surface p-3 text-text-main">Geral</th>
              {adversarios.map((nome) => (
                <th key={nome} scope="col" className="min-w-28 max-w-40 border border-line-soft bg-surface p-3 font-medium text-text-main">{nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => {
              const porAdversario = new Map((linha.confrontos || []).map((item) => [item.nome, item]));
              return (
                <tr key={linha.nome}>
                  <th scope="row" className="sticky left-0 z-10 border border-line-soft bg-surface p-3 text-left font-semibold text-text-main">{linha.nome}</th>
                  <Celula stats={linha} label={`${linha.nome}, geral`} />
                  {adversarios.map((nome) => (
                    <Celula key={nome} stats={porAdversario.get(nome)} label={`${linha.nome} contra ${nome}`} />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
