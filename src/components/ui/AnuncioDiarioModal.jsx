import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  buscarAnuncioDiario,
  registrarCliqueAnuncioDiario,
  registrarVisualizacaoAnuncioDiario,
} from "../../services/backendApi";
import {
  jaViuAnuncioDiarioHoje,
  marcarAnuncioDiarioVistoHoje,
} from "../../utils/anuncioDiario";

export function AnuncioDiarioModal() {
  const [anuncio, setAnuncio] = useState(null);
  const [aberto, setAberto] = useState(false);
  const viewRegistrada = useRef(false);

  useEffect(() => {
    if (jaViuAnuncioDiarioHoje()) return undefined;

    let cancelled = false;

    buscarAnuncioDiario()
      .then((data) => {
        if (cancelled) return;
        if (!data?.ativo || !data?.imagemUrl) return;
        setAnuncio({
          imagemUrl: data.imagemUrl,
          link: data.link || "",
        });
        setAberto(true);
      })
      .catch(() => {
        // silencioso — anúncio opcional
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!aberto || !anuncio || viewRegistrada.current) return;
    viewRegistrada.current = true;
    registrarVisualizacaoAnuncioDiario().catch(() => {});
  }, [aberto, anuncio]);

  const fechar = () => {
    marcarAnuncioDiarioVistoHoje();
    setAberto(false);
  };

  const handleClick = () => {
    marcarAnuncioDiarioVistoHoje();
    registrarCliqueAnuncioDiario().catch(() => {});
    setAberto(false);
  };

  if (!anuncio) return null;

  const conteudoImagem = (
    <img
      src={anuncio.imagemUrl}
      alt="Anúncio"
      className="max-h-[min(80vh,720px)] w-auto max-w-full object-contain"
    />
  );

  return (
    <Dialog.Root
      open={aberto}
      onOpenChange={(open) => {
        if (!open) fechar();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm animate-[fade-in_200ms_ease-out]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[71] w-[min(560px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          aria-label="Anúncio do dia"
        >
          <Dialog.Title className="sr-only">Anúncio do dia</Dialog.Title>
          <button
            type="button"
            onClick={fechar}
            className="absolute -right-1 -top-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-lg font-bold text-text-main shadow-overlay transition hover:bg-[rgba(255,255,255,0.08)]"
            aria-label="Fechar anúncio"
          >
            ×
          </button>
          {anuncio.link ? (
            <a
              href={anuncio.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="block overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-overlay"
            >
              {conteudoImagem}
            </a>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line-soft bg-surface shadow-overlay">
              {conteudoImagem}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
