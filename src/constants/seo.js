import { APP_PUBLIC_URL } from "../utils/externalNavigation";
import { SITE_TITLE } from "./pageTitles";

/** Imagem padrão 1200×630 para Open Graph / WhatsApp / Twitter. */
export const DEFAULT_OG_IMAGE_PATH = "/images/seo/og-default.jpg";

export const SITE_DESCRIPTION =
  "Torneios, decks e conteúdos exclusivos de Magic: The Gathering focados no formato Pauper no MTG Online.";

/** IDs usados em tiagofuguete.com.br (PixelYourSite / Site Kit). Sobrescrevíveis via env. */
export const DEFAULT_GTM_ID = "GTM-K3QJVXGB";
export const DEFAULT_GA_MEASUREMENT_ID = "G-BN7JN9ET38";
export const DEFAULT_GOOGLE_TAG_ID = "GT-T5JV5Q7T";

export function getGtmId() {
  return String(import.meta.env.VITE_GTM_ID || DEFAULT_GTM_ID).trim();
}

export function getGaMeasurementId() {
  return String(import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_GA_MEASUREMENT_ID).trim();
}

export function getGoogleTagId() {
  return String(import.meta.env.VITE_GOOGLE_TAG_ID || DEFAULT_GOOGLE_TAG_ID).trim();
}

export function absolutePublicUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return APP_PUBLIC_URL;
  return `${APP_PUBLIC_URL}${normalized}`;
}

export function defaultOgImageUrl() {
  return absolutePublicUrl(DEFAULT_OG_IMAGE_PATH);
}

/**
 * SEO das páginas institucionais (landing shell).
 * `pageTitle`: texto sem sufixo do site (vazio = só SITE_TITLE).
 */
export const LANDING_SEO = {
  home: {
    pageTitle: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  },
  sobreMim: {
    pageTitle: "Sobre mim",
    description:
      "Conheça o Tiago Fuguete — conteúdo, torneios e comunidade de Magic: The Gathering Pauper no MTGO.",
    path: "/sobre-mim",
  },
  parceiros: {
    pageTitle: "Parceiros",
    description: "Parceiros e apoiadores do canal Tiago Fuguete e dos torneios de Pauper.",
    path: "/parceiros",
  },
  hallDaFama: {
    pageTitle: "Hall da Fama",
    description: "Hall da Fama dos torneios Tiago Fuguete — campeões e Top 8 do Pauper no MTGO.",
    path: "/hall-da-fama",
  },
  decksFuguete: {
    pageTitle: "Decks do Fuguete",
    description: "Decks públicos do Tiago Fuguete para Pauper no Magic Online.",
    path: "/decks-fuguete",
  },
  artigos: {
    pageTitle: "Artigos",
    description:
      "Artigos, guias de side e análises de Pauper — conteúdos do Tiago Fuguete e da comunidade.",
    path: "/artigos",
  },
  decks: {
    pageTitle: "Decks",
    description: "Arquétipos e listas de Pauper em destaque no Tiago Fuguete.",
    path: "/decks",
  },
  torneios: {
    pageTitle: "Torneios",
    description:
      "Torneios gratuitos de Magic: The Gathering Pauper no MTG Online — inscrições, rodadas, standings e resultados ao vivo.",
    path: "/torneios",
  },
  criarTorneio: {
    pageTitle: "Criar Torneio",
    description: "Crie e gerencie torneios Swiss de Pauper no MTG Online com a plataforma Tiago Fuguete.",
    path: "/torneios/criar",
  },
  ingressarTorneio: {
    pageTitle: "Ingressar no Torneio",
    description: "Entre em um torneio em andamento com o link de ingresso do Tiago Fuguete.",
    path: "/torneio/ingressar",
  },
};
