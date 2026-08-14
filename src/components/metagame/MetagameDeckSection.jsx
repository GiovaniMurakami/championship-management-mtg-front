import { DeckList } from "../deck/DeckList";

export function MetagameDeckSection({ titulo, cartas, onCardMouseEnter, onCardMouseLeave }) {
  if (!cartas?.length) return null;
  return (
    <section className="mb-6">
      <h3 className="m-0 mb-2 text-[#f5edff] text-[1.05rem] font-semibold">{titulo}</h3>
      <DeckList
        cards={cartas}
        readOnly
        onCardMouseEnter={onCardMouseEnter}
        onCardMouseLeave={onCardMouseLeave}
      />
    </section>
  );
}
