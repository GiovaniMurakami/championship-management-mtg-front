import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "../context/ToastContext";
import { InlineAlert } from "../components/ui/InlineAlert";
import { FormFeedback } from "../components/ui/FormFeedback";

afterEach(() => vi.useRealTimers());
const wrap = children => <StrictMode><ToastProvider>{children}</ToastProvider></StrictMode>;
describe("retorno flutuante padrão", () => {
  it("remove feedback do formulário e mostra apenas um toast no StrictMode", () => {
    const { rerender } = render(wrap(<form aria-label="Teste"><FormFeedback message="Erro ao salvar" variant="error" /></form>));
    expect(screen.getByRole("form")).toBeEmptyDOMElement();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    rerender(wrap(<form aria-label="Teste"><FormFeedback message="Erro ao salvar" variant="error" /></form>));
    expect(screen.getAllByText("Erro ao salvar")).toHaveLength(1);
  });
  it("preserva ação de tentar novamente e fechamento", () => {
    const retry = vi.fn(); const dismiss = vi.fn();
    render(wrap(<InlineAlert onDismiss={dismiss} action={<button onClick={retry}>Tentar novamente</button>}>Falhou</InlineAlert>));
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(retry).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Fechar notificação" }));
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("deduplica o retorno já emitido pelo hook e permite repeti-lo após expirar", () => {
    vi.useFakeTimers();
    function Trigger() {
      const { addToast } = useToast();
      return <><button onClick={() => addToast("Salvo", { type: "success" })}>Salvar</button><FormFeedback message="Salvo" variant="success" /></>;
    }
    render(wrap(<Trigger />));
    fireEvent.click(screen.getByText("Salvar"));
    expect(screen.getAllByText("Salvo")).toHaveLength(1);
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.queryByText("Salvo")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Salvar"));
    expect(screen.getByRole("status")).toHaveTextContent("Salvo");
  });
});
