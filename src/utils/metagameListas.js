export function chaveMetagameLista(lista) {
  return `${lista?.deckId || ""}:${lista?.torneioId || ""}`;
}

export function ordenarListasPorRecencia(listas, resultados = []) {
  const origem = Array.isArray(listas) ? listas : [];
  const horarioPorChave = new Map();
  for (const resultado of resultados || []) {
    horarioPorChave.set(chaveMetagameLista(resultado), resultado.horario || "");
  }

  return [...origem].sort((a, b) => {
    const ha = a.horario || horarioPorChave.get(chaveMetagameLista(a)) || "";
    const hb = b.horario || horarioPorChave.get(chaveMetagameLista(b)) || "";
    if (ha !== hb) return hb.localeCompare(ha);
    return 0;
  });
}

export function agruparResultadosPorTorneio(resultados) {
  const grupos = [];
  const porId = new Map();
  for (const resultado of resultados || []) {
    const id = resultado.torneioId || "";
    let grupo = porId.get(id);
    if (!grupo) {
      grupo = {
        torneioId: id,
        torneioNome: resultado.torneioNome || id,
        horario: resultado.horario || "",
        resultados: [],
      };
      porId.set(id, grupo);
      grupos.push(grupo);
    }
    grupo.resultados.push(resultado);
  }
  for (const grupo of grupos) {
    grupo.resultados.sort((a, b) => (Number(a.colocacao) || 99) - (Number(b.colocacao) || 99));
  }
  return grupos;
}
