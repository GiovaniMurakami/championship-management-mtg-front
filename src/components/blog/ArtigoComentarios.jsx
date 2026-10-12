import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { comentarArtigo, curtirComentarioArtigo, descurtirComentarioArtigo } from "../../services/backendApi";
import { formatApiErrorMessage } from "../../utils/apiError";
import { BTN_PRIMARY, FORM_TEXTAREA_CLASS } from "../../styles/uiClasses";

function porCurtidas(a, b) {
  const curtidas = (b.totalCurtidas ?? 0) - (a.totalCurtidas ?? 0);
  if (curtidas !== 0) return curtidas;
  return String(a.criadoEm || "").localeCompare(String(b.criadoEm || ""));
}

function agrupar(comentarios = []) {
  const respostas = new Map();
  const raizes = [];
  for (const comentario of comentarios) {
    if (comentario.comentarioPaiId) {
      const lista = respostas.get(comentario.comentarioPaiId) ?? [];
      lista.push(comentario);
      respostas.set(comentario.comentarioPaiId, lista);
    } else {
      raizes.push(comentario);
    }
  }
  raizes.sort(porCurtidas);
  for (const lista of respostas.values()) lista.sort(porCurtidas);
  return { raizes, respostas };
}

function BotaoCurtir({ comentario, onCurtir, ocupado }) {
  return (
    <button
      type="button"
      onClick={() => onCurtir(comentario)}
      disabled={ocupado}
      aria-pressed={Boolean(comentario.curtidoPorMim)}
      aria-label={comentario.curtidoPorMim ? "Remover curtida do comentário" : "Curtir comentário"}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border-0 bg-transparent px-2 text-sm font-semibold ${comentario.curtidoPorMim ? "text-danger" : "text-text-soft hover:text-text-main"}`}
    >
      <span aria-hidden="true">{comentario.curtidoPorMim ? "♥" : "♡"}</span>
      <span className="tabular-nums">{comentario.totalCurtidas ?? 0}</span>
    </button>
  );
}

function CartaoComentario({ comentario, filhos = [], podeResponder, onCurtir, onResponder, respondendo, respostaTexto, setRespostaTexto, onEnviarResposta, ocupado }) {
  return (
    <li className="rounded-xl border border-line-soft bg-white/[0.03] p-4">
      <p className="m-0 text-sm font-semibold">{comentario.autor?.nome}</p>
      <p className="m-0 mt-1 text-sm text-[#e8dff8] whitespace-pre-wrap">{comentario.texto}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <BotaoCurtir comentario={comentario} onCurtir={onCurtir} ocupado={ocupado} />
        {podeResponder && (
          <button type="button" className="min-h-11 rounded-full border-0 bg-transparent px-2 text-sm font-semibold text-text-soft hover:text-text-main" onClick={() => onResponder(comentario)}>
            Responder
          </button>
        )}
      </div>
      {respondendo && (
        <form
          className="mt-3 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onEnviarResposta(comentario.id);
          }}
        >
          <textarea
            className={`${FORM_TEXTAREA_CLASS} min-h-20`}
            rows={2}
            value={respostaTexto}
            onChange={(event) => setRespostaTexto(event.target.value)}
            placeholder={`Responder ${comentario.autor?.nome || ""}`}
            maxLength={1000}
          />
          <button type="submit" className={BTN_PRIMARY} disabled={ocupado || !respostaTexto.trim()}>Publicar resposta</button>
        </form>
      )}
      {filhos.length > 0 && (
        <ul className="m-0 mt-3 list-none space-y-3 border-l border-line-soft pl-4">
          {filhos.map((filho) => (
            <li key={filho.id}>
              <p className="m-0 text-sm font-semibold">{filho.autor?.nome}</p>
              <p className="m-0 mt-1 text-sm text-[#e8dff8] whitespace-pre-wrap">{filho.texto}</p>
              <BotaoCurtir comentario={filho} onCurtir={onCurtir} ocupado={ocupado} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function ArtigoComentarios({ artigo, token, onArtigo }) {
  const { requireAuth } = useAuth();
  const { addToast } = useToast();
  const [texto, setTexto] = useState("");
  const [respostaDe, setRespostaDe] = useState("");
  const [respostaTexto, setRespostaTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const comentarios = artigo.comentarios || [];
  const { raizes, respostas } = agrupar(comentarios);

  const autenticado = (acao) => (token ? acao(token) : requireAuth(({ token: novoToken }) => acao(novoToken)));

  const publicar = (paiId, valor, limpar) => autenticado(async (tok) => {
    const corpo = valor.trim();
    if (!corpo || ocupado) return;
    setOcupado(true);
    try {
      const novo = await comentarArtigo(artigo.id, corpo, tok, paiId);
      onArtigo((atual) => ({ ...atual, comentarios: [...(atual.comentarios || []), novo] }));
      limpar();
    } catch (error) {
      addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível comentar."), { type: "error" });
    } finally {
      setOcupado(false);
    }
  });

  const curtir = (comentario) => autenticado(async (tok) => {
    if (ocupado) return;
    setOcupado(true);
    try {
      const res = comentario.curtidoPorMim
        ? await descurtirComentarioArtigo(artigo.id, comentario.id, tok)
        : await curtirComentarioArtigo(artigo.id, comentario.id, tok);
      onArtigo((atual) => ({
        ...atual,
        comentarios: (atual.comentarios || []).map((item) => (
          item.id === comentario.id ? { ...item, ...res } : item
        )),
      }));
    } catch (error) {
      addToast(formatApiErrorMessage(error?.response?.data, "Não foi possível curtir o comentário."), { type: "error" });
    } finally {
      setOcupado(false);
    }
  });

  return (
    <section className="mt-10 border-t border-line-soft pt-8">
      <h2 className="m-0 text-xl font-semibold">Comentários</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          publicar(undefined, texto, () => setTexto(""));
        }}
        className="mt-4 space-y-3"
      >
        <textarea
          className={FORM_TEXTAREA_CLASS}
          rows={3}
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Deixe sua opinião…"
          maxLength={1000}
        />
        <button type="submit" className={BTN_PRIMARY} disabled={ocupado || !texto.trim()}>Comentar</button>
      </form>
      <ul className="mt-6 space-y-4 p-0 list-none">
        {raizes.map((comentario) => (
          <CartaoComentario
            key={comentario.id}
            comentario={comentario}
            filhos={respostas.get(comentario.id) || []}
            podeResponder
            onCurtir={curtir}
            onResponder={(item) => {
              setRespostaDe((atual) => (atual === item.id ? "" : item.id));
              setRespostaTexto("");
            }}
            respondendo={respostaDe === comentario.id}
            respostaTexto={respostaTexto}
            setRespostaTexto={setRespostaTexto}
            onEnviarResposta={(paiId) => publicar(paiId, respostaTexto, () => { setRespostaTexto(""); setRespostaDe(""); })}
            ocupado={ocupado}
          />
        ))}
      </ul>
    </section>
  );
}
