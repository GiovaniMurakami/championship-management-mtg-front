/** Badge visual para contas anonimizadas / excluídas. */
export function UsuarioExcluidoTag({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[rgba(148,163,184,0.35)] bg-[rgba(148,163,184,0.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#cbd5e1] ${className}`}
    >
      Usuário excluído
    </span>
  );
}

export function isUsuarioExcluido(usuarioOuFlag) {
  if (typeof usuarioOuFlag === "boolean") return usuarioOuFlag;
  return Boolean(usuarioOuFlag?.excluido);
}

/** Nome público + tag quando a conta foi excluída. */
export function UsuarioNomeExibicao({
  nome,
  usuarioId,
  excluido = false,
  className = "",
  nameClassName = "",
  tagClassName = "",
}) {
  if (isUsuarioExcluido(excluido)) {
    return (
      <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
        <UsuarioExcluidoTag className={tagClassName} />
      </span>
    );
  }

  if (usuarioId) {
    return (
      <Link
        to={`/usuarios/${usuarioId}`}
        className={`${nameClassName} ${className} text-inherit no-underline hover:text-brand hover:underline hover:underline-offset-2`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        {nome}
      </Link>
    );
  }

  return <span className={`${nameClassName} ${className}`.trim()}>{nome}</span>;
}
import { Link } from "react-router-dom";
