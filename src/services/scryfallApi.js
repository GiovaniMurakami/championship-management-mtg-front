export async function buscarCartasMTG(termo) {
  const query = termo?.trim();

  if (!query || query.length < 2) {
    return [];
  }

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

  return data.data.slice(0, 8).map((card) => {
    const isBasicLand =
      card.type_line?.includes("Basic") && card.type_line?.includes("Land");

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
        card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || "",
      isBasicLand,
      legalities,
    };
  });
}

export async function buscarCartaPorNome(nome) {
  const query = nome?.trim();

  if (!query) {
    return null;
  }

  const url = new URL("https://api.scryfall.com/cards/named");
  url.searchParams.set("exact", query);

  const response = await fetch(url.toString());

  if (!response.ok) {
    return null;
  }

  const card = await response.json();
  const isBasicLand =
    card.type_line?.includes("Basic") && card.type_line?.includes("Land");

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
      card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small || "",
    isBasicLand,
    legalities,
  };
}
