const SUCCESS_PATTERN = /sucesso|boas-vindas|criada|criado|enviado|enviada|redefinida|atualizada|atualizado|salvo|salva/i;

const VARIANT_CLASS = {
  success: "border-[rgba(44,207,180,0.28)] bg-[rgba(44,207,180,0.08)] text-[#5eead4]",
  error: "border-[rgba(252,88,119,0.28)] bg-[rgba(252,88,119,0.08)] text-[#fca5a5]",
  info: "border-[rgba(199,149,255,0.28)] bg-[rgba(167,79,255,0.08)] text-[#d8cff0]",
};

function resolveVariant(message, variant) {
  if (variant === "success" || variant === "error" || variant === "info") return variant;
  return SUCCESS_PATTERN.test(message) ? "success" : "error";
}

export function FormFeedback({ message, variant, className = "" }) {
  if (!message) return null;

  const resolved = resolveVariant(message, variant);

  return (
    <p
      role="alert"
      className={`mb-0 rounded-xl border px-3.5 py-3 text-[0.88rem] leading-snug animate-[slide-up_300ms_ease-out,fade-in_300ms_ease-out] ${VARIANT_CLASS[resolved]} ${className}`}
    >
      {message}
    </p>
  );
}
