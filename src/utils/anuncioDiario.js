export const ANUNCIO_DIARIO_STORAGE_KEY = "tf.anuncio-diario.carrossel";

/** Data civil em America/Sao_Paulo no formato YYYY-MM-DD. */
export function dataBrasiliaHoje() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function lerEstado() {
  if (typeof window === "undefined") return { data: dataBrasiliaHoje(), vistoIds: [] };
  try {
    const raw = window.localStorage.getItem(ANUNCIO_DIARIO_STORAGE_KEY);
    if (!raw) return { data: dataBrasiliaHoje(), vistoIds: [] };
    const parsed = JSON.parse(raw);
    const hoje = dataBrasiliaHoje();
    if (parsed?.data !== hoje || !Array.isArray(parsed?.vistoIds)) {
      return { data: hoje, vistoIds: [] };
    }
    return { data: hoje, vistoIds: parsed.vistoIds.map(String) };
  } catch {
    return { data: dataBrasiliaHoje(), vistoIds: [] };
  }
}

function salvarEstado(estado) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANUNCIO_DIARIO_STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // localStorage indisponível
  }
}

/** Retorna o próximo anúncio ainda não visto hoje (ordem do array). */
export function escolherProximoAnuncioDiario(anuncios = []) {
  const lista = Array.isArray(anuncios) ? anuncios.filter((a) => a?.id && a?.imagemUrl) : [];
  if (lista.length === 0) return null;
  const { vistoIds } = lerEstado();
  return lista.find((a) => !vistoIds.includes(String(a.id))) || null;
}

export function marcarAnuncioDiarioVisto(anuncioId) {
  if (!anuncioId) return;
  const estado = lerEstado();
  const id = String(anuncioId);
  if (!estado.vistoIds.includes(id)) {
    estado.vistoIds = [...estado.vistoIds, id];
  }
  salvarEstado(estado);
}
