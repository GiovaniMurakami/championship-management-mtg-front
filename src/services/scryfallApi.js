import { isScryfallId } from "../utils/scryfallId";

// Cache em memoria com TTL de 10 minutos por query/nome.
const _cache = new Map();
const _pending = new Map();
const CACHE_TTL = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const COLLECTION_BATCH_SIZE = 75;
const SCRYFALL_MIN_INTERVAL_MS = 110;
let _lastScryfallRequestAt = 0;
let _scryfallQueue = Promise.resolve();

function normalizeNameKey(name) {
  return name?.trim().replace(/\s*\/\/\s*/g, " // ").replace(/\s+/g, " ").toLowerCase();
}

function getNameCandidates(name) {
  const normalized = name?.trim().replace(/\s*\/\/\s*/g, " // ").replace(/\s+/g, " ");

  if (!normalized) return [];

  const candidates = [normalized];
  const faces = normalized.split(" // ").map((face) => face.trim()).filter(Boolean);

  if (faces.length > 1) {
    candidates.push(...faces);
  }

  return [...new Set(candidates.map(normalizeNameKey).filter(Boolean))];
}

function cardMatchesName(card, name) {
  const queryCandidates = getNameCandidates(name);
  const cardCandidates = [
    ...getNameCandidates(card?.nome || card?.name),
    ...((card?.card_faces || []).flatMap((face) => getNameCandidates(face?.name))),
  ];

  return queryCandidates.some((candidate) => cardCandidates.includes(candidate));
}

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

function isAbortError(error) {
  return error?.name === "AbortError";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enqueueScryfallRequest(factory) {
  const run = _scryfallQueue.then(async () => {
    const elapsed = Date.now() - _lastScryfallRequestAt;
    if (elapsed < SCRYFALL_MIN_INTERVAL_MS) {
      await wait(SCRYFALL_MIN_INTERVAL_MS - elapsed);
    }
    _lastScryfallRequestAt = Date.now();
    return factory();
  });

  _scryfallQueue = run.catch(() => undefined);
  return run;
}

function normalizeCard(card) {
  const isBasicLand =
    card.type_line?.includes("Basic") && card.type_line?.includes("Land");
  const cmc = Number.isFinite(card.cmc) ? card.cmc : Number(card.cmc) || 0;

  return {
    id: card.id,
    oracleId: card.oracle_id || "",
    mtgoId: card.mtgo_id || null,
    mtgoIds: card.mtgo_ids || [],
    nome: card.name,
    set: card.set_name,
    imagem:
      card.image_uris?.normal
      || card.image_uris?.large
      || card.card_faces?.[0]?.image_uris?.normal
      || card.card_faces?.[0]?.image_uris?.large
      || "",
    artCrop:
      card.image_uris?.art_crop
      || card.card_faces?.[0]?.image_uris?.art_crop
      || "",
    isBasicLand,
    legalities: {
      standard: card.legalities?.standard === "legal",
      modern: card.legalities?.modern === "legal",
      pioneer: card.legalities?.pioneer === "legal",
      legacy: card.legalities?.legacy === "legal",
      commander: card.legalities?.commander === "legal",
      commander500: card.legalities?.commander === "legal",
      pauper: card.legalities?.pauper === "legal",
    },
    colors: card.colors || [],
    colorIdentity: Array.isArray(card.color_identity) && card.color_identity.length > 0
      ? card.color_identity
      : (card.colors || []),
    cmc,
    manaCost: card.mana_cost || "",
    typeLine: card.type_line || "",
  };
}

async function fetchJson(url, options = {}) {
  const { signal, headers, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const forwardAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      signal.addEventListener("abort", forwardAbort, { once: true });
    }
  }

  try {
    const response = await enqueueScryfallRequest(() => fetch(url, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...headers,
      },
      signal: controller.signal,
    }));

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", forwardAbort);
    }
  }
}

async function withPending(key, factory) {
  if (_pending.has(key)) {
    return _pending.get(key);
  }

  const promise = Promise.resolve()
    .then(factory)
    .finally(() => {
      _pending.delete(key);
    });

  _pending.set(key, promise);
  return promise;
}

export async function buscarCartasMTG(termo, options = {}) {
  const query = termo?.trim();

  if (!query || query.length < 2) {
    return [];
  }

  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  return withPending(cacheKey, async () => {
    const url = new URL("https://api.scryfall.com/cards/search");
    url.searchParams.set("q", query);
    url.searchParams.set("unique", "cards");
    url.searchParams.set("order", "name");

    let data;
    try {
      data = await fetchJson(url.toString(), { signal: options.signal });
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }
      return [];
    }

    if (!Array.isArray(data?.data)) {
      return [];
    }

    const results = data.data.slice(0, 8).map(normalizeCard);
    setCache(cacheKey, results);
    return results;
  });
}

