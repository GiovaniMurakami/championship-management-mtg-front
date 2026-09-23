export function ArtigoAssinatura({ autor }) {
  if (!autor?.nome) return null;

  const descricao = autor.descricaoAssinatura?.trim();
  const iniciais = autor.nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

  return (
    <aside className="mt-10 flex gap-4 rounded-2xl border border-line-soft bg-white/[0.03] p-5">
      {autor.fotoUrl ? (
        <img
          src={autor.fotoUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-full object-cover border border-line"
        />
      ) : (
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line bg-[rgba(167,79,255,0.15)] text-lg font-bold text-[#c4b5fd]"
          aria-hidden="true"
        >
          {iniciais || "?"}
        </div>
      )}
      <div className="min-w-0">
        <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-text-muted">
          Escrito por
        </p>
        <p className="m-0 mt-1 text-base font-semibold text-text-main">{autor.nome}</p>
        {descricao ? (
          <p className="m-0 mt-2 text-sm leading-relaxed text-text-soft whitespace-pre-wrap">
            {descricao}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
