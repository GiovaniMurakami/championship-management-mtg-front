import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tooltip } from "./Tooltip";

function NavAvatar({ nome, fotoUrl }) {
  const initial = (nome?.[0] ?? "?").toUpperCase();
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-[rgba(199,149,255,0.4)] bg-[rgba(167,79,255,0.35)] text-[0.78rem] font-bold text-text-main"
      aria-hidden="true"
    >
      {fotoUrl ? <img src={fotoUrl} alt="" className="h-full w-full rounded-full object-cover" /> : initial}
    </span>
  );
}

const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconLogout = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Chevron = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const dropdownItemClass =
  "block rounded-lg px-3 py-2.5 text-[0.88rem] font-semibold text-text-soft no-underline hover:bg-[rgba(167,79,255,0.14)] hover:text-text-main";

const sectionLabelClass =
  "mx-2 mb-1 mt-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-text-subtle first:mt-1";

const ADMIN_LINKS = [
  { to: "/dashboard", label: "Anúncios" },
  { to: "/dashboard/slides-home", label: "Slides da home" },
  { to: "/dashboard/parceiros", label: "Parceiros" },
  { to: "/dashboard/hall-da-fama", label: "Hall da Fama" },
  { to: "/dashboard/anuncio-diario", label: "Anúncio diário" },
  { to: "/dashboard/newsletter", label: "Newsletter" },
  { to: "/dashboard/permissoes", label: "Permissões" },
  { to: "/dashboard/bloqueios", label: "Bloqueio de usuários" },
];

/**
 * Menu do usuário (desktop + mobile footer) — compartilhado entre Navbar de torneios e LandingHeader.
 */
export function NavUserMenu({
  usuario,
  onOpenAuth,
  onLogout,
  onOpenEditProfile,
  loggingOut = false,
  onNavigate,
  desktopClassName = "flex items-center gap-[0.6rem] max-nav:hidden",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isAdmin = usuario?.role === "admin";

  const close = () => setOpen(false);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNav = () => {
    close();
    onNavigate?.();
  };

  if (!usuario) {
    return (
      <div className={desktopClassName}>
        <button
          className="cursor-pointer rounded-xl border border-line bg-transparent px-4 py-[0.6rem] font-bold text-text-soft transition-all duration-200 hover:border-line-strong hover:bg-[rgba(167,79,255,0.08)] hover:text-text-main"
          type="button"
          onClick={() => { onOpenAuth?.("register"); onNavigate?.(); }}
        >
          Cadastro
        </button>
        <button
          className="cursor-pointer rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] px-4 py-[0.6rem] font-bold text-white transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] active:translate-y-0"
          type="button"
          onClick={() => { onOpenAuth?.("login"); onNavigate?.(); }}
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className={`${desktopClassName} relative`} ref={ref}>
      <Tooltip content="Menu do usuário" placement="bottom" focusable={false}>
        <button
          className="inline-flex items-center gap-2 border border-line rounded-xl bg-[rgba(167,79,255,0.18)] px-[0.7rem] py-[0.45rem] text-[0.85rem] text-text-main cursor-pointer"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu do usuário"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <NavAvatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} />
          <span className="max-w-[7.5rem] truncate text-[0.84rem] font-semibold text-text-main">{usuario.nome}</span>
          <Chevron />
        </button>
      </Tooltip>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.7rem)] z-50 min-w-[230px] rounded-xl border border-[rgba(217,180,255,0.22)] bg-[rgba(18,12,32,0.97)] p-1.5 shadow-[0_12px_28px_rgba(3,2,8,0.55)]"
        >
          <NavLink role="menuitem" to={`/usuarios/${usuario.id}`} className={dropdownItemClass} onClick={handleNav}>
            Meu perfil
          </NavLink>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg border-none bg-transparent px-3 py-2.5 text-left text-[0.88rem] font-semibold text-text-soft hover:bg-[rgba(167,79,255,0.14)] hover:text-text-main"
            onClick={() => { onOpenEditProfile?.(); handleNav(); }}
          >
            <IconEdit />
            Editar perfil
          </button>
          {isAdmin ? (
            <>
              <p className={`${sectionLabelClass} border-t border-line pt-2`}>Administração</p>
              {ADMIN_LINKS.map((link) => (
                <NavLink key={link.to} role="menuitem" to={link.to} className={dropdownItemClass} onClick={handleNav}>
                  {link.label}
                </NavLink>
              ))}
            </>
          ) : null}
          <button
            type="button"
            role="menuitem"
            disabled={loggingOut}
            className="mt-1 flex w-full items-center gap-2 border-x-0 border-b-0 border-t border-line bg-transparent px-3 py-2.5 text-left text-[0.88rem] font-semibold text-text-soft hover:bg-danger/10 hover:text-red-300 disabled:cursor-wait disabled:opacity-60"
            onClick={() => { onLogout?.(); handleNav(); }}
          >
            <IconLogout />
            {loggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Rodapé do menu mobile (perfil / auth) — mesmo visual do Navbar de torneios. */
export function NavUserMenuMobile({
  usuario,
  onOpenAuth,
  onLogout,
  onOpenEditProfile,
  loggingOut = false,
  onNavigate,
}) {
  if (usuario) {
    return (
      <div className="flex flex-col gap-2">
        <button
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-line bg-[rgba(167,79,255,0.1)] px-[0.75rem] py-[0.55rem] text-left text-text-main transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.2)]"
          type="button"
          onClick={() => { onOpenEditProfile?.(); onNavigate?.(); }}
        >
          <NavAvatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} />
          <div className="flex min-w-0 flex-1 flex-col gap-[0.1rem]">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.9rem] font-semibold text-text-main">{usuario.nome}</span>
            <span className="text-[0.74rem] text-text-soft">Editar perfil</span>
          </div>
          <IconEdit />
        </button>
        <button
          className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-[rgba(255,255,255,0.03)] px-4 py-[0.55rem] font-bold text-text-main disabled:cursor-wait disabled:opacity-60"
          type="button"
          disabled={loggingOut}
          onClick={() => { onLogout?.(); onNavigate?.(); }}
        >
          <IconLogout />
          {loggingOut ? "Saindo..." : "Sair"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        className="min-h-[44px] cursor-pointer rounded-xl border border-line bg-transparent px-4 py-[0.65rem] font-bold text-text-soft transition-all duration-200 hover:border-line-strong hover:bg-[rgba(167,79,255,0.08)] hover:text-text-main"
        type="button"
        onClick={() => { onOpenAuth?.("register"); onNavigate?.(); }}
      >
        Cadastro
      </button>
      <button
        className="min-h-[44px] cursor-pointer rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] px-4 py-[0.65rem] font-bold text-white transition-all duration-200 hover:shadow-[0_4px_16px_rgba(142,57,237,0.4)]"
        type="button"
        onClick={() => { onOpenAuth?.("login"); onNavigate?.(); }}
      >
        Entrar
      </button>
    </div>
  );
}

export { ADMIN_LINKS };
