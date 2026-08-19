import { Link } from "react-router-dom";
import { useScryfallArt } from "../../hooks/useScryfallArt";
import { MetagameManaPips } from "./MetagameManaPips";

function formatarNomeCarta(nome) {
  if (!nome) return "";
  return nome
    .split(" ")
    .map((parte) => (parte ? parte.charAt(0).toUpperCase() + parte.slice(1) : parte))
    .join(" ");
}

export function MetagameArchetypeCard({ arquetipo, formato, dias, colors, onCardMouseEnter, onCardMouseLeave }) {
  const { imagem } = useScryfallArt(arquetipo.cartaRepresentativa);
  const to = `/metagame/${encodeURIComponent(formato)}/${encodeURIComponent(arquetipo.slug)}?dias=${dias}`;
  const cartasChave = (arquetipo.cartasChave || []).slice(0, 3);

  return (
    <Link
      to={to}
      className="flex flex-col no-underline text-inherit overflow-hidden rounded-xl border border-[rgba(217,180,255,0.14)] bg-[rgba(18,12,32,0.72)] hover:border-[rgba(199,149,255,0.5)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(3,2,8,0.45)] transition-[border-color,transform,box-shadow] duration-200"
    >
      <div
        className="aspect-[16/9] overflow-hidden bg-[rgba(20,12,36,0.9)]"
        onMouseEnter={() => {
          if (arquetipo.cartaRepresentativa) onCardMouseEnter?.({ nome: arquetipo.cartaRepresentativa, imagem });
        }}
        onMouseLeave={onCardMouseLeave}
      >
        {imagem ? (
          <img src={imagem} alt="" className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#3b1d66] to-[#1a102c]" />
        )}
      </div>
      <div className="flex flex-col flex-1 px-3 pt-3 pb-2">
        <div className="font-bold text-[#d9b4ff] text-[0.98rem] leading-tight line-clamp-2">
          {arquetipo.nome}
        </div>
        <div className="mt-1.5 min-h-[16px]">
          <MetagameManaPips colors={colors} />
        </div>
        <ul className="m-0 mt-2 p-0 list-none text-[0.8rem] text-[#cfc3e6] leading-relaxed flex-1">
          {cartasChave.map((carta) => (
            <li
              key={carta}
              className="truncate cursor-default hover:text-[#f5edff]"
              onMouseEnter={(event) => {
                event.preventDefault();
                onCardMouseEnter?.({ nome: carta });
              }}
              onMouseLeave={onCardMouseLeave}
            >
              {formatarNomeCarta(carta)}
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-2 border-t border-[rgba(217,180,255,0.1)] grid grid-cols-2 gap-2">
          <div>
            <div className="text-[0.65rem] uppercase tracking-wide text-[#8f82ad]">Meta %</div>
            <div className="font-bold text-[#f5edff] text-[0.95rem]">
              {arquetipo.metaPct}%
              <span className="ml-1 font-normal text-[0.78rem] text-[#beafd7]">({arquetipo.copias})</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[0.65rem] uppercase tracking-wide text-[#8f82ad]">Winrate</div>
            <div className="font-bold text-[#f5edff] text-[0.95rem]">{arquetipo.winrate}%</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
