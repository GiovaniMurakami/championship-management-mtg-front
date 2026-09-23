/**
 * Parser do arquivo de artigo no formato do modelo Word/TXT do Fuguete.
 *
 * Cabeçalho opcional:
 *   Título: ...
 *   Chamada: ...
 *   Tags: a; b; c
 *   Descrição: ...
 *   ARTIGO:
 *   <corpo>
 *
 * Se não houver cabeçalho, o arquivo inteiro vira o corpo.
 */

function limparValor(valor) {
  return String(valor || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .trim();
}

export function parseArquivoArtigo(textoBruto) {
  const texto = String(textoBruto || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const resultado = {
    titulo: "",
    chamada: "",
    descricao: "",
    tags: "",
    conteudo: "",
  };

  const artigoMatch = texto.match(/(?:^|\n)\s*ARTIGO\s*:\s*\n?/i);
  if (!artigoMatch) {
    resultado.conteudo = texto.trim();
    return resultado;
  }

  const header = texto.slice(0, artigoMatch.index);
  resultado.conteudo = texto.slice(artigoMatch.index + artigoMatch[0].length).trim();

  const campo = (nome) => {
    const re = new RegExp(`^\\s*${nome}\\s*:\\s*(.*)$`, "im");
    const m = header.match(re);
    return m ? limparValor(m[1]) : "";
  };

  resultado.titulo = campo("T[ií]tulo");
  resultado.chamada = campo("Chamada");
  resultado.descricao = campo("Descri[cç][aã]o");
  resultado.tags = campo("Tags");

  return resultado;
}

/** Extrai texto plano de um .docx (OOXML) no browser. */
export async function extrairTextoDocx(arrayBuffer) {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(arrayBuffer);
  const documento = zip.file("word/document.xml");
  if (!documento) {
    throw new Error("Arquivo .docx inválido (document.xml ausente).");
  }
  const xml = await documento.async("string");
  return xml
    .replace(/<w:tab[^/]*\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:br[^/]*\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

export async function lerArquivoArtigo(file) {
  const nome = (file?.name || "").toLowerCase();
  if (nome.endsWith(".docx")) {
    const buffer = await file.arrayBuffer();
    const texto = await extrairTextoDocx(buffer);
    return parseArquivoArtigo(texto);
  }
  if (nome.endsWith(".txt") || nome.endsWith(".md") || file?.type?.startsWith("text/")) {
    const texto = await file.text();
    return parseArquivoArtigo(texto);
  }
  throw new Error("Use um arquivo .txt, .md ou .docx no formato do modelo.");
}
