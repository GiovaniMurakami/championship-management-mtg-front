import { resolveTop8BackgroundUrl, formatTop8StoryHeadline, getTop8StoryTextTheme } from "../../utils/top8Story";

const SAMPLE_PLAYERS = [
  { pos: 1, nome: "Jogador 1", deck: "Deck exemplo", record: "4-0", gold: true },
  { pos: 2, nome: "Jogador 2", deck: "Deck exemplo", record: "3-1", silver: true },
  { pos: 3, nome: "Jogador 3", deck: "Deck exemplo", record: "3-1", bronze: true },
];

function sampleCardClass({ gold, silver, bronze }) {
  if (gold) return "border-[rgba(255,215,0,0.55)] bg-[linear-gradient(90deg,#4a3510,#16100a)]";
  if (silver) return "border-[rgba(192,192,192,0.45)] bg-[linear-gradient(90deg,#32343b,#10131b)]";
  if (bronze) return "border-[rgba(205,127,50,0.45)] bg-[linear-gradient(90deg,#3a2418,#120d0a)]";
  return "border-[rgba(167,79,255,0.28)] bg-[linear-gradient(90deg,#23153a,#0d1022)]";
}

function samplePosClass({ gold, silver, bronze }) {
  if (gold) return "text-[#FFD700]";
  if (silver) return "text-[#C0C0C0]";
  if (bronze) return "text-[#CD7F32]";
  return "text-[#9d74e8]";
}

/**
 * Pré-visualização 9:16 do story Top 8 — jogadores + data acima do 1º, recorde no card.
 */
export function Top8StoryPreview({
  horario = "",
  storyFundoUrl = "",
  textoRodape = "escuro",
  className = "",
}) {
  const backgroundUrl = resolveTop8BackgroundUrl(storyFundoUrl);
  const headline = formatTop8StoryHeadline(horario, 32) || "32 jogadores";
  const textTheme = getTop8StoryTextTheme(textoRodape);

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <p className="text-[0.82rem] text-[#beafd7] m-0">Pré-visualização do story</p>
      <div
        className="w-full max-w-[220px] aspect-[9/16] rounded-xl overflow-hidden border border-[rgba(199,149,255,0.25)] bg-cover bg-center relative shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        style={{ backgroundImage: `url("${backgroundUrl}")` }}
        role="img"
        aria-label="Pré-visualização do story Top 8"
      >
        <div className="absolute inset-x-0 top-[26%] px-2 text-center">
          <span className={`text-[0.78rem] font-semibold whitespace-nowrap ${textTheme.previewClass}`}>
            {headline}
          </span>
        </div>
        <ul className="absolute inset-x-0 top-[32%] bottom-[8%] list-none m-0 px-2 py-0 flex flex-col justify-evenly gap-1">
          {SAMPLE_PLAYERS.map((player) => (
            <li
              key={player.pos}
              className={`flex items-center gap-1.5 rounded-md border px-1.5 py-1 min-h-0 ${sampleCardClass(player)}`}
            >
              <span className={`text-[0.72rem] font-black shrink-0 ${samplePosClass(player)}`}>
                #{player.pos}
              </span>
              <span className="min-w-0 flex-1 flex flex-col gap-0.5">
                <span className="text-[0.58rem] font-bold text-[#f0e6ff] truncate leading-[1.2]">{player.nome}</span>
                <span className="text-[0.52rem] text-[#a78bfa] truncate leading-[1.15]">{player.deck}</span>
              </span>
              <span className={`text-[0.58rem] font-bold tabular-nums shrink-0 ${player.gold ? "text-[#fde68a]" : "text-[#e8dfff]"}`}>
                {player.record}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[0.75rem] text-[#8f82ad] m-0 max-w-[220px]">
        Escolha um fundo cadastrado ou cadastre um novo com nome. A quantidade de jogadores e a data ficam acima do 1º lugar.
      </p>
    </div>
  );
}
