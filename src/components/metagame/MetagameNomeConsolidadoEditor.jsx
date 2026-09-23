import { useState } from "react";
import { TOURNAMENT_INPUT_CLASS } from "../../styles/uiClasses";

export function MetagameNomeConsolidadoEditor({
  valorInicial,
  onSalvar,
  salvando = false,
  dica,
}) {
  const [nome, setNome] = useState(valorInicial || "");
  const atual = (valorInicial || "").trim();
  const proximo = nome.trim();
  const inalterado = proximo === atual;

  return (
    <form
      className="flex flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        onSalvar(proximo || null);
      }}
    >
      <label className="flex flex-col gap-1 min-w-0">
        <span className="text-[0.72rem] uppercase tracking-wide text-text-muted font-semibold">
          Nome consolidado
        </span>
        <span className="flex flex-wrap gap-2 items-center">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={100}
            placeholder="Ex.: Blue Terror"
            disabled={salvando}
            className={`${TOURNAMENT_INPUT_CLASS} py-1.5 px-3 text-[0.88rem] min-w-[180px] flex-1`}
          />
          <button
            type="submit"
            disabled={salvando || inalterado}
            className="px-3 py-1.5 border border-[rgba(167,79,255,0.5)] rounded-lg bg-[rgba(167,79,255,0.2)] text-[#e8dfff] text-[0.8rem] font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:not-disabled:bg-[rgba(167,79,255,0.32)]"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </span>
      </label>
      {dica && <p className="m-0 text-[0.75rem] text-text-muted">{dica}</p>}
    </form>
  );
}
