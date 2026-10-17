import { useEffect, useState } from "react";
import { LandingHeader } from "../components/ui/LandingHeader";
import { LandingSectionHeading, LandingParceirosModal } from "../components/ui/LandingSectionEdit";
import { Footer, CookieConsentBanner } from "../components";
import { Tooltip } from "../components/ui/Tooltip";
import { SkeletonParceirosGrid } from "../components/ui/Skeleton";
import { useLandingSeo } from "../hooks/useLandingSeo";
import { buscarParceiros } from "../services/backendApi";

const FALLBACK = {
  paginaTitulo: "Temos o orgulho de ser parceiros das principais lojas de Magic no Brasil e no Mundo!",
  paginaTexto: "Esse reconhecimento é fruto de anos de dedicação, credibilidade e do apoio constante da comunidade que acredita no nosso trabalho.",
  ctaTitulo: "Ainda não é parceiro?",
  ctaTexto: "Entre em contato e faça parte da comunidade Fuguete.",
  contatoEmail: "contato@tiagofuguete.com.br",
  cupomGlobal: "FUGUETE05",
};

export function LandingParceirosPage() {
  useLandingSeo("parceiros");
  const [parceiros, setParceiros] = useState([]);
  const [meta, setMeta] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const aplicarDados = (data) => {
    setParceiros(Array.isArray(data?.parceiros) ? data.parceiros : []);
    setMeta({
      paginaTitulo: data?.paginaTitulo || FALLBACK.paginaTitulo,
      paginaTexto: data?.paginaTexto || FALLBACK.paginaTexto,
      ctaTitulo: data?.ctaTitulo || FALLBACK.ctaTitulo,
      ctaTexto: data?.ctaTexto || FALLBACK.ctaTexto,
      contatoEmail: data?.contatoEmail || FALLBACK.contatoEmail,
      cupomGlobal: data?.cupomGlobal || FALLBACK.cupomGlobal,
    });
  };

  useEffect(() => {
    let ativo = true;
    buscarParceiros()
      .then((data) => {
        if (!ativo) return;
        aplicarDados(data);
      })
      .catch(() => {
        if (ativo) setParceiros([]);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => { ativo = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="relative max-w-4xl mx-auto px-4 pt-28 pb-12 text-center">
        <LandingSectionHeading
          as="h1"
          title={meta.paginaTitulo}
          subtitle={meta.paginaTexto}
          onEdit={() => setEditOpen(true)}
          editLabel="Editar página"
          titleClassName="text-3xl md:text-4xl font-bold text-center mb-4"
          subtitleClassName="text-[#9b8dc0] max-w-2xl mx-auto mb-0"
          className="mb-0"
        />
      </section>

      {meta.cupomGlobal ? (
        <section className="bg-[#080514] py-8 border-y border-line-soft">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-brand">
              Use o Cupom &quot;{meta.cupomGlobal}&quot; para garantir desconto
            </h2>
          </div>
        </section>
      ) : null}

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Nossos patrocinadores</h2>
        {loading ? (
          <SkeletonParceirosGrid />
        ) : parceiros.length === 0 ? (
          <p className="text-center text-[#9b8dc0]">Nenhum parceiro cadastrado no momento.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {parceiros.map((p) => (
              <Tooltip key={p.id || p.nome} content={p.nome} focusable={false} className="aspect-square">
                <a
                  href={p.linkUrl || "#"}
                  target={p.linkUrl ? "_blank" : undefined}
                  rel={p.linkUrl ? "noopener noreferrer" : undefined}
                  aria-label={p.nome}
                  className="group relative flex h-full w-full flex-col items-center justify-center p-4 rounded-xl bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.18)] border border-line-soft hover:border-[rgba(199,149,255,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_28px_rgba(142,57,237,0.35)] active:scale-100"
                >
                  <img
                    src={p.logoUrl}
                    alt={p.nome}
                    className="max-h-20 max-w-full object-contain opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 left-0 right-0 text-center text-[0.65rem] text-[#9b8dc0] group-hover:text-brand transition-colors duration-200 px-1 truncate">
                    {p.nome}
                  </span>
                </a>
              </Tooltip>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#080514] py-12 border-t border-line-soft">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-3">{meta.ctaTitulo}</h2>
          <p className="text-[#9b8dc0] mb-6">{meta.ctaTexto}</p>
          {meta.contatoEmail ? (
            <a
              href={`mailto:${meta.contatoEmail}`}
              className="inline-flex px-5 py-2.5 rounded-xl border border-[rgba(199,149,255,0.45)] bg-[rgba(167,79,255,0.12)] text-brand font-semibold hover:bg-[rgba(167,79,255,0.22)] transition"
            >
              Falar conosco
            </a>
          ) : null}
        </div>
      </section>

      <LandingParceirosModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar página Parceiros"
        onSaved={(data) => aplicarDados(data)}
      />

      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
