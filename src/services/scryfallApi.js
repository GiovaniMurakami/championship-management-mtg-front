// Cache em memória com TTL de 10 minutos por query/nome
const _cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    _cache.delete(key);
    return undefined;
  }
  return entry.data;
}

function setCache(key, data) {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

export async function buscarCartasMTG(termo) {
  const query = termo?.trim();

  if (!query || query.length < 2) {
    return [];
  }

  const cacheKey = `search:${query}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  const url = new URL("https://api.scryfall.com/cards/search");
  url.searchParams.set("q", query);
  url.searchParams.set("unique", "cards");
  url.searchParams.set("order", "name");

  const response = await fetch(url.toString());

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  if (!Array.isArray(data?.data)) {
    return [];
  }

  const results = data.data.slice(0, 8).map((card) => {
    const isBasicLand =
      card.type_line?.includes("Basic") && card.type_line?.includes("Land");
    const cmc = Number.isFinite(card.cmc) ? card.cmc : Number(card.cmc) || 0;

    const legalities = {
      standard: card.legalities?.standard === "legal",
      modern: card.legalities?.modern === "legal",
      pioneer: card.legalities?.pioneer === "legal",
      legacy: card.legalities?.legacy === "legal",
      commander: card.legalities?.commander === "legal",
      pauper: card.legalities?.pauper === "legal",
    };

    return {
      id: card.id,
      nome: card.name,
      set: card.set_name,
      imagem:
        card.image_uris?.large || card.card_faces?.[0]?.image_uris?.large || "",
      isBasicLand,
      legalities,
      colors: card.colors || [],
      cmc,
      manaCost: card.mana_cost || "",
      typeLine: card.type_line || "",
    };
  });

  setCache(cacheKey, results);
  return results;
}

export async function buscarCartaPorNome(nome) {
  const query = nome?.trim();

  if (!query) {
    return null;
  }

  const cacheKey = `named:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  const url = new URL("https://api.scryfall.com/cards/named");
  url.searchParams.set("exact", query);

  const response = await fetch(url.toString());

  if (!response.ok) {
    return null;
  }

  const card = await response.json();
  const isBasicLand =
    card.type_line?.includes("Basic") && card.type_line?.includes("Land");
  const cmc = Number.isFinite(card.cmc) ? card.cmc : Number(card.cmc) || 0;

  const legalities = {
    standard: card.legalities?.standard === "legal",
    modern: card.legalities?.modern === "legal",
    pioneer: card.legalities?.pioneer === "legal",
    legacy: card.legalities?.legacy === "legal",
    commander: card.legalities?.commander === "legal",
    pauper: card.legalities?.pauper === "legal",
  };

  const result = {
    id: card.id,
    nome: card.name,
    set: card.set_name,
    imagem:
      card.image_uris?.large || card.card_faces?.[0]?.image_uris?.large || "",
    isBasicLand,
    legalities,
    colors: card.colors || [],
    cmc,
    manaCost: card.mana_cost || "",
    typeLine: card.type_line || "",
  };

  setCache(cacheKey, result);
  return result;
}
