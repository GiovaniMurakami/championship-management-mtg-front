import { Children, isValidElement, useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";

function messageText(node) {
  return Children.toArray(node).map(child => isValidElement(child)
    ? messageText(child.props.children)
    : String(child)).join("");
}

// Compatibilidade para os retornos antigos: todos usam o toast global.
export function InlineAlert({ type = "error", children, onDismiss, action }) {
  const { addToast } = useToast();
  const lastMessage = useRef("");
  const key = `${type}:${messageText(children)}`;
  useEffect(() => {
    if (!children) { lastMessage.current = ""; return; }
    if (lastMessage.current === key) return;
    lastMessage.current = key;
    addToast(children, { type, action, onDismiss, dedupeKey: key });
  }, [children, type, action, onDismiss, key, addToast]);
  return null;
}
