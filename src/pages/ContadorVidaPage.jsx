import { useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";

function LifePlayer({ label, life, onChange, inverted = false }) {
  return (
    <div
      className={[
        "flex-1 min-h-0 flex flex-col items-center justify-center gap-4 px-4 py-5",
        "rounded-2xl border border-[rgba(217,180,255,0.2)]",
        inverted
          ? "bg-[linear-gradient(180deg,rgba(79,46,140,0.35),rgba(20,12,40,0.55))]"
          : "bg-[linear-gradient(0deg,rgba(79,46,140,0.35),rgba(20,12,40,0.55))]",
        inverted ? "rotate-180" : "",
      ].join(" ")}
    >
      <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#c795ff]">
        {label}
      </p>
      <p
        className="m-0 font-['Bebas_Neue',sans-serif] text-[clamp(4.5rem,18vw,7rem)] tracking-[0.04em] text-[#f5edff] leading-none tabular-nums select-none"
        aria-live="polite"
      >
        {life}
      </p>
      <div className="flex items-stretch gap-3 w-full max-w-[420px]">
        <button
          type="button"
          className={`${BTN_SECONDARY} flex-1 text-[2rem] py-5 min-h-[72px] rounded-2xl`}
          onClick={() => onChange(life - 1)}
          aria-label={`${label}: diminuir vida`}
        >
          −
        </button>
        <button
          type="button"
          className={`${BTN_PRIMARY} flex-1 text-[2rem] py-5 min-h-[72px] rounded-2xl`}
          onClick={() => onChange(life + 1)}
          aria-label={`${label}: aumentar vida`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ContadorVidaPage() {
  usePageTitle(PAGE_TITLES.contadorVida);
  const [startingLife, setStartingLife] = useState(20);
  const [life1, setLife1] = useState(20);
  const [life2, setLife2] = useState(20);

  const applyStartingLife = (value) => {
    setStartingLife(value);
    setLife1(value);
    setLife2(value);
  };

  const reset = () => {
    setLife1(startingLife);
    setLife2(startingLife);
  };

  return (
    <PageShell className="max-w-[720px] mx-auto !py-3 sm:!py-4">
      <header className="mb-3 text-center sm:text-left">
        <p className="m-0 mb-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#c795ff]">
          Ferramentas
        </p>
        <h1 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.8rem] sm:text-[2.2rem] tracking-[0.04em] text-[#f5edff]">
          Contador de vida
        </h1>
      </header>

      <section
        className="flex flex-col gap-2 min-h-[min(78vh,760px)]"
        aria-label="Contador frente a frente"
      >
        {/* Jogador oposto — invertido para ler da outra ponta da mesa */}
        <LifePlayer label="Jogador 2" life={life2} onChange={setLife2} inverted />

        {/* Faixa central de controles (legível pelos dois) */}
        <div className="flex flex-wrap items-center justify-center gap-2 px-2 py-2 rounded-xl border border-[rgba(217,180,255,0.14)] bg-[rgba(12,8,24,0.75)]">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#9f91bd] w-full text-center sm:w-auto sm:mr-1">
            Vida inicial
          </span>
          <button
            type="button"
            className={startingLife === 20 ? BTN_PRIMARY : BTN_SECONDARY}
            onClick={() => applyStartingLife(20)}
            aria-pressed={startingLife === 20}
          >
            20
          </button>
          <button
            type="button"
            className={startingLife === 40 ? BTN_PRIMARY : BTN_SECONDARY}
            onClick={() => applyStartingLife(40)}
            aria-pressed={startingLife === 40}
          >
            40
          </button>
          <button type="button" className={BTN_SECONDARY} onClick={reset}>
            Resetar
          </button>
        </div>

        {/* Jogador local — orientação normal */}
        <LifePlayer label="Jogador 1" life={life1} onChange={setLife1} />
      </section>
    </PageShell>
  );
}
