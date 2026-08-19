const ORDEM = ["W", "U", "B", "R", "G"];

export function MetagameManaPips({ colors }) {
  const visiveis = ORDEM.filter((c) => (colors || []).includes(c));
  if (visiveis.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {visiveis.map((c) => (
        <img
          key={c}
          src={`https://svgs.scryfall.io/card-symbols/${c}.svg`}
          alt=""
          className="w-4 h-4"
        />
      ))}
    </span>
  );
}
