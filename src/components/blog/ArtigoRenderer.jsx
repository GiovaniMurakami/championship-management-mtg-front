import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseArtigoMarkup, extrairNomesCartas } from "../../utils/artigoMarkup";
import { buscarCartasPorNome } from "../../services/scryfallApi";
import { buscarDeck } from "../../services/backendApi";
import { deckPath } from "../../utils/deckUrl";
import { DeckGroupedList, DeckTypeBadges } from "../deck/DeckGroupedList";
import { groupCardsByType } from "../../utils/deckTypeGroups";

const FORMAT_LABELS = {
  standard: "Standard",
  modern: "Modern",
  pioneer: "Pioneer",
  legacy: "Legacy",
  pauper: "Pauper",
  commander: "Commander",
  commander500: "Commander 500",
};

function CardHover({ nome, carta, children }) {
  const [aberto, setAberto] = useState(false);
  return (
    <span
      className="relative inline whitespace-nowrap"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
    >
      <span className="text-brand underline decoration-dotted underline-offset-2 font-medium cursor-help">
        {children || nome}
      </span>
      {aberto && carta?.imagem && (
        <span className="absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-[180px] rounded-lg overflow-hidden shadow-xl border border-line pointer-events-none">
          <img src={carta.imagem} alt={nome} className="block w-full" />
        </span>
      )}
    </span>
  );
}

function CardInfo({ nome, carta }) {
  if (!carta) {
    return (
      <div className="my-4 rounded-xl border border-line-soft bg-white/[0.03] p-4 text-text-soft text-sm">
        Carregando {nome}…
      </div>
    );
  }
  return (
    <div className="my-5 flex flex-col sm:flex-row gap-4 rounded-xl border border-line-soft bg-[linear-gradient(155deg,rgba(26,16,50,0.95),rgba(16,10,32,0.98))] p-4">
      {carta.imagem && (
        <img src={carta.imagem} alt={carta.nome || nome} className="w-[160px] rounded-lg border border-line self-center sm:self-start" />
      )}
      <div className="min-w-0">
        <h3 className="m-0 text-lg font-semibold text-text-main">{carta.nome || nome}</h3>
        {carta.typeLine && <p className="m-0 mt-1 text-sm text-text-soft">{carta.typeLine}</p>}
        {carta.oracleText && (
          <p className="m-0 mt-3 text-sm text-[#d4c4f0] whitespace-pre-wrap leading-relaxed">{carta.oracleText}</p>
        )}
      </div>
    </div>
  );
}

function CardSide({ cards, porNome }) {
  return (
    <div className="my-5 flex flex-wrap gap-3 justify-center sm:justify-start">
      {cards.map((card) => {
        const carta = porNome.get(card.nome.toLowerCase());
        return (
          <div key={`${card.nome}-${card.quantidade}`} className="w-[110px] text-center">
            {carta?.imagem ? (
              <img src={carta.imagem} alt={card.nome} className="w-full rounded-md border border-line" />
            ) : (
              <div className="aspect-[5/7] rounded-md border border-line-soft bg-white/[0.04] flex items-center justify-center text-[0.7rem] text-text-muted p-1">
                {card.nome}
              </div>
            )}
            <p className="m-0 mt-1 text-[0.72rem] text-text-soft">
              {card.quantidade > 1 ? `${card.quantidade}× ` : ""}{card.nome}
            </p>
          </div>
        );
      })}
    </div>
  );
}

async function resolverListaCartas(entries = []) {
  if (!entries.length) return [];
  const cartas = await buscarCartasPorNome(entries.map((e) => e.nome));
  return entries.map((entry, index) => {
    const carta = cartas[index];
    return carta
      ? {
          nome: carta.nome,
          quantidade: entry.quantidade || 1,
          imagem: carta.imagem || "",
          cmc: carta.cmc,
          typeLine: carta.typeLine || "",
          colors: carta.colors || [],
          manaCost: carta.manaCost || "",
          isBasicLand: carta.isBasicLand,
        }
      : {
          nome: entry.nome,
          quantidade: entry.quantidade || 1,
          imagem: "",
          cmc: 0,
          typeLine: "",
          colors: [],
        };
  });
}

