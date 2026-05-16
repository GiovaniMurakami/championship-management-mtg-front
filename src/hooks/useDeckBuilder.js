import { useMemo, useState } from "react";
import { cadastrarDeck, atualizarDeck } from "../services/backendApi";
import { buscarCartasPorNome } from "../services/scryfallApi";
import { toDeckPayload } from "../utils/deckPayload";
import { parseDeckTxt } from "../utils/parseDeckTxt";
import {
  MAX_DECK_SIZE,
  MAX_SIDEBOARD_SIZE,
  MAX_CARD_COPIES,
  MESSAGE_DISPLAY_MS,
} from "../constants/auth";

export function useDeckBuilder() {
  const [deckForm, setDeckForm] = useState({ nome: "", formato: "", linkLigaMagic: "" });
  const [mainDeck, setMainDeck] = useState([]);
  const [sideboard, setSideboard] = useState([]);
  const [commander, setCommander] = useState([]);
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

  const totalCommander = useMemo(
    () =>
      commander.reduce((acc, card) => acc + Number(card.quantidade || 0), 0),
    [commander],
  );

  const addCardToDeck = (card, section) => {
    const setter =
      section === "main"
        ? setMainDeck
        : section === "commander"
          ? setCommander
          : setSideboard;
    const isBasicLand = card.isBasicLand;

    setter((current) => {
      if (section === "commander") {
        return [
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
      }

      const found = current.find((item) => item.nome === card.nome);

      if (found) {
        const newQuantidade = Number(found.quantidade) + 1;
        const maxAllowed = isBasicLand ? 999 : MAX_CARD_COPIES;

        if (newQuantidade > maxAllowed) {
          setCardLimitMessage(
            `Limite de ${maxAllowed} copias de "${card.nome}" atingido.`,
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
    const deck =
      section === "main"
        ? mainDeck
        : section === "commander"
          ? commander
          : sideboard;
    const card = deck.find((c) => c.nome === nome);
    const isBasicLand = card?.isBasicLand;
    const maxAllowed =
      section === "commander" ? 1 : (isBasicLand ? 999 : MAX_CARD_COPIES);

    const parsed = Math.max(1, Math.min(maxAllowed, Number(quantidade || 1)));
    const setter =
      section === "main"
        ? setMainDeck
        : section === "commander"
          ? setCommander
          : setSideboard;

    if (parsed === maxAllowed && Number(quantidade) > maxAllowed) {
      setCardLimitMessage(
        `Limite de ${maxAllowed} copias de "${nome}" atingido.`,
      );
      setTimeout(() => setCardLimitMessage(""), MESSAGE_DISPLAY_MS);
    }

    setter((current) =>
      current.map((c) => (c.nome === nome ? { ...c, quantidade: parsed } : c)),
    );
  };

  const removeCard = (section, nome) => {
    const setter =
      section === "main"
        ? setMainDeck
        : section === "commander"
          ? setCommander
          : setSideboard;
    setter((current) => current.filter((card) => card.nome !== nome));
  };

  const compareDeckCards = (currentCards, originalCards) => {
    if (currentCards.length !== originalCards.length) {
      return false;
    }

    const currentNorm = currentCards
      .map((c) => ({ nome: c.nome, quantidade: c.quantidade }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    const originalNorm = originalCards
      .map((c) => ({ nome: c.nome, quantidade: c.quantidade }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

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
      setDeckMessage("Faca login para cadastrar um deck.");
      return;
    }

    if (deckIdParam && originalDeck) {
      const nomeIgual = deckForm.nome === originalDeck.nome;
      const formatoIgual = deckForm.formato === originalDeck.formato;
      const linkLigaMagicIgual =
        (deckForm.linkLigaMagic || "") === (originalDeck.linkLigaMagic || "");
      const maindeckIgual = compareDeckCards(
        mainDeck,
        originalDeck.maindeck || [],
      );
      const sideboardIgual = compareDeckCards(
        sideboard,
        originalDeck.sideboard || [],
      );
      const commanderIgual = compareDeckCards(
        commander,
        Array.isArray(originalDeck.commander)
          ? originalDeck.commander
          : originalDeck.commander
            ? [originalDeck.commander]
            : [],
      );

      if (
        nomeIgual
        && formatoIgual
        && linkLigaMagicIgual
        && maindeckIgual
        && sideboardIgual
        && commanderIgual
      ) {
        setDeckMessage("Nenhuma alteracao foi feita.");
        setTimeout(() => setDeckMessage(""), MESSAGE_DISPLAY_MS);
        return;
      }
    }

    const isCommander =
      deckForm.formato === "commander" || deckForm.formato === "commander500";
    const minimumMainDeckSize = isCommander ? 99 : MAX_DECK_SIZE;
    const maximumSideboardSize = isCommander ? 1 : MAX_SIDEBOARD_SIZE;

    if (deckForm.formato === "commander500" && !deckForm.linkLigaMagic.trim()) {
      setDeckMessage("Informe o link LigaMagic para decks Commander 500.");
      return;
    }

    if (totalMain < minimumMainDeckSize) {
      setDeckMessage(
        `O maindeck precisa ter pelo menos ${minimumMainDeckSize} cartas.`,
      );
      return;
    }

    if (totalSide > maximumSideboardSize) {
      setDeckMessage(
        isCommander
          ? "O deck Commander pode ter apenas 1 comandante."
          : `O sideboard pode ter no maximo ${MAX_SIDEBOARD_SIZE} cartas.`,
      );
      return;
    }

    if (isCommander && totalCommander !== 1) {
      setDeckMessage("O deck Commander precisa ter exatamente 1 comandante.");
      return;
    }

    const ilegalCards = [];
    const formatoChecagem = deckForm.formato;

    [...mainDeck, ...sideboard, ...commander].forEach((card) => {
      const legalFormat = card.legalities?.[formatoChecagem];

      if (legalFormat === false) {
        ilegalCards.push(card.nome);
      }
    });

    if (ilegalCards.length > 0) {
      setIllegalCardMessage(
        `As seguintes cartas nao sao legais em ${formatoChecagem}: ${ilegalCards.join(", ")}`,
      );
      return;
    }

    setDeckLoading(true);

    try {
      const payload = {
        nome: deckForm.nome,
        formato: deckForm.formato,
        linkLigaMagic: deckForm.linkLigaMagic.trim() || undefined,
        maindeck: toDeckPayload(mainDeck),
        sideboard: toDeckPayload(sideboard),
        commander: toDeckPayload(commander),
      };

      if (deckIdParam) {
        await atualizarDeck(deckIdParam, payload, token);
        setDeckMessage("Deck atualizado com sucesso.");
      } else {
        await cadastrarDeck(payload, token);
        setDeckMessage("Deck cadastrado com sucesso.");
        setDeckForm({ nome: "", formato: "", linkLigaMagic: "" });
        setMainDeck([]);
        setSideboard([]);
        setCommander([]);
      }

      setTimeout(() => setDeckMessage(""), MESSAGE_DISPLAY_MS);
    } catch (error) {
      setDeckMessage(error.message);
    } finally {
      setDeckLoading(false);
    }
  };

  const resolveImportedCards = async (entries) => {
    const cards = await buscarCartasPorNome(entries.map((entry) => entry.nome));

    return cards
      .map((card, index) => {
        if (!card) {
          return null;
        }

        return {
          nome: card.nome,
          quantidade: entries[index].quantidade,
          imagem: card.imagem || "",
          isBasicLand: card.isBasicLand,
          legalities: card.legalities || {},
          colors: card.colors || card.colorIdentity || [],
          cmc: Number.isFinite(card.cmc) ? card.cmc : Number(card.cmc) || 0,
          manaCost: card.manaCost || "",
          typeLine: card.typeLine || "",
        };
      })
      .filter(Boolean);
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
      const { mainEntries, sideEntries, commanderEntries } = parseDeckTxt(content);

      if (mainEntries.length === 0 && sideEntries.length === 0 && commanderEntries.length === 0) {
        setImportMessage("Nenhuma carta valida foi encontrada no arquivo.");
        return;
      }

      const [resolvedMain, resolvedSide, resolvedCommander] = await Promise.all([
        resolveImportedCards(mainEntries),
        resolveImportedCards(sideEntries),
        resolveImportedCards(commanderEntries),
      ]);

      if (resolvedMain.length === 0 && resolvedSide.length === 0 && resolvedCommander.length === 0) {
        setImportMessage("Nao foi possivel encontrar as cartas no Scryfall.");
        return;
      }

      setMainDeck(resolvedMain);
      setSideboard(resolvedSide);
      setCommander(resolvedCommander);
      setImportMessage("Deck importado com sucesso.");
      setTimeout(() => setImportMessage(""), MESSAGE_DISPLAY_MS);
    } catch {
      setImportMessage("Erro ao importar o arquivo de deck.");
    } finally {
      setImportLoading(false);
    }
  };

  return {
    deckForm,
    mainDeck,
    sideboard,
    commander,
    deckLoading,
    deckMessage,
    cardLimitMessage,
    illegalCardMessage,
    importLoading,
    importMessage,
    totalMain,
    totalSide,
    totalCommander,
    setDeckForm,
    setMainDeck,
    setSideboard,
    setCommander,
    addCardToDeck,
    updateCardQuantity,
    removeCard,
    handleCreateDeck,
    importDeckFromTxt,
  };
}
