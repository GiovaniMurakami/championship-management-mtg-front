import { useMemo, useState } from "react";
import { cadastrarDeck, atualizarDeck } from "../services/backendApi";
import { buscarCartaPorNome } from "../services/scryfallApi";
import { toDeckPayload } from "../utils/deckPayload";
import { parseDeckTxt } from "../utils/parseDeckTxt";
import {
  MAX_DECK_SIZE,
  MAX_SIDEBOARD_SIZE,
  MAX_CARD_COPIES,
  MESSAGE_DISPLAY_MS,
} from "../constants/auth";

export function useDeckBuilder() {
  const [deckForm, setDeckForm] = useState({ nome: "", formato: "" });
  const [mainDeck, setMainDeck] = useState([]);
  const [sideboard, setSideboard] = useState([]);
  const [deckLoading, setDeckLoading] = useState(false);
  const [deckMessage, setDeckMessage] = useState("");
  const [cardLimitMessage, setCardLimitMessage] = useState("");
  const [illegalCardMessage, setIllegalCardMessage] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  const totalMain = useMemo(
    () => mainDeck.reduce((acc, card) => acc + Number(card.quantidade || 0), 0),
    [mainDeck],
  );

  const totalSide = useMemo(
    () =>
      sideboard.reduce((acc, card) => acc + Number(card.quantidade || 0), 0),
    [sideboard],
  );

  const addCardToDeck = (card, section) => {
    const setter = section === "main" ? setMainDeck : setSideboard;
    const isBasicLand = card.isBasicLand;

    setter((current) => {
      const found = current.find((item) => item.nome === card.nome);

      if (found) {
        const newQuantidade = Number(found.quantidade) + 1;
        const maxAllowed = isBasicLand ? 999 : MAX_CARD_COPIES;

        if (newQuantidade > maxAllowed) {
          setCardLimitMessage(
            `Limite de ${maxAllowed} cópias de "${card.nome}" atingido.`,
          );
          setTimeout(() => setCardLimitMessage(""), MESSAGE_DISPLAY_MS);
          return current;
        }

        return current.map((item) =>
          item.nome === card.nome
            ? { ...item, quantidade: newQuantidade }
            : item,
        );
      }

      return [
        ...current,
        {
          nome: card.nome,
          quantidade: 1,
          imagem: card.imagem || "",
          isBasicLand,
          legalities: card.legalities || {},
          colors: card.colors || card.colorIdentity || [],
          cmc: Number.isFinite(card.cmc) ? card.cmc : Number(card.cmc) || 0,
          manaCost: card.manaCost || "",
          typeLine: card.typeLine || "",
        },
      ];
    });
  };

  const updateCardQuantity = (section, nome, quantidade) => {
    const deck = section === "main" ? mainDeck : sideboard;
    const card = deck.find((c) => c.nome === nome);
    const isBasicLand = card?.isBasicLand;
    const maxAllowed = isBasicLand ? 999 : MAX_CARD_COPIES;

    const parsed = Math.max(1, Math.min(maxAllowed, Number(quantidade || 1)));
    const setter = section === "main" ? setMainDeck : setSideboard;

    if (parsed === maxAllowed && Number(quantidade) > maxAllowed) {
      setCardLimitMessage(
        `Limite de ${maxAllowed} cópias de "${nome}" atingido.`,
      );
      setTimeout(() => setCardLimitMessage(""), MESSAGE_DISPLAY_MS);
    }

    setter((current) =>
      current.map((c) => (c.nome === nome ? { ...c, quantidade: parsed } : c)),
    );
  };

  const removeCard = (section, nome) => {
    const setter = section === "main" ? setMainDeck : setSideboard;
    setter((current) => current.filter((card) => card.nome !== nome));
  };

  // Função auxiliar para comparar duas listas de cartas
  const compareDeckCards = (currentCards, originalCards) => {
    if (currentCards.length !== originalCards.length) {
      return false;
    }

    // Normalizar e ordenar
    const currentNorm = currentCards
      .map((c) => ({ nome: c.nome, quantidade: c.quantidade }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    const originalNorm = originalCards
      .map((c) => ({ nome: c.nome, quantidade: c.quantidade }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    // Comparar JSON serializado
    return JSON.stringify(currentNorm) === JSON.stringify(originalNorm);
  };

  const handleCreateDeck = async (
    event,
    token,
    deckIdParam = null,
    originalDeck = null,
  ) => {
    event.preventDefault();
    setDeckMessage("");
    setIllegalCardMessage("");

    if (!token) {
      setDeckMessage("Faça login para cadastrar um deck.");
      return;
    }

    // Se estiver editando, verificar se houve mudanças
    if (deckIdParam && originalDeck) {
      const nomeIgual = deckForm.nome === originalDeck.nome;
      const formatoIgual = deckForm.formato === originalDeck.formato;

      // Comparar cartas do maindeck
      const maindeckIgual = compareDeckCards(
        mainDeck,
        originalDeck.maindeck || [],
      );

      // Comparar cartas do sideboard
      const sideboardIgual = compareDeckCards(
        sideboard,
        originalDeck.sideboard || [],
      );

      if (nomeIgual && formatoIgual && maindeckIgual && sideboardIgual) {
        setDeckMessage("Nenhuma alteração foi feita.");
        setTimeout(() => setDeckMessage(""), MESSAGE_DISPLAY_MS);
        return;
      }
    }

    if (totalMain < MAX_DECK_SIZE) {
      setDeckMessage(
        `O maindeck precisa ter pelo menos ${MAX_DECK_SIZE} cartas.`,
      );
      return;
    }

    if (totalSide > MAX_SIDEBOARD_SIZE) {
      setDeckMessage(
        `O sideboard pode ter no máximo ${MAX_SIDEBOARD_SIZE} cartas.`,
      );
      return;
    }

    const ilegalCards = [];
    const formatoChecagem = deckForm.formato;

    [...mainDeck, ...sideboard].forEach((card) => {
      const legalFormat = card.legalities?.[formatoChecagem];

      if (legalFormat === false) {
        ilegalCards.push(card.nome);
      }
    });

    if (ilegalCards.length > 0) {
      setIllegalCardMessage(
        `As seguintes cartas não são legais em ${formatoChecagem}: ${ilegalCards.join(", ")}`,
      );
      return;
    }

    setDeckLoading(true);

    try {
      const payload = {
        nome: deckForm.nome,
        formato: deckForm.formato,
        maindeck: toDeckPayload(mainDeck),
        sideboard: toDeckPayload(sideboard),
      };

      if (deckIdParam) {
        // Modo edição - usar o deckId passado como parâmetro
        await atualizarDeck(deckIdParam, payload, token);
        setDeckMessage("Deck atualizado com sucesso.");
      } else {
        // Modo criação
        await cadastrarDeck(payload, token);
        setDeckMessage("Deck cadastrado com sucesso.");
        setDeckForm({ nome: "", formato: "" });
        setMainDeck([]);
        setSideboard([]);
      }

      setTimeout(() => setDeckMessage(""), MESSAGE_DISPLAY_MS);
    } catch (error) {
      setDeckMessage(error.message);
    } finally {
      setDeckLoading(false);
    }
  };

  const resolveImportedCards = async (entries) => {
    const CONCURRENCY = 6;
    const results = new Array(entries.length).fill(null);
    let index = 0;

    const worker = async () => {
      while (index < entries.length) {
        const i = index++;
        const entry = entries[i];
        try {
          const card = await buscarCartaPorNome(entry.nome);
          if (card) {
            results[i] = {
              nome: card.nome,
              quantidade: entry.quantidade,
              imagem: card.imagem || "",
              isBasicLand: card.isBasicLand,
              legalities: card.legalities || {},
              colors: card.colors || card.colorIdentity || [],
              cmc: Number.isFinite(card.cmc) ? card.cmc : Number(card.cmc) || 0,
              manaCost: card.manaCost || "",
              typeLine: card.typeLine || "",
            };
          }
        } catch {
          // carta não encontrada — mantém null
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker));
    return results.filter(Boolean);
  };

  const importDeckFromTxt = async (file) => {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setImportMessage("Use um arquivo .txt para importar o deck.");
      return;
    }

    setImportLoading(true);
    setImportMessage("");
    setDeckMessage("");
    setIllegalCardMessage("");

    try {
      const content = await file.text();
      const { mainEntries, sideEntries } = parseDeckTxt(content);

      if (mainEntries.length === 0 && sideEntries.length === 0) {
        setImportMessage("Nenhuma carta válida foi encontrada no arquivo.");
        return;
      }

      const [resolvedMain, resolvedSide] = await Promise.all([
        resolveImportedCards(mainEntries),
        resolveImportedCards(sideEntries),
      ]);

      if (resolvedMain.length === 0 && resolvedSide.length === 0) {
        setImportMessage("Não foi possível encontrar as cartas no Scryfall.");
        return;
      }

      setMainDeck(resolvedMain);
      setSideboard(resolvedSide);
      setImportMessage("Deck importado com sucesso.");
      setTimeout(() => setImportMessage(""), MESSAGE_DISPLAY_MS);
    } catch {
      setImportMessage("Erro ao importar o arquivo de deck.");
    } finally {
      setImportLoading(false);
    }
  };

  return {
    // State
    deckForm,
    mainDeck,
    sideboard,
    deckLoading,
    deckMessage,
    cardLimitMessage,
    illegalCardMessage,
    importLoading,
    importMessage,
    totalMain,
    totalSide,
    // Setters
    setDeckForm,
    setMainDeck,
    setSideboard,
    // Handlers
    addCardToDeck,
    updateCardQuantity,
    removeCard,
    handleCreateDeck,
    importDeckFromTxt,
  };
}
