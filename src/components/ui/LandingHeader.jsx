import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";

const LOGO = "https://tiagofuguete.com.br/wp-content/uploads/2025/06/cropped-logo-horizontal.png";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Torneios", href: "/torneio" },
    { label: "Decks", href: "/decks" },
    { label: "Blog", href: "/blog" },
    { label: "Sobre mim", href: "/sobre-mim" },
    { label: "Parceiros", href: "/parceiros" },
];

const IconStar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

export function LandingHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const headerRef = useRef(null);
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const transitionTo = (href) => (e) => {
        e.preventDefault();
        close();
        if (!document.startViewTransition) { navigate(href); return; }
        document.startViewTransition(() => flushSync(() => navigate(href)));
    };

    const close = () => setMenuOpen(false);

    const linkClass = (href) => {
        const isActive = href === "/"
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
        return `no-underline font-semibold text-[0.9rem] cursor-pointer transition-colors duration-200 ${isActive
            ? "text-white [text-shadow:0_0_18px_rgba(167,79,255,0.6)]"
            : "text-[#beafd7] hover:text-white"
            }`;
    };

    const mobileLinkClass = (href) => {
        const isActive = href === "/"
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
        return `flex items-center gap-[0.65rem] px-[0.75rem] py-[0.65rem] rounded-[0.65rem] no-underline font-semibold text-[0.92rem] transition-all duration-[180ms] ${isActive
            ? "bg-[rgba(167,79,255,0.18)] text-[#f5edff]"
            : "text-[#beafd7] hover:bg-[rgba(167,79,255,0.1)] hover:text-[#f5edff]"
            }`;
    };

    return (
        <header
            ref={headerRef}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex w-[min(1100px,calc(100vw-2rem))] items-center justify-between gap-4 rounded-full border border-[rgba(217,180,255,0.2)] bg-[rgba(14,9,28,0.75)] backdrop-blur-2xl px-4 py-[0.7rem] shadow-[0_12px_30px_rgba(3,2,8,0.5)]"
            style={{ position: "fixed" }}
        >
            {/* Logo */}
            <a href="/" onClick={transitionTo("/")} className="shrink-0 cursor-pointer">
                <img src={LOGO} alt="Tiago Fuguete" className="h-7 object-contain" style={{ viewTransitionName: "brand-logo" }} />
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5" aria-label="Navegação principal">
                {NAV_LINKS.map((l) => (
                    <a key={l.label} href={l.href} className={linkClass(l.href)} onClick={transitionTo(l.href)}>
                        {l.label}
                    </a>
                ))}
            </nav>

            {/* CTA */}
            <a
                href="https://apoia.se/tiagofuguete"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 border border-[rgba(199,149,255,0.5)] rounded-xl px-4 py-[0.5rem] font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white text-[0.85rem] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px] active:translate-y-0 shrink-0"
            >
                <IconStar />
                Apoiar
            </a>

            {/* Hamburger */}
            <button
                className="md:hidden relative inline-flex items-center justify-center w-[2.35rem] h-[2.35rem] border border-[rgba(217,180,255,0.2)] rounded-xl bg-[rgba(167,79,255,0.22)] cursor-pointer transition-all duration-[180ms] hover:bg-[rgba(167,79,255,0.32)]"
                type="button"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                onClick={() => setMenuOpen((p) => !p)}
            >
                <span className="absolute w-[1.1rem] h-[2px] rounded-full bg-[#f5edff] transition-all duration-[220ms]" style={{ transform: menuOpen ? "rotate(45deg)" : "translateY(-5px)" }} />
                <span className="absolute w-[1.1rem] h-[2px] rounded-full bg-[#f5edff] transition-opacity duration-[180ms]" style={{ opacity: menuOpen ? 0 : 1 }} />
                <span className="absolute w-[1.1rem] h-[2px] rounded-full bg-[#f5edff] transition-all duration-[220ms]" style={{ transform: menuOpen ? "rotate(-45deg)" : "translateY(5px)" }} />
            </button>

            {/* Mobile panel */}
            {menuOpen && (
                <div
                    className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[rgba(14,9,28,0.97)] backdrop-blur-2xl p-4 shadow-[0_16px_40px_rgba(3,2,8,0.6)]"
                    role="dialog"
                    aria-label="Menu de navegação"
                >
                    <nav className="flex flex-col gap-[0.2rem]">
                        {NAV_LINKS.map((l) => (
                            <a key={l.label} href={l.href} className={mobileLinkClass(l.href)} onClick={transitionTo(l.href)}>
                                {l.label}
                            </a>
                        ))}
                    </nav>
                    <div className="mt-3 pt-3 border-t border-[rgba(217,180,255,0.12)]">
                        <a
                            href="https://apoia.se/tiagofuguete"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-4 py-[0.65rem] rounded-xl border border-[rgba(199,149,255,0.5)] bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold text-[0.9rem] transition-all"
                            onClick={close}
                        >
                            <IconStar />
                            Conteúdo Exclusivo
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
