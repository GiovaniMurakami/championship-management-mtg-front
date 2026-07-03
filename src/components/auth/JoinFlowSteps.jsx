export function JoinFlowSteps({ currentStep }) {
  const steps = [
    { id: 1, label: "Conta" },
    { id: 2, label: "Deck" },
    { id: 3, label: "Confirmar" },
  ];

  return (
    <ol className="mb-6 grid grid-cols-3 gap-2 list-none p-0 m-0">
      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;

        return (
          <li
            key={step.id}
            className={[
              "rounded-lg border px-2 py-2 text-center text-[0.72rem] font-bold uppercase tracking-[0.08em] transition-colors",
              isActive
                ? "border-[rgba(199,149,255,0.45)] bg-[rgba(167,79,255,0.16)] text-[#e8dfff]"
                : isDone
                  ? "border-[rgba(44,207,180,0.25)] bg-[rgba(44,207,180,0.08)] text-[#5eead4]"
                  : "border-[rgba(217,180,255,0.12)] bg-transparent text-[#8f82ad]",
            ].join(" ")}
          >
            <span className="block text-[0.65rem] opacity-80">Passo {step.id}</span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