function DeckEmbed({ deckRef, authToken }) {
  const [deck, setDeck] = useState(null);
  const [maindeck, setMaindeck] = useState([]);
  const [sideboard, setSideboard] = useState([]);
  const [commander, setCommander] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setErro("");
    setCarregando(true);
    setDeck(null);
    setMaindeck([]);
    setSideboard([]);
    setCommander([]);

    buscarDeck(deckRef, authToken)
      .then(async (res) => {
        const data = res?.deck || res;
        if (!ativo || !data) return;
        const [main, side, cmd] = await Promise.all([
          resolverListaCartas(data.maindeck || []),
          resolverListaCartas(data.sideboard || []),
          resolverListaCartas(
            Array.isArray(data.commander)
              ? data.commander
              : data.commander
                ? [data.commander]
                : [],
          ),
        ]);
        if (!ativo) return;
        setDeck(data);
        setMaindeck(main);
        setSideboard(side);
        setCommander(cmd);
      })
      .catch(() => {
        if (ativo) setErro("Deck não encontrado.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => { ativo = false; };
  }, [deckRef, authToken]);

  const grouped = useMemo(() => groupCardsByType(maindeck), [maindeck]);
  const totalMain = useMemo(
    () => maindeck.reduce((s, c) => s + (c.quantidade || 1), 0),
    [maindeck],
  );
  const totalSide = useMemo(
    () => sideboard.reduce((s, c) => s + (c.quantidade || 1), 0),
    [sideboard],
  );

  if (erro) return <p className="text-sm text-text-muted my-3">{erro}</p>;
  if (carregando || !deck) {
    return <p className="text-sm text-text-soft my-3">Carregando deck…</p>;
  }

  const href = deckPath({ id: deck.id, nome: deck.nome }, { view: true });
  const formatoLabel = FORMAT_LABELS[deck.formato] || deck.formato;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-line-soft bg-[rgba(14,9,28,0.55)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-4 py-3">
        <div className="min-w-0">
          <p className="m-0 text-xs uppercase tracking-wider text-brand font-bold">Deck</p>
          <Link to={href} className="mt-1 block text-lg font-semibold text-[#c4b5fd] hover:text-white">
            {deck.nomeConsolidado || deck.nome || deckRef}
          </Link>
          <p className="m-0 mt-1 text-sm text-text-soft">
            {[formatoLabel, deck.usuario?.nome].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Link
          to={href}
          className="shrink-0 rounded-lg border border-[rgba(199,149,255,0.4)] bg-[rgba(167,79,255,0.14)] px-3 py-2 text-xs font-semibold text-[#ddd0ff] hover:bg-[rgba(167,79,255,0.26)]"
        >
          Abrir deck
        </Link>
      </div>

      <div className="relative px-4 py-4">
        {hoveredCard?.imagem && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 hidden w-[160px] overflow-hidden rounded-lg border border-line shadow-xl lg:block">
            <img src={hoveredCard.imagem} alt={hoveredCard.nome} className="block w-full" />
          </div>
        )}
        <DeckTypeBadges grouped={grouped} />
        <div className="mt-4 max-w-xl">
          <DeckGroupedList
            maindeck={maindeck}
            sideboard={sideboard}
            commander={commander}
            onCardMouseEnter={(card) => (card.imagem ? setHoveredCard(card) : null)}
            onCardMouseLeave={() => setHoveredCard(null)}
          />
        </div>
        <p className="m-0 mt-4 text-xs text-text-muted">
          {totalMain} main{totalSide > 0 ? ` · ${totalSide} side` : ""}
        </p>
      </div>
    </div>
  );
}

function renderTextWithCards(value, porNome) {
  const partes = String(value).split(/(\[\[[^\]]+\]\])/g);
  return partes.map((parte, idx) => {
    if (!parte) return null;
    const m = parte.match(/^\[\[([^\]]+)\]\]$/);
    if (m) {
      const nome = m[1].trim();
      return (
        <CardHover key={idx} nome={nome} carta={porNome.get(nome.toLowerCase())}>
          {nome}
        </CardHover>
      );
    }
    return <span key={idx}>{parte}</span>;
  });
}

/** Junta texto + [[carta]] no mesmo fluxo; blocos (h1, deck, etc.) ficam separados. */
function agruparTokens(tokens) {
  const blocos = [];
  let inline = [];

  const flushInline = () => {
    if (!inline.length) return;
    const merged = inline
      .map((t) => (t.type === "card" ? `[[${t.value}]]` : t.value))
      .join("");
    const paragrafos = merged.split(/\n{2,}/);
    for (const paragrafo of paragrafos) {
      if (paragrafo.length === 0) continue;
      blocos.push({ type: "paragraph", value: paragrafo });
    }
    inline = [];
  };

  for (const token of tokens) {
    if (token.type === "text" || token.type === "card") {
      inline.push(token);
    } else {
      flushInline();
      blocos.push(token);
    }
  }
  flushInline();
  return blocos;
}

export function ArtigoRenderer({ conteudo, token: authToken }) {
  const tokens = useMemo(() => parseArtigoMarkup(conteudo), [conteudo]);
  const blocos = useMemo(() => agruparTokens(tokens), [tokens]);
  const nomes = useMemo(() => extrairNomesCartas(tokens), [tokens]);
  const [porNome, setPorNome] = useState(() => new Map());

  useEffect(() => {
    if (!nomes.length) return undefined;
    let ativo = true;
    buscarCartasPorNome(nomes)
      .then((cartas) => {
        if (!ativo) return;
        const mapa = new Map();
        for (const carta of cartas || []) {
          if (carta?.nome) mapa.set(String(carta.nome).toLowerCase(), carta);
        }
        for (const nome of nomes) {
          const found = (cartas || []).find(
            (c) => c?.nome && c.nome.toLowerCase() === nome.toLowerCase()
          );
          if (found) mapa.set(nome.toLowerCase(), found);
        }
        setPorNome(mapa);
      })
      .catch(() => {});
    return () => { ativo = false; };
  }, [nomes]);

  return (
    <article className="prose-invert max-w-none text-[1.02rem] leading-relaxed text-[#e8dff8]">
      {blocos.map((token, idx) => {
        if (token.type === "paragraph") {
          return (
            <p key={idx} className="m-0 mb-4 whitespace-pre-wrap">
              {renderTextWithCards(token.value, porNome)}
            </p>
          );
        }
        if (token.type === "h1") {
          return (
            <h2 key={idx} className="mt-8 mb-3 text-2xl font-bold tracking-tight text-white border-b border-line-soft pb-2">
              {token.value}
            </h2>
          );
        }
        if (token.type === "cardinfo") {
          return <CardInfo key={idx} nome={token.value} carta={porNome.get(token.value.toLowerCase())} />;
        }
        if (token.type === "cardside") {
          return <CardSide key={idx} cards={token.cards} porNome={porNome} />;
        }
        if (token.type === "deck") {
          return <DeckEmbed key={idx} deckRef={token.value} authToken={authToken} />;
        }
        return null;
      })}
    </article>
  );
}