export async function buscarCartaPorId(id, options = {}) {
  const scryfallId = String(id || "").trim();
  if (!isScryfallId(scryfallId)) return null;

  const cacheKey = `id:${scryfallId.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  return withPending(cacheKey, async () => {
    let data;
    try {
      data = await fetchJson(`https://api.scryfall.com/cards/${scryfallId}`, { signal: options.signal });
    } catch (error) {
      if (isAbortError(error)) throw error;
      return null;
    }
    if (!data) return null;
    const result = normalizeCard(data);
    setCache(cacheKey, result);
    setCache(`named:${normalizeNameKey(result.nome)}`, result);
    return result;
  });
}

export async function buscarArtesDaCarta(cartaOuNome, options = {}) {
  const nome = typeof cartaOuNome === "string" ? cartaOuNome : cartaOuNome?.nome;
  const oracleId = typeof cartaOuNome === "object" && cartaOuNome ? cartaOuNome.oracleId : "";
  const query = oracleId
    ? `oracleid:${oracleId}`
    : (nome?.trim() ? `!"${nome.trim().replace(/"/g, "")}"` : "");

  if (!query) return [];

  const cacheKey = `arts:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  return withPending(cacheKey, async () => {
    const url = new URL("https://api.scryfall.com/cards/search");
    url.searchParams.set("q", query);
    url.searchParams.set("unique", "art");
    url.searchParams.set("order", "released");

    let data;
    try {
      data = await fetchJson(url.toString(), { signal: options.signal });
    } catch (error) {
      if (isAbortError(error)) throw error;
      return [];
    }

    const results = Array.isArray(data?.data) ? data.data.map(normalizeCard) : [];
    setCache(cacheKey, results);
    return results;
  });
}

export async function buscarCartaPorNome(nome, options = {}) {
  const query = nome?.trim();

  if (!query) {
    return null;
  }

  if (isScryfallId(query)) {
    return buscarCartaPorId(query, options);
  }

  const cacheKey = `named:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  return withPending(cacheKey, async () => {
    const candidates = getNameCandidates(query);
    let card = null;

    for (const candidate of candidates) {
      const url = new URL("https://api.scryfall.com/cards/named");
      url.searchParams.set("exact", candidate);

      try {
        card = await fetchJson(url.toString(), { signal: options.signal });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        return null;
      }

      if (card) break;
    }

    if (!card) {
      const url = new URL("https://api.scryfall.com/cards/named");
      url.searchParams.set("fuzzy", query);

      try {
        card = await fetchJson(url.toString(), { signal: options.signal });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        return null;
      }
    }

    if (!card) {
      return null;
    }

    const result = normalizeCard(card);
    setCache(cacheKey, result);
    return result;
  });
}

export async function buscarCartasPorNome(nomes = [], options = {}) {
  const normalizedNames = nomes
    .map((nome) => nome?.trim())
    .filter(Boolean);

  if (normalizedNames.length === 0) {
    return [];
  }

  const uniqueNames = [...new Set(normalizedNames)];
  const resultsByName = new Map();
  const missingNames = [];

  uniqueNames.forEach((name) => {
    const normalizedKey = normalizeNameKey(name);
    const cacheKey = `named:${normalizedKey}`;
    const cached = getCached(cacheKey);
    if (cached !== undefined) {
      resultsByName.set(normalizedKey, cached);
    } else {
      missingNames.push(name);
    }
  });

  if (missingNames.length > 0) {
    const batches = [];
    for (let index = 0; index < missingNames.length; index += COLLECTION_BATCH_SIZE) {
      batches.push(missingNames.slice(index, index + COLLECTION_BATCH_SIZE));
    }

    for (const batch of batches) {
      const batchKey = `collection:${batch
        .map((name) => name.toLowerCase())
        .sort()
        .join("|")}`;

      const cards = await withPending(batchKey, async () => {
        let data;
        try {
          data = await fetchJson("https://api.scryfall.com/cards/collection", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifiers: batch.map((name) => (
                isScryfallId(name) ? { id: name } : { name }
              )),
            }),
            signal: options.signal,
          });
        } catch (error) {
          if (isAbortError(error)) {
            throw error;
          }
          return [];
        }

        if (!Array.isArray(data?.data)) {
          return [];
        }

        return data.data.map(normalizeCard);
      });

      cards.forEach((card) => {
        const normalizedKey = normalizeNameKey(card.nome);
        const cacheKey = `named:${normalizedKey}`;
        setCache(cacheKey, card);
        if (card.id) setCache(`id:${card.id.toLowerCase()}`, card);
        resultsByName.set(normalizedKey, card);

        for (const requestedName of batch) {
          if (
            (isScryfallId(requestedName) && card.id?.toLowerCase() === requestedName.toLowerCase())
            || cardMatchesName(card, requestedName)
          ) {
            resultsByName.set(normalizeNameKey(requestedName), card);
            setCache(`named:${normalizeNameKey(requestedName)}`, card);
          }
        }
      });
    }
  }

  if (options.fallbackIndividual !== false) {
    const unresolvedNames = normalizedNames.filter((name) => !resultsByName.has(normalizeNameKey(name)));

    for (const name of unresolvedNames) {
      const card = isScryfallId(name)
        ? await buscarCartaPorId(name, options)
        : await buscarCartaPorNome(name, options);
      resultsByName.set(normalizeNameKey(name), card);
    }
  }

  return normalizedNames.map((name) => resultsByName.get(normalizeNameKey(name)) || null);
}

