import { BRASILIA_TZ } from "./brasiliaTime";

export const DIAS_PADRAO_PERFIL = 30;
export const DIAS_OPCOES_PERFIL = [7, 14, 30, 90];

export function dataBrasiliaHoje(agora = new Date()) {
  return agora.toLocaleDateString("en-CA", { timeZone: BRASILIA_TZ });
}

/** Intervalo inclusivo de N dias civis terminando hoje, em horário de Brasília. */
export function intervaloUltimosDias(dias, hoje = dataBrasiliaHoje()) {
  const quantidade = Number(dias);
  const [ano, mes, dia] = String(hoje).split("-").map(Number);
  const inicio = new Date(Date.UTC(ano, mes - 1, dia));
  inicio.setUTCDate(inicio.getUTCDate() - (quantidade - 1));
  return {
    dataInicio: inicio.toISOString().slice(0, 10),
    dataFim: String(hoje),
  };
}

export function resolverPeriodoPerfil({ dataInicio = "", dataFim = "", dias = "" } = {}) {
  if (dataInicio && dataFim) return { dataInicio, dataFim };
  if (dias === "tudo") return {};
  const quantidade = DIAS_OPCOES_PERFIL.includes(Number(dias)) ? Number(dias) : DIAS_PADRAO_PERFIL;
  return intervaloUltimosDias(quantidade);
}
