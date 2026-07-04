import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { Tooltip } from "../components/ui/Tooltip";
import { InlineAlert } from "../components/ui/InlineAlert";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { listarParceiros } from "../services/backendApi";
import { PARCEIROS_FALLBACK } from "../constants/landingFallbacks";

export function LandingParceirosPage() {
  usePageTitle(PAGE_TITLES.parceiros);
  const { isAdmin } = useAuth();
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listarParceiros()
      .then((data) => {
        if (!active) return;
        setParceiros((data.parceiros || []).length ? data.parceiros : PARCEIROS_FALLBACK);
      })
      .catch(() => {
        if (!active) return;
        setParceiros(PARCEIROS_FALLBACK);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      <LandingHeader />

      <section className="max-w-4xl mx-auto px-4 pt-28 pb-12 text-center">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {isAdmin ? (
            <Link
              to="/landing/admin"
              className="rounded-xl border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.12)] px-4 py-2 text-sm font-semibold text-[#e8dfff] no-underline transition hover:bg-[rgba(167,79,255,0.2)]"
            >
              Gerenciar parceiros e apoiadores
            </Link>
          ) : null}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Temos o orgulho de ser parceiros das principais lojas de Magic no Brasil e no Mundo!
        </h1>
        <p className="text-[#9b8dc0] max-w-2xl mx-auto">
          Esse reconhecimento é fruto de anos de dedicação, credibilidade e do apoio
          constante da comunidade que acredita no nosso trabalho.
        </p>
      </section>

      <section className="bg-[#080514] py-8 border-y border-[rgba(217,180,255,0.12)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#c795ff]">
            Use o Cupom "FUGUETE05" para garantir 5% de desconto
          </h2>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Nossos patrocinadores</h2>
        {loading ? <Spinner text="Carregando parceiros..." /> : null}
        {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
        {!loading && !error && parceiros.length === 0 ? (
          <p className="text-center text-[#9b8dc0]">Nenhum parceiro cadastrado ainda.</p>
        ) : null}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {parceiros.map((parceiro) => {
            const content = (
              <>
                <img
                  src={parceiro.imagemUrl}
                  alt={parceiro.nome}
                  className="max-h-20 max-w-full object-contain opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-0 right-0 text-center text-[0.65rem] text-[#9b8dc0] group-hover:text-[#c795ff] transition-colors duration-200 px-1 truncate">
                  {parceiro.nome}
                </span>
              </>
            );

            if (parceiro.linkUrl) {
              return (
                <Tooltip key={parceiro.id} content={parceiro.nome} focusable={false} className="aspect-square">
                  <a
                    href={parceiro.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={parceiro.nome}
                    className="group relative flex h-full w-full flex-col items-center justify-center p-4 rounded-xl bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.18)] border border-[rgba(217,180,255,0.1)] hover:border-[rgba(199,149,255,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_28px_rgba(142,57,237,0.35)] active:scale-100"
                  >
                    {content}
                  </a>
                </Tooltip>
              );
            }

            return (
              <Tooltip key={parceiro.id} content={parceiro.nome} focusable={false} className="aspect-square">
                <div className="group relative flex h-full w-full flex-col items-center justify-center p-4 rounded-xl bg-[rgba(167,79,255,0.08)] border border-[rgba(217,180,255,0.1)]">
                  {content}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </section>

      <section className="bg-[#080514] py-12 border-t border-[rgba(217,180,255,0.12)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ainda não é parceiro?</h2>
          <p className="text-[#9b8dc0] mb-4 max-w-2xl mx-auto">
            Se você tem uma loja e quer fortalecer a presença da sua marca no cenário
            competitivo de Magic, esse é o momento. Estou sempre em busca de parceiros que, assim
            como eu, acreditam no potencial da comunidade e querem crescer junto. Entre em contato:
          </p>
          <a href="mailto:contato@tiagofuguete.com.br" className="text-[#c795ff] hover:text-[#e8dfff] font-semibold text-lg transition-colors">
            contato@tiagofuguete.com.br
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