function normalizeImportIdentifier(entry) {
  if (typeof entry === "string") {
    const name = entry.trim();
    return name ? { key: `name:${normalizeNameKey(name)}`, name } : null;
  }

  const name = entry?.nome?.trim();
  const mtgoId = Number(entry?.mtgoId);

  if (Number.isInteger(mtgoId) && mtgoId > 0) {
    return { key: `mtgo:${mtgoId}`, name, mtgoId };
  }

  return name ? { key: `name:${normalizeNameKey(name)}`, name } : null;
}

function collectionIdentifierForImport(entry) {
  if (entry.mtgoId) return { mtgo_id: entry.mtgoId };
  return { name: entry.name };
}

function cacheImportCard(entry, card, resultsByKey) {
  if (!card) return;

  resultsByKey.set(entry.key, card);
  setCache(`named:${normalizeNameKey(card.nome)}`, card);
  if (entry.name) {
    resultsByKey.set(`name:${normalizeNameKey(entry.name)}`, card);
    setCache(`named:${normalizeNameKey(entry.name)}`, card);
  }
}

export async function buscarCartasPorEntradas(entries = [], options = {}) {
  const normalizedEntries = entries
    .map(normalizeImportIdentifier)
    .filter(Boolean);

  if (normalizedEntries.length === 0) {
    return [];
  }

  const uniqueEntries = [];
  const seen = new Set();
  const resultsByKey = new Map();

  normalizedEntries.forEach((entry) => {
    if (entry.name) {
      const cached = getCached(`named:${normalizeNameKey(entry.name)}`);
      if (cached !== undefined) {
        resultsByKey.set(entry.key, cached);
        return;
      }
    }

    if (!seen.has(entry.key)) {
      seen.add(entry.key);
      uniqueEntries.push(entry);
    }
  });

  for (let index = 0; index < uniqueEntries.length; index += COLLECTION_BATCH_SIZE) {
    const batch = uniqueEntries.slice(index, index + COLLECTION_BATCH_SIZE);
    const batchKey = `collection-entries:${batch.map((entry) => entry.key).sort().join("|")}`;

    const cards = await withPending(batchKey, async () => {
      let data;
      try {
        data = await fetchJson("https://api.scryfall.com/cards/collection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifiers: batch.map(collectionIdentifierForImport),
          }),
          signal: options.signal,
        });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }
        return [];
      }

      if (!Array.isArray(data?.data)) {
        return [];
      }

      return data.data.map(normalizeCard);
    });

    cards.forEach((card) => {
      const matchByName = batch.find((entry) => entry.name && cardMatchesName(card, entry.name));
      if (matchByName) {
        cacheImportCard(matchByName, card, resultsByKey);
      }

      const mtgoIds = new Set([
        ...(card?.mtgoId ? [Number(card.mtgoId)] : []),
        ...((card?.mtgoIds || []).map(Number)),
      ].filter((id) => Number.isInteger(id) && id > 0));

      batch.forEach((entry) => {
        if (entry.mtgoId && mtgoIds.has(entry.mtgoId)) {
          cacheImportCard(entry, card, resultsByKey);
        }
      });
    });
  }

  const unresolved = normalizedEntries.filter((entry) => !resultsByKey.has(entry.key));
  for (const entry of unresolved) {
    if (!entry.name) {
      resultsByKey.set(entry.key, null);
      continue;
    }

    const card = await buscarCartaPorNome(entry.name, options);
    resultsByKey.set(entry.key, card);
  }

  return normalizedEntries.map((entry) => resultsByKey.get(entry.key) || null);
}
