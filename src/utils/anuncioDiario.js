export const ANUNCIO_DIARIO_STORAGE_KEY = "tf.anuncio-diario.visto";

/** Data civil em America/Sao_Paulo no formato YYYY-MM-DD. */
export function dataBrasiliaHoje() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function jaViuAnuncioDiarioHoje() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(ANUNCIO_DIARIO_STORAGE_KEY) === dataBrasiliaHoje();
  } catch {
    return false;
  }
}

export function marcarAnuncioDiarioVistoHoje() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANUNCIO_DIARIO_STORAGE_KEY, dataBrasiliaHoje());
  } catch {
    // localStorage indisponível — o modal pode reaparecer nesta sessão
  }
}
