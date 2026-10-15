import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Trash2, Upload, X, ChevronLeft, ChevronRight, Images, CheckSquare } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { BaseModal } from "../components/ui/BaseModal";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";
import { useToast } from "../context/ToastContext";
import { PAGE_TITLES } from "../constants/pageTitles";
import { excluirFotosGaleriaLote, listarFotosGaleria } from "../services/backendApi";
import { uploadFotosGaleriaEmLote, validateGaleriaImageFile } from "../utils/galeriaUpload";
import { formatApiErrorMessage } from "../utils/apiError";
import { BTN_DANGER, BTN_GHOST, BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";

function nomeArquivoDownload(foto) {
  const base = (foto?.titulo || `foto-${String(foto?.id || "").slice(0, 8)}` || "foto")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "foto"}.webp`;
}

async function baixarFoto(foto) {
  const resposta = await fetch(foto.url, { mode: "cors" });
  if (!resposta.ok) throw new Error("Não foi possível baixar a foto.");
  const blob = await resposta.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = nomeArquivoDownload(foto);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function Visualizador({ fotos, indice, onFechar, onMudar, isAdmin, onExcluir }) {
  const foto = fotos[indice];
  const inicioToque = useRef(null);
  const [baixando, setBaixando] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onFechar();
      if (event.key === "ArrowLeft") onMudar((indice - 1 + fotos.length) % fotos.length);
      if (event.key === "ArrowRight") onMudar((indice + 1) % fotos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fotos.length, indice, onFechar, onMudar]);

  if (!foto) return null;

  const onTouchStart = (event) => {
    const toque = event.touches[0];
    inicioToque.current = toque ? { x: toque.clientX, y: toque.clientY } : null;
  };

  const onTouchEnd = (event) => {
    const inicio = inicioToque.current;
    const toque = event.changedTouches[0];
    inicioToque.current = null;
    if (!inicio || !toque || fotos.length < 2) return;
    const deltaX = toque.clientX - inicio.x;
    const deltaY = toque.clientY - inicio.y;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (deltaX < 0) onMudar((indice + 1) % fotos.length);
    else onMudar((indice - 1 + fotos.length) % fotos.length);
  };

  const handleDownload = async () => {
    setBaixando(true);
    try {
      await baixarFoto(foto);
    } catch {
      window.open(foto.url, "_blank", "noopener,noreferrer");
    } finally {
      setBaixando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador da galeria"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-semibold">{foto.titulo || "Foto"}</p>
          <p className="m-0 text-xs text-white/60">{indice + 1} / {fotos.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
            aria-label="Baixar foto"
            disabled={baixando}
            onClick={handleDownload}
          >
            <Download className="h-5 w-5" />
          </button>
          {isAdmin && (
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-red-400/30 bg-red-500/15 text-red-200 hover:bg-red-500/25"
              aria-label="Excluir foto"
              onClick={() => onExcluir([foto.id])}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
            aria-label="Fechar"
            onClick={onFechar}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6">
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white hover:bg-black/70 sm:inline-flex"
              onClick={() => onMudar((indice - 1 + fotos.length) % fotos.length)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white hover:bg-black/70 sm:inline-flex"
              onClick={() => onMudar((indice + 1) % fotos.length)}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        <img
          src={foto.url}
          alt={foto.titulo || `Foto ${indice + 1}`}
          className="max-h-full max-w-full object-contain select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}

export function GaleriaPage() {
  usePageTitle(PAGE_TITLES.galeria);
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();
  const inputRef = useRef(null);

  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [indiceAberto, setIndiceAberto] = useState(null);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionadas, setSelecionadas] = useState(() => new Set());
  const [idsParaExcluir, setIdsParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const totalSelecionadas = selecionadas.size;
  const todasSelecionadas = fotos.length > 0 && totalSelecionadas === fotos.length;

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await listarFotosGaleria();
      setFotos(Array.isArray(data?.fotos) ? data.fotos : []);
    } catch (error) {
      addToast(formatApiErrorMessage(error, "Não foi possível carregar a galeria."), { type: "error" });
      setFotos([]);
    } finally {
      setCarregando(false);
    }
  }, [addToast]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (!isAdmin && modoSelecao) {
      setModoSelecao(false);
      setSelecionadas(new Set());
    }
  }, [isAdmin, modoSelecao]);

  const sairModoSelecao = () => {
    setModoSelecao(false);
    setSelecionadas(new Set());
  };

  const alternarSelecao = (id) => {
    setSelecionadas((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  };

  const selecionarTodas = () => {
    setSelecionadas(new Set(fotos.map((f) => f.id)));
  };

  const limparSelecao = () => setSelecionadas(new Set());

  const idsSelecionadosLista = useMemo(() => [...selecionadas], [selecionadas]);

  const selecionarArquivos = async (event) => {
    const arquivos = Array.from(event.target.files || []);
    event.target.value = "";
    if (!arquivos.length || !token) return;

    for (const arquivo of arquivos) {
      const erro = validateGaleriaImageFile(arquivo);
      if (erro) {
        addToast(erro.userMessage || erro.message, { type: "error" });
        return;
      }
    }

    setEnviando(true);
    setProgresso(`Enviando 0/${arquivos.length}…`);
    try {
      const { enviadas, falhas } = await uploadFotosGaleriaEmLote(arquivos, token, {
        onProgress: (done, total) => setProgresso(`Enviando ${done}/${total}…`),
      });

      if (enviadas > 0) {
        addToast(
          enviadas === 1 ? "Foto adicionada à galeria." : `${enviadas} fotos adicionadas à galeria.`,
          { type: "success" },
        );
        await carregar();
      }

      if (falhas.length > 0) {
        const amostra = falhas.slice(0, 3).map((f) => f.nome).join(", ");
        addToast(
          falhas.length === 1
            ? `Falha ao enviar ${amostra}.`
            : `${falhas.length} fotos falharam (${amostra}${falhas.length > 3 ? "…" : ""}).`,
          { type: "error" },
        );
      }
    } catch (error) {
      addToast(
        error?.userMessage || formatApiErrorMessage(error, "Falha ao enviar foto(s)."),
        { type: "error" },
      );
    } finally {
      setEnviando(false);
      setProgresso("");
    }
  };

  const confirmarExclusao = async () => {
    if (!idsParaExcluir?.length || !token) return;
    setExcluindo(true);
    try {
      const resultado = await excluirFotosGaleriaLote(idsParaExcluir, token);
      const excluidos = new Set(resultado?.excluidos || idsParaExcluir);
      setFotos((atual) => {
        const restante = atual.filter((f) => !excluidos.has(f.id));
        setIndiceAberto((indiceAtual) => {
          if (indiceAtual == null) return null;
          if (!restante.length) return null;
          return Math.min(indiceAtual, restante.length - 1);
        });
        return restante;
      });
      setSelecionadas((atual) => {
        const proximo = new Set(atual);
        for (const id of excluidos) proximo.delete(id);
        return proximo;
      });
      const total = resultado?.total || excluidos.size;
      addToast(
        total === 1 ? "Foto removida da galeria." : `${total} fotos removidas da galeria.`,
        { type: "success" },
      );
      setIdsParaExcluir(null);
      if (modoSelecao && totalSelecionadas <= total) sairModoSelecao();
    } catch (error) {
      addToast(formatApiErrorMessage(error, "Não foi possível excluir a(s) foto(s)."), { type: "error" });
    } finally {
      setExcluindo(false);
    }
  };

  const quantidadeConfirmacao = idsParaExcluir?.length || 0;

  return (
    <PageShell
      className={`mx-auto flex min-h-[calc(100dvh-12.5rem)] w-full max-w-6xl flex-col px-0 pt-2 ${
        modoSelecao && totalSelecionadas > 0 ? "pb-28" : "pb-8"
      }`}
    >
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 font-display text-3xl tracking-wide text-text-main sm:text-4xl">Galeria</h1>
          <p className="mt-1 mb-0 text-sm text-text-muted">
            {modoSelecao
              ? "Toque nas fotos para selecionar."
              : "Fotos do campeonato. Toque para ampliar e baixar."}
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            {enviando && <span className="text-sm text-text-soft">{progresso || "Enviando…"}</span>}
            {fotos.length > 0 && (
              <button
                type="button"
                className={`${BTN_SECONDARY} inline-flex items-center gap-2`}
                disabled={enviando}
                onClick={() => {
                  if (modoSelecao) sairModoSelecao();
                  else {
                    setIndiceAberto(null);
                    setModoSelecao(true);
                  }
                }}
              >
                {modoSelecao ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                {modoSelecao ? "Cancelar" : "Selecionar"}
              </button>
            )}
            {!modoSelecao && (
              <label className={`${BTN_PRIMARY} inline-flex cursor-pointer items-center gap-2 ${enviando ? "pointer-events-none opacity-60" : ""}`}>
                <Upload className="h-4 w-4" />
                {enviando ? "Enviando…" : "Adicionar fotos"}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  className="sr-only"
                  disabled={enviando}
                  onChange={selecionarArquivos}
                />
              </label>
            )}
          </div>
        )}
      </header>

      {modoSelecao && fotos.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface-soft/80 px-3 py-2">
          <p className="m-0 text-sm text-text-soft">
            {totalSelecionadas === 0
              ? "Nenhuma selecionada"
              : `${totalSelecionadas} selecionada${totalSelecionadas > 1 ? "s" : ""}`}
          </p>
          <div className="flex gap-2">
            <button type="button" className={`${BTN_GHOST} border border-line px-3 py-1.5 text-sm`} onClick={todasSelecionadas ? limparSelecao : selecionarTodas}>
              {todasSelecionadas ? "Limpar" : "Todas"}
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
      {carregando ? (
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-sm bg-surface-soft" />
          ))}
        </div>
      ) : fotos.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6">
          <EmptyState
            className="w-full"
            icon={<Images className="h-8 w-8" />}
            title="Galeria vazia"
            description={isAdmin ? "Envie as primeiras fotos do evento." : "Ainda não há fotos publicadas."}
            action={
              isAdmin ? (
                <button type="button" className={BTN_SECONDARY} onClick={() => inputRef.current?.click()}>
                  Adicionar fotos
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {fotos.map((foto, indice) => {
            const selecionada = selecionadas.has(foto.id);
            return (
              <button
                key={foto.id}
                type="button"
                className={`group relative aspect-square overflow-hidden rounded-sm border-0 bg-black/30 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${selecionada ? "ring-2 ring-brand ring-offset-1 ring-offset-[#0b0717]" : ""}`}
                onClick={() => {
                  if (modoSelecao) alternarSelecao(foto.id);
                  else setIndiceAberto(indice);
                }}
                aria-label={
                  modoSelecao
                    ? selecionada
                      ? `Desmarcar ${foto.titulo || `foto ${indice + 1}`}`
                      : `Selecionar ${foto.titulo || `foto ${indice + 1}`}`
                    : foto.titulo || `Abrir foto ${indice + 1}`
                }
                aria-pressed={modoSelecao ? selecionada : undefined}
              >
                <img
                  src={foto.url}
                  alt={foto.titulo || `Foto ${indice + 1}`}
                  loading="lazy"
                  className={`h-full w-full object-cover transition-[transform,opacity] duration-200 motion-reduce:transition-none ${modoSelecao && selecionada ? "opacity-80" : "group-hover:scale-[1.03]"}`}
                />
                {modoSelecao && (
                  <span
                    className={`absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                      selecionada
                        ? "border-brand bg-brand text-white"
                        : "border-white/70 bg-black/35 text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      </div>

      {modoSelecao && totalSelecionadas > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[rgba(12,8,22,0.96)] px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <p className="m-0 text-sm font-semibold text-text-main">
              {totalSelecionadas} selecionada{totalSelecionadas > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              className={`${BTN_DANGER} inline-flex items-center gap-2`}
              onClick={() => setIdsParaExcluir(idsSelecionadosLista)}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          </div>
        </div>
      )}

      {indiceAberto != null && !modoSelecao && (
        <Visualizador
          fotos={fotos}
          indice={indiceAberto}
          onFechar={() => setIndiceAberto(null)}
          onMudar={setIndiceAberto}
          isAdmin={isAdmin}
          onExcluir={setIdsParaExcluir}
        />
      )}

      <BaseModal
        isOpen={Boolean(idsParaExcluir?.length)}
        onClose={() => !excluindo && setIdsParaExcluir(null)}
        ariaLabelledBy="galeria-excluir-titulo"
      >
        <h2 id="galeria-excluir-titulo" className="mt-0 mb-3 font-display text-[1.7rem] text-text-main">
          {quantidadeConfirmacao > 1 ? `Excluir ${quantidadeConfirmacao} fotos?` : "Excluir foto?"}
        </h2>
        <p className="mb-5 text-[0.92rem] text-text-soft">
          {quantidadeConfirmacao > 1
            ? "As fotos selecionadas serão removidas da galeria e do armazenamento. Esta ação é irreversível."
            : "A foto será removida da galeria e do armazenamento. Esta ação é irreversível."}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className={`flex-1 ${BTN_GHOST} border border-line`}
            disabled={excluindo}
            onClick={() => setIdsParaExcluir(null)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`flex-1 ${BTN_DANGER}`}
            disabled={excluindo}
            onClick={confirmarExclusao}
          >
            {excluindo ? "Excluindo…" : "Excluir"}
          </button>
        </div>
      </BaseModal>
    </PageShell>
  );
}
