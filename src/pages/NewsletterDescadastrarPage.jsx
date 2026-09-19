import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { descadastrarNewsletter } from "../services/backendApi";
import { BTN_PRIMARY } from "../styles/uiClasses";

export function NewsletterDescadastrarPage() {
  usePageTitle("Descadastrar newsletter");
  const { marcarNewsletterDescadastrada } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState(token ? "loading" : "invalid");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMensagem("Link de descadastro inválido ou incompleto.");
      return undefined;
    }

    let cancelled = false;
    descadastrarNewsletter(token)
      .then((res) => {
        if (cancelled) return;
        if (res?.usuarioId) {
          marcarNewsletterDescadastrada(res.usuarioId);
        }
        setStatus("ok");
        setMensagem(
          res?.emailMascarado
            ? `Pronto. Removemos ${res.emailMascarado} da lista da newsletter de metagame.`
            : "Pronto. Você não receberá mais a newsletter de metagame.",
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setMensagem(err.message || "Não foi possível concluir o descadastro.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <PageShell className="mx-auto max-w-lg px-4 pb-16 pt-28">
      <div className="rounded-2xl border border-line-soft bg-surface/70 p-6 text-center shadow-card">
        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand">
          Newsletter
        </p>
        <h1 className="m-0 mt-2 font-['Bebas_Neue',sans-serif] text-[2rem] tracking-[0.04em] text-white">
          Descadastrar
        </h1>

        {status === "loading" && (
          <div className="mt-8 flex justify-center">
            <Spinner text="Removendo da lista..." />
          </div>
        )}

        {status !== "loading" && (
          <>
            <p className="m-0 mt-4 text-[0.95rem] leading-6 text-text-soft">{mensagem}</p>
            <Link to="/" className={`${BTN_PRIMARY} mt-6 inline-flex no-underline`}>
              Voltar ao início
            </Link>
          </>
        )}
      </div>
    </PageShell>
  );
}
