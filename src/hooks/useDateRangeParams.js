import { useSearchParams } from "react-router-dom";

export function useDateRangeParams() {
  const [params, setParams] = useSearchParams();
  const dataInicio = params.get("dataInicio") || "";
  const dataFim = params.get("dataFim") || "";
  const dateQuery = dataInicio || dataFim ? `&${new URLSearchParams({ dataInicio, dataFim })}` : "";
  const applyDates = (range) => setParams(previous => {
    const next = new URLSearchParams(previous);
    next.delete("partidasPagina");
    for (const key of ["dataInicio", "dataFim"]) {
      if (range[key]) next.set(key, range[key]);
      else next.delete(key);
    }
    return next;
  });
  return { dataInicio, dataFim, dateQuery, applyDates };
}
