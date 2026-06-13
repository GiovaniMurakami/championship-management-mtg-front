import mukaLogo from "../assets/muka.png";

export const DEFAULT_ADS = [
  {
    id: "muka-trader",
    tipo: "card",
    tag: "Patrocinador Oficial",
    titulo: "Muka Trader",
    texto: "A sua loja de Magic: The Gathering em Sao Paulo. A melhor selecao de singles, boosters e acessorios para jogadores competitivos.",
    botaoTexto: "Conheca a loja",
    link: "https://www.mukatraders.com.br/",
    imagemUrl: mukaLogo,
    ativo: true,
    ordem: 0,
  },
  {
    id: "muka-singles",
    tipo: "card",
    tag: "Promocao",
    titulo: "Singles com ate 30% OFF",
    texto: "Encontre as melhores cartas para montar seu deck de torneio com os precos mais competitivos do mercado. Modern, Pioneer, Standard e mais.",
    botaoTexto: "Ver singles",
    link: "https://www.mukatraders.com.br/",
    imagemUrl: mukaLogo,
    ativo: true,
    ordem: 1,
  },
  {
    id: "muka-boosters",
    tipo: "card",
    tag: "Novidade",
    titulo: "Boosters & Sealed",
    texto: "Abra boosters dos sets mais recentes e monte sua colecao. Disponivel na loja fisica e com entrega para todo o Brasil.",
    botaoTexto: "Ver produtos",
    link: "https://www.mukatraders.com.br/",
    imagemUrl: mukaLogo,
    ativo: true,
    ordem: 2,
  },
];

export const createEmptyAd = () => ({
  id: `anuncio-${Date.now()}`,
  tipo: "card",
  tag: "",
  titulo: "",
  texto: "",
  botaoTexto: "",
  link: "",
  imagemUrl: "",
  ativo: true,
  ordem: 0,
});

export function normalizeAds(anuncios, fallback = DEFAULT_ADS) {
  const source = Array.isArray(anuncios) && anuncios.length > 0 ? anuncios : fallback;

  return source
    .map((ad, index) => ({
      id: ad.id || `anuncio-${index}`,
      tipo: ad.tipo === "banner" ? "banner" : "card",
      tag: ad.tag || "",
      titulo: ad.titulo || ad.headline || "",
      texto: ad.texto || ad.sub || "",
      botaoTexto: ad.botaoTexto || ad.cta || "",
      link: ad.link || "",
      imagemUrl: ad.imagemUrl || ad.bg || "",
      ativo: ad.ativo !== false,
      ordem: Number.isFinite(ad.ordem) ? ad.ordem : index,
    }))
    .sort((a, b) => a.ordem - b.ordem);
}
