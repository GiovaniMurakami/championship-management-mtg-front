/** Dados exibidos quando a API ainda não foi populada (ex.: antes do import no back). */
export const PARCEIROS_FALLBACK = [
  { id: "fallback-bandeira", nome: "Bandeira Cards", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/bandeira-cards.png", linkUrl: "https://www.bandeiracards.com.br/" },
  { id: "fallback-capi", nome: "Capi Cards", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2026/01/Capi-Cards-2.png", linkUrl: "https://www.capicards.shop/?view=ecom/home" },
  { id: "fallback-cardtrader", nome: "CardTrader", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/12/CardTrader_logo-sem-fundo.png", linkUrl: "https://www.cardtrader.com/invite/FUGUETE05" },
  { id: "fallback-dungeon", nome: "Dungeon Games", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/dungeon.png", linkUrl: "https://www.dungeongamesstore.com.br/" },
  { id: "fallback-glorin", nome: "Glorin", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/12/Glorin-Full-Logo.png", linkUrl: "https://www.glorin.com.br/glorin" },
  { id: "fallback-mineral", nome: "Mineral Games", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/mineral.png", linkUrl: "https://www.mineralgames.com.br/" },
  { id: "fallback-montshop", nome: "Mont Shop", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/mont.png", linkUrl: "https://www.montshop.com.br/" },
  { id: "fallback-muka", nome: "Muka Traders", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/06/muka.png", linkUrl: "https://www.mukatraders.com.br/" },
  { id: "fallback-orbita", nome: "Orbita Playmats", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/08/orbita300px2.png", linkUrl: "https://www.instagram.com/orbitaplaymats/" },
  { id: "fallback-rei", nome: "Rei das Cartinhas", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/rei.png", linkUrl: "https://www.reidascartinhas.com.br/?view=ecom/home" },
  { id: "fallback-taverna", nome: "Taverna Games", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/07/taverna.png", linkUrl: "https://www.lojatavernagames.com.br/?view=ecom/home" },
  { id: "fallback-tcg", nome: "TCG InBox", imagemUrl: "https://tiagofuguete.com.br/wp-content/uploads/2025/08/TCG-Box-Colorido-scaled.png", linkUrl: "https://tcginbox.com.br/" },
];

export const APOIADORES_FALLBACK =
  "Adilson Roberto Alves Silva; alexandre queiroz galleti; Angelo Graper; Antonio Sérgio Ribeiro Junior; Augusto Alves; Bruno Campitelli Belchior; Bruno Costa Castro Alves; Carlos Eduardo de Aguiar Nogueira Gomes; Cesar Fabricio Klemes da Cruz; Daniel Ruiz Dias; Daniel Seether; DERLI TIAGO CASTILHO DE GODOIS SCHLICK; Diego Nogueira; Dionatan silvestre da silva; Edson Henrique Medeiros Silva; Fabio Lima; FABIO OLIVEIRA COSTA; Fagner Ferreira Barbosa; Felipe José do Nascimento Henrique; Felipe Lapena Barreto; Felipe Pedroso Camargo; Felipe Ramos; Felipe Tavares Batista; Filipe Silqueira Reis; Flavio Augusto de Carvalho Fialho; flavio sarto; FREDERICO ROCHA BAUMGRATZ; isaque angelo de oliveira saboia; João Prado; JORGE FERNANDO KIKUTA; José Rauryson Alves Bezerra; Julio Thibes; LEANDRO FLORESTA DOS SANTOS; Leandro Sanches Bermudes; Luan Kupka; Lucas Ribeiro; Lucas Stamford; Luiz Paulo Feliciano Guedes Pinto; Marcelo Miziara; Marcelo Shanks; Marcos Tadeu Secol Felix; Max Diávila Machado; Miguel Filipe Rodriguez Moure; PAULO GONÇALVES PEREIRA; PEDRO HENRIQUE MANZONI DE LIMA; Regis Lima Claus; Renan Carvalho; Roberto Borzuk Kneip Salimena; robson pereira; Rodrigo Flores; Serra Leno; Thais Vieira Oliveira; THIAGO HENRIQUE DE MATTOS; Vat Alexsandro; Vinicius Santos; VITOR V MORGADO; Yago Busatto Leal";

export const APOIADORES_FALLBACK_LIST = APOIADORES_FALLBACK.split("; ").map((nome) => nome.trim()).filter(Boolean);
