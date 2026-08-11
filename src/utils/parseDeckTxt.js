function normalizeHeader(line) {
  return line
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/:$/, "");
}

function stripInlineComment(line) {
  const withoutSlash = line.replace(/\s+\/\/.*$/, "");
  return withoutSlash.replace(/\s+#(?![0-9a-fA-F]{3,8}\b).*$/, "").trim();
}

function parseDeckLine(line) {
  const cleaned = stripInlineComment(line);
  const match = cleaned.match(/^(\d+)\s+(.+)$/);

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

function parsePrefixedLine(line) {
  const cleaned = stripInlineComment(line);
  const match = cleaned.match(/^(SB|CM|SIDEBOARD|COMMANDER)\s*:\s*(\d+)\s+(.+)$/i);

  if (!match) {
    return null;
  }

  const prefix = match[1].toUpperCase();
  const quantidade = Number(match[2]);
  const nome = match[3].trim();

  if (!quantidade || !nome) {
    return null;
  }

  const section =
    prefix === "CM" || prefix === "COMMANDER"
      ? "commander"
      : "side";

  return { section, quantidade, nome };
}

/**
 * Parseia listas de deck em texto (.txt / .dek / .deck / paste).
 * Suporta headers Arena/Moxfield, prefixos MTGO (SB:/CM:) e ignora comentários // e #.
 */
export function parseDeckTxt(content) {
  const lines = String(content || "").split(/\r?\n/);
  const mainEntries = [];
  const sideEntries = [];
  const commanderEntries = [];

  let section = "main";
  let sawBlankLine = false;

  for (const rawLine of lines) {
    let line = rawLine.trim();

    if (!line) {
      sawBlankLine = true;
      continue;
    }

    if (line.startsWith("//") || line.startsWith("#")) {
      continue;
    }

    line = stripInlineComment(line);
    if (!line) {
      continue;
    }

    const prefixed = parsePrefixedLine(line);
    if (prefixed) {
      if (prefixed.section === "side") {
        sideEntries.push({ quantidade: prefixed.quantidade, nome: prefixed.nome });
      } else {
        commanderEntries.push({ quantidade: prefixed.quantidade, nome: prefixed.nome });
      }
      continue;
    }

    const header = normalizeHeader(line);

    if (header === "main deck" || header === "maindeck" || header === "deck") {
      section = "main";
      sawBlankLine = false;
      continue;
    }

    if (
      header === "sideboard" ||
      header === "side board" ||
      header === "sideboard:" ||
      header === "side"
    ) {
      section = "side";
      sawBlankLine = false;
      continue;
    }

    if (header === "commander" || header === "comandante") {
      section = "commander";
      sawBlankLine = false;
      continue;
    }

    // Estilo Arena/txt clássico: linha em branco separa main → side.
    if (sawBlankLine && section === "main") {
      section = "side";
      sawBlankLine = false;
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
