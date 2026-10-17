import { useEffect, useState } from "react";
import { LandingHeader } from "../components/ui/LandingHeader";
import { LandingEditButton, LandingSobreMimModal } from "../components/ui/LandingSectionEdit";
import { Footer } from "../components";
import { SkeletonSobreMim } from "../components/ui/Skeleton";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { buscarSobreMim } from "../services/backendApi";

function paragrafos(texto) {
  return String(texto || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function LandingSobreMimPage() {
  usePageTitle(PAGE_TITLES.sobreMim);
  const [conteudo, setConteudo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let ativo = true;
    buscarSobreMim()
      .then((data) => {
        if (ativo) setConteudo(data);
      })
      .catch(() => {
        if (ativo) setConteudo(null);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => { ativo = false; };
  }, []);

  const apoiadores = String(conteudo?.apoiadores || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
      <LandingHeader />

      {loading ? (
        <SkeletonSobreMim />
      ) : (
        <>
          <section className="relative max-w-5xl mx-auto px-4 pt-28 pb-12">
            <LandingEditButton
              onClick={() => setEditOpen(true)}
              label="Editar página"
              className="absolute top-28 right-4 z-30"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
              {conteudo?.tituloHistoria || "Minha história no Magic"}
            </h1>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {conteudo?.fotoUrl ? (
                <img
                  src={conteudo.fotoUrl}
                  alt="Tiago Fuguete"
                  className="w-full md:w-80 rounded-2xl object-cover flex-shrink-0"
                />
              ) : null}
              <div className="space-y-4 text-text-soft leading-relaxed">
                {paragrafos(conteudo?.historia).map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="relative bg-[#080514] py-12 border-y border-line-soft">
            <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{conteudo?.apoiaTitulo}</h2>
                <p className="text-[#9b8dc0] mb-6">{conteudo?.apoiaTexto}</p>
                {conteudo?.apoiaUrl ? (
                  <a
                    href={conteudo.apoiaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold transition-all hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px]"
                  >
                    Quero apoiar!
                  </a>
                ) : null}
              </div>
              {conteudo?.apoiaImagemUrl ? (
                <img
                  src={conteudo.apoiaImagemUrl}
                  alt="Apoia-se"
                  className="w-full md:w-80 rounded-xl"
                />
              ) : null}
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{conteudo?.galeriaTitulo}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {(conteudo?.galeriaUrls || []).map((src, i) => (
                <div key={`${src}-${i}`} className="aspect-square rounded-xl overflow-hidden">
                  <img src={src} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#080514] py-16 border-t border-line-soft">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{conteudo?.agradecimentoTitulo}</h2>
              <p className="text-[#9b8dc0] mb-10 text-sm">{conteudo?.agradecimentoTexto}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {apoiadores.map((name) => (
                  <span
                    key={name}
                    className="inline-block px-3 py-1 rounded-full border border-line-soft bg-[rgba(167,79,255,0.08)] text-text-soft text-xs hover:bg-[rgba(167,79,255,0.2)] hover:border-[rgba(199,149,255,0.4)] hover:text-text-main transition-all duration-200 cursor-default"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <LandingSobreMimModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={(data) => setConteudo(data)}
      />

      <Footer />
    </div>
  );
}
