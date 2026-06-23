import { useEffect, useState, useCallback, useRef } from "react";
import { listarDecks } from "../services/backendApi";

export function useMyDecks(token, usuarioId) {
  const [decks, setDecks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const fetchDecks = useCallback(async () => {
    if (!tokenRef.current || !usuarioId) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await listarDecks(tokenRef.current, { usuarioId, limite: 100 });
      setDecks(data.decks);
      setTotal(data.total);
    } catch (error) {
      setMessage(error.message);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  return {
    decks,
    total,
    loading,
    message,
    fetchDecks,
  };
}
