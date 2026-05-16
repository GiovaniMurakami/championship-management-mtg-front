function normalizeHeader(line) {
  return line
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function parseDeckLine(line) {
  const match = line.match(/^(\d+)\s+(.+)$/);

  if (!match) {
    return null;
  }

  const quantidade = Number(match[1]);
  const nome = match[2].trim();

  if (!quantidade || !nome) {
    return null;
  }

  return { quantidade, nome };
}

export function parseDeckTxt(content) {
  const lines = String(content || "").split(/\r?\n/);
  const mainEntries = [];
  const sideEntries = [];
  const commanderEntries = [];

  let section = "main";

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      section = "side";
      continue;
    }

    const header = normalizeHeader(line);

    if (header === "main deck" || header === "maindeck") {
      section = "main";
      continue;
    }

    if (header === "sideboard" || header === "side board") {
      section = "side";
      continue;
    }

    if (header === "commander" || header === "comandante") {
      section = "commander";
      continue;
    }

    const parsed = parseDeckLine(line);

    if (!parsed) {
      continue;
    }

    if (section === "main") {
      mainEntries.push(parsed);
    } else if (section === "side") {
      sideEntries.push(parsed);
    } else {
      commanderEntries.push(parsed);
    }
  }

  return { mainEntries, sideEntries, commanderEntries };
}
