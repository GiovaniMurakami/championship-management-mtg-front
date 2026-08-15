import { resolveTop8BackgroundUrl, formatTop8StoryDate } from "../../utils/top8Story";

const SAMPLE_PLAYERS = [
  { pos: 1, nome: "Jogador 1", deck: "Deck exemplo", gold: true },
  { pos: 2, nome: "Jogador 2", deck: "Deck exemplo", silver: true },
  { pos: 3, nome: "Jogador 3", deck: "Deck exemplo", bronze: true },
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
 * Pré-visualização 9:16 do story Top 8 — só a data abaixo dos jogadores.
 */
export function Top8StoryPreview({
  horario = "",
  storyFundoUrl = "",
  className = "",
}) {
  const backgroundUrl = resolveTop8BackgroundUrl(storyFundoUrl);
  const dataLabel = formatTop8StoryDate(horario);

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <p className="text-[0.82rem] text-[#beafd7] m-0">Pré-visualização do story</p>
      <div
        className="w-full max-w-[220px] aspect-[9/16] rounded-xl overflow-hidden border border-[rgba(199,149,255,0.25)] bg-cover bg-center relative shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        style={{ backgroundImage: `url("${backgroundUrl}")` }}
        role="img"
        aria-label="Pré-visualização do story Top 8"
      >
        <ul className="absolute inset-x-0 top-[28%] bottom-[10%] list-none m-0 px-2 py-0 flex flex-col justify-evenly gap-1">
          {SAMPLE_PLAYERS.map((player) => (
            <li
              key={player.pos}
              className={`flex items-center gap-1.5 rounded-md border px-1.5 py-1 min-h-0 ${sampleCardClass(player)}`}
            >
              <span className={`text-[0.72rem] font-black shrink-0 ${samplePosClass(player)}`}>
                #{player.pos}
              </span>
              <span className="min-w-0 flex flex-col leading-tight">
                <span className="text-[0.58rem] font-bold text-[#f0e6ff] truncate">{player.nome}</span>
                <span className="text-[0.52rem] text-[#a78bfa] truncate">{player.deck}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="absolute inset-x-0 bottom-[1%] px-2 text-center">
          <span className="text-[0.62rem] font-medium text-[#c4b5fd] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
            {dataLabel || "Data do torneio"}
          </span>
        </div>
      </div>
      <p className="text-[0.75rem] text-[#8f82ad] m-0 max-w-[220px]">
        Escolha um fundo cadastrado ou cadastre um novo com nome. A data aparece abaixo do Top 8.
      </p>
    </div>
  );
}
