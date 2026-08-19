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

function decodeXmlEntity(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseXmlAttributes(tag) {
  const attrs = {};
  const attrRegex = /([A-Za-z_:][A-Za-z0-9_:.-]*)\s*=\s*"([^"]*)"/g;
  let match;

  while ((match = attrRegex.exec(tag))) {
    attrs[match[1].toLowerCase()] = decodeXmlEntity(match[2]);
  }

  return attrs;
}

function addEntry(entries, entry) {
  const nome = String(entry?.nome || "").trim();
  const quantidade = Number(entry?.quantidade || 0);

  if (!nome || !Number.isFinite(quantidade) || quantidade <= 0) {
    return;
  }

  const existing = entries.find((item) => item.nome.toLowerCase() === nome.toLowerCase());
  if (existing) {
    existing.quantidade += quantidade;
  } else {
    entries.push(entry.mtgoId ? { quantidade, nome, mtgoId: entry.mtgoId } : { quantidade, nome });
  }
}

function looksLikeDekXml(content) {
  const text = String(content || "").trimStart();
  return text.startsWith("<?xml") || /^<Deck\b/i.test(text);
}

function parseDeckXml(content) {
  const mainEntries = [];
  const sideEntries = [];
  const commanderEntries = [];
  const cardRegex = /<Cards\b[^>]*\/?>/gi;
  let match;

  while ((match = cardRegex.exec(String(content || "")))) {
    const attrs = parseXmlAttributes(match[0]);
    const nome = attrs.name?.trim();
    const quantidade = Number(attrs.quantity);

    if (!nome || !Number.isFinite(quantidade) || quantidade <= 0) {
      continue;
    }

    const entry = {
      quantidade,
      nome,
      mtgoId: attrs.catid ? Number(attrs.catid) : undefined,
    };

    if (String(attrs.sideboard || "").toLowerCase() === "true") {
      addEntry(sideEntries, entry);
    } else {
      addEntry(mainEntries, entry);
    }
  }

  return { mainEntries, sideEntries, commanderEntries };
}

/**
 * Parseia listas de deck em texto (.txt / .dek / .deck / paste).
 * Suporta headers Arena/Moxfield, prefixos MTGO (SB:/CM:) e ignora comentários // e #.
 */
export function parseDeckTxt(content) {
  if (looksLikeDekXml(content)) {
    return parseDeckXml(content);
  }

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
      addEntry(mainEntries, parsed);
    } else if (section === "side") {
      addEntry(sideEntries, parsed);
    } else {
      addEntry(commanderEntries, parsed);
    }
  }

  return { mainEntries, sideEntries, commanderEntries };
}
