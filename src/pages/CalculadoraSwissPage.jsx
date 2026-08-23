import { useMemo, useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
  FORM_SECTION_CLASS,
  FORM_SECTION_TITLE_CLASS,
  TOURNAMENT_INPUT_CLASS,
} from "../styles/uiClasses";
import {
  SWISS_ROUNDS_TABLE,
  calculateTopCutProbabilities,
  formatPlayerCount,
  recommendedSwissRounds,
} from "../utils/swissTopCutCalculator";

function toInt(value, fallback = 0) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

function Field({ id, label, value, onChange, min = 0, max }) {
  return (
    <label className="grid gap-1.5 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-text-subtle">
      {label}
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={TOURNAMENT_INPUT_CLASS}
      />
    </label>
  );
}

export function CalculadoraSwissPage() {
  usePageTitle(PAGE_TITLES.calculadoraSwiss);

  const [players, setPlayers] = useState("16");
  const [rounds, setRounds] = useState("4");
  const [topCut, setTopCut] = useState("8");
  const [playersWithBye, setPlayersWithBye] = useState("0");
  const [byesPerPlayer, setByesPerPlayer] = useState("0");
  const [roundsTouched, setRoundsTouched] = useState(false);

  const playersN = toInt(players, 0);
  const roundsN = toInt(rounds, 0);
  const topCutN = toInt(topCut, 0);
  const byePlayersN = toInt(playersWithBye, 0);
  const byesEachN = toInt(byesPerPlayer, 0);

  const handlePlayersChange = (value) => {
    setPlayers(value);
    if (roundsTouched) return;
    const recommended = recommendedSwissRounds(toInt(value, 0));
    if (recommended > 0) setRounds(String(recommended));
  };

  const result = useMemo(() => {
    if (playersN < 2 || roundsN < 1 || topCutN < 1) return null;
    if (byePlayersN > playersN) return null;
    if (byesEachN > roundsN) return null;
    return calculateTopCutProbabilities({
      players: playersN,
      rounds: roundsN,
      topCut: topCutN,
      playersWithBye: byePlayersN,
      byesPerPlayer: byesEachN,
    });
  }, [playersN, roundsN, topCutN, byePlayersN, byesEachN]);

  return (
    <PageShell className="max-w-[920px] mx-auto">
      <header className="mb-6">
        <p className="m-0 mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand">
          Ferramentas
        </p>
        <h1 className="m-0 font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em] text-text-main">
          Calculadora de top 8 de torneio suíço
        </h1>
      </header>

      <section className={`${FORM_SECTION_CLASS} mb-5`} aria-labelledby="detalhes-torneio">
        <h2 id="detalhes-torneio" className={FORM_SECTION_TITLE_CLASS}>
          Detalhes do torneio
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            id="qtd-jogadores"
            label="Quantidade de jogadores"
            value={players}
            min={2}
            onChange={handlePlayersChange}
          />
          <Field
            id="qtd-rodadas"
            label="Quantidade de rodadas"
            value={rounds}
            min={1}
            max={16}
            onChange={(v) => {
              setRoundsTouched(true);
              setRounds(v);
            }}
          />
          <Field
            id="qtd-topo"
            label="Quantos jogadores no topo"
            value={topCut}
            min={1}
            onChange={setTopCut}
          />
          <Field
            id="jogadores-bye"
            label="Jogadores com bye"
            value={playersWithBye}
            min={0}
            onChange={setPlayersWithBye}
          />
          <Field
            id="byes-por-jogador"
            label="Byes por jogador"
            value={byesPerPlayer}
            min={0}
            onChange={setByesPerPlayer}
          />
        </div>
      </section>

      <section className={`${FORM_SECTION_CLASS} mb-5`} aria-labelledby="resultados-title">
        <h2 id="resultados-title" className={FORM_SECTION_TITLE_CLASS}>
          Resultados
        </h2>

        {!result ? (
          <p className="m-0 text-[0.9rem] text-text-muted">
            Informe pelo menos 2 jogadores, 1 rodada e um corte válido.
          </p>
        ) : (
          <>
            <p className="m-0 text-[1rem] text-text-main">
              Resultado que garante o top:{" "}
              <strong className="text-brand">
                {result.guaranteedRecord || "—"}
              </strong>
            </p>

            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[480px] border-collapse text-left text-[0.9rem]">
                <thead>
                  <tr className="bg-[rgba(167,79,255,0.12)] text-brand">
                    <th className="px-3 py-2.5 font-semibold">Resultado do jogador</th>
                    <th className="px-3 py-2.5 font-semibold">Número de jogadores</th>
                    <th className="px-3 py-2.5 font-semibold">
                      Probabilidade de entrar no top {topCutN}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr
                      key={row.recordLabel}
                      className={`border-t border-line-soft ${
                        row.status === "garantido"
                          ? "bg-[rgba(34,197,94,0.08)]"
                          : row.status === "bolha"
                            ? "bg-[rgba(251,191,36,0.08)]"
                            : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 text-text-main font-semibold tabular-nums">
                        {row.recordLabel}
                      </td>
                      <td className="px-3 py-2.5 text-text-soft tabular-nums">
                        {formatPlayerCount(row.players)}
                      </td>
                      <td className="px-3 py-2.5 text-text-soft tabular-nums">
                        {`${Math.round(row.probability)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className={`${FORM_SECTION_CLASS} mb-5`} aria-labelledby="faq-rounds">
        <h2 id="faq-rounds" className={FORM_SECTION_TITLE_CLASS}>
          Quantas rodadas suíças um torneio precisa?
        </h2>
        <p className="m-0 text-[0.9rem] text-text-subtle leading-relaxed">
          O número de rodadas é determinado pelo número de jogadores usando a potência de 2.
          A tabela abaixo mostra melhor:
        </p>
        <p className="m-0 text-[0.9rem] text-text-subtle leading-relaxed">
          Se a organização quiser, você pode jogar mais do que o número recomendado de rodadas,
          mas corre o risco de ter o mesmo jogador com 2 byes ou até mesmo dois jogadores tendo
          que se enfrentar novamente.
        </p>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[320px] border-collapse text-left text-[0.9rem]">
            <thead>
              <tr className="bg-[rgba(167,79,255,0.12)] text-brand">
                <th className="px-3 py-2.5 font-semibold">Número de jogadores</th>
                <th className="px-3 py-2.5 font-semibold">Número de rodadas</th>
              </tr>
            </thead>
            <tbody>
              {SWISS_ROUNDS_TABLE.map((row) => (
                <tr key={row.rounds} className="border-t border-line-soft">
                  <td className="px-3 py-2 text-text-soft">
                    {row.minPlayers === row.maxPlayers
                      ? String(row.minPlayers)
                      : `${row.minPlayers}-${row.maxPlayers}`}
                  </td>
                  <td className="px-3 py-2 text-text-main font-semibold">{row.rounds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${FORM_SECTION_CLASS} mb-5`} aria-labelledby="faq-swiss">
        <h2 id="faq-swiss" className={FORM_SECTION_TITLE_CLASS}>
          Como funciona um torneio suíço?
        </h2>
        <p className="m-0 text-[0.9rem] text-text-subtle leading-relaxed">
          Um torneio suíço é semelhante a um torneio Round-Robin em que nenhum jogador é eliminado.
          Todos os jogadores jogarão todas as rodadas, e o jogador com o maior número de pontos no
          final do torneio é o vencedor.
        </p>
      </section>

      <section className={`${FORM_SECTION_CLASS} mb-5`} aria-labelledby="faq-pontos">
        <h2 id="faq-pontos" className={FORM_SECTION_TITLE_CLASS}>
          Como você calcula pontos em um torneio suíço?
        </h2>
        <p className="m-0 text-[0.9rem] text-text-subtle leading-relaxed">
          Cada vitória dá 3 pontos, cada empate 1 ponto e as derrotas dão 0 pontos. Quando os
          jogadores estão empatados, a porcentagem de vitórias no jogo, a porcentagem de vitórias
          no jogo do oponente e mais podem ser usadas para determinar qual jogador está no topo.
        </p>
      </section>

      <section className={FORM_SECTION_CLASS} aria-labelledby="faq-pair">
        <h2 id="faq-pair" className={FORM_SECTION_TITLE_CLASS}>
          Como funciona o emparelhamento em torneios suíços?
        </h2>
        <p className="m-0 text-[0.9rem] text-text-subtle leading-relaxed">
          Em um torneio do sistema suíço, os jogadores nunca são eliminados. Em vez disso, os
          jogadores são emparelhados em todas as rodadas. Os jogadores são emparelhados com a
          pessoa mais próxima deles nas chaves, normalmente, jogadores com o mesmo número de
          pontos se enfrentarão. Dada a natureza dos torneios suíços, às vezes os jogadores serão
          emparelhados para baixo ou para cima, já que o algoritmo não pode colocar jogadores que
          já lutaram juntos.
        </p>
      </section>
    </PageShell>
  );
}
