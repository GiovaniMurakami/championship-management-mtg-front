import { Link } from "react-router-dom";
import { BRAND_LOGO_URL, MAIN_SITE_URL, SOCIAL_LINKS } from "../../constants/site";
import { openCookiePreferences } from "../../utils/cookieConsent";

export function Footer() {
    return (
        <footer className="bg-surface/55 backdrop-blur-xl border-t border-line-soft py-12">
            <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-7">
                <a href={MAIN_SITE_URL} target="_top" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
                    <img src={BRAND_LOGO_URL} alt="Tiago Fuguete" className="h-10 object-contain" />
                </a>

                <div className="flex gap-3">
                    {SOCIAL_LINKS.map((s) => (
                        <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full border border-line bg-surface-soft hover:bg-brand-soft hover:border-line-strong flex items-center justify-center transition-all duration-150 active:scale-95"
                            aria-label={s.label}
                        >
                            <svg className="w-4 h-4 fill-current text-brand" viewBox={s.vb} xmlns="http://www.w3.org/2000/svg">
                                <path d={s.icon} />
                            </svg>
                        </a>
                    ))}
                </div>

                <div className="w-full h-px bg-line-soft" />

                <nav aria-label="Documentos legais" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                    <Link
                        to="/termos-de-uso"
                        className="text-[#8f7db8] text-xs font-semibold no-underline hover:text-brand transition-colors"
                    >
                        Termos de Uso
                    </Link>
                    <Link
                        to="/privacidade"
                        className="text-[#8f7db8] text-xs font-semibold no-underline hover:text-brand transition-colors"
                    >
                        Privacidade (LGPD)
                    </Link>
                    <button
                        type="button"
                        className="text-[#8f7db8] text-xs font-semibold bg-transparent border-0 p-0 cursor-pointer hover:text-brand transition-colors"
                        onClick={openCookiePreferences}
                    >
                        Cookies
                    </button>
                </nav>

                <p className="text-[#6b5a8a] text-xs">© {new Date().getFullYear()} Tiago Fuguete — Todos os direitos reservados</p>
                <p className="text-[#6b5a8a] text-xs">
                    feito com <span className="text-brand">♥</span> por{" "}
                    <a
                        href="https://wa.me/5519997000527?text=Ol%C3%A1%2C%20Giovani!%20Preciso%20de%20ajuda%20com%20o%20desenvolvimento%20de%20um%20site.%20Podemos%20conversar%3F"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#8f7db8] no-underline transition-colors hover:text-brand"
                    >
                        Giovani Murakami
                    </a>
                </p>
            </div>
        </footer>
    );
}
