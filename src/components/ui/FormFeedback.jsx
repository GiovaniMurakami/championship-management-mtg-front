const SUCCESS_PATTERN = /sucesso|boas-vindas|criada|criado|enviado|enviada|redefinida|atualizada|atualizado|salvo|salva/i;

function resolveVariant(message, variant) {
  if (variant === "success" || variant === "error" || variant === "info") return variant;
  return SUCCESS_PATTERN.test(message) ? "success" : "error";
}

export function FormFeedback({ message, variant, className = "" }) {
  if (!message) return null;

  const resolved = resolveVariant(message, variant);

  return <InlineAlert type={resolved} className={className}>{message}</InlineAlert>;
}
import { InlineAlert } from "./InlineAlert";
