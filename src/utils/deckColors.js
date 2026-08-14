export const MANA_COLOR_ORDER = ["W", "U", "B", "R", "G"];

const BASIC_LAND_COLOR = {
  plains: "W",
  island: "U",
  swamp: "B",
  mountain: "R",
  forest: "G",
  "snow-covered plains": "W",
  "snow-covered island": "U",
  "snow-covered swamp": "B",
  "snow-covered mountain": "R",
  "snow-covered forest": "G",
};

function chaveNome(nome) {
  return String(nome || "").trim().toLowerCase();
}

function indexarCarta(porNome, chave, carta) {
  if (chave && carta) porNome.set(chave, carta);
}

export function nomesCartasParaCores(arquetipo, formato) {
  if (arquetipo?.cartasCores?.length) return arquetipo.cartasCores;
  const ehCommander = formato === "commander" || formato === "commander500";
  const commander = arquetipo?.listaTipica?.commander || [];
  if (ehCommander && commander.length > 0) {
    return commander.map((carta) => carta.nome).filter(Boolean);
  }
  const main = arquetipo?.listaTipica?.maindeck || [];
  if (main.length > 0) {
    return main.map((carta) => carta.nome).filter(Boolean);
  }
  return [arquetipo?.cartaRepresentativa, ...(arquetipo?.cartasChave || [])].filter(Boolean);
}

export function coresDoDeck(nomesCartas, cartasScryfall = []) {
  const porNome = new Map();
  for (const carta of cartasScryfall) {
    if (!carta) continue;
    indexarCarta(porNome, chaveNome(carta.nome), carta);
    indexarCarta(porNome, chaveNome(carta.nomePedido), carta);
    for (const face of String(carta.nome || "").split(" // ")) {
      indexarCarta(porNome, chaveNome(face), carta);
    }
  }

  const cores = new Set();
  for (const nome of nomesCartas || []) {
    const chave = chaveNome(nome);
    if (!chave) continue;
    const basico = BASIC_LAND_COLOR[chave];
    if (basico) {
      cores.add(basico);
      continue;
    }
    const carta = porNome.get(chave);
    const identidade = carta?.colorIdentity?.length
      ? carta.colorIdentity
      : (carta?.colors || []);
    for (const cor of identidade) {
      if (MANA_COLOR_ORDER.includes(cor)) cores.add(cor);
    }
  }

  return MANA_COLOR_ORDER.filter((cor) => cores.has(cor));
}
