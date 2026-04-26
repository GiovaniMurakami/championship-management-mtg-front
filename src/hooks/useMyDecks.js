import { useEffect, useState, useCallback } from "react";
import { listarDecks } from "../services/backendApi";

export function useMyDecks(token, usuarioId) {
  const [decks, setDecks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDecks = useCallback(async () => {
    if (!token || !usuarioId) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await listarDecks(token, usuarioId ? { usuarioId } : undefined);
      const list = data.decks ?? (Array.isArray(data) ? data : []);
      setDecks(list);
      setTotal(data.total ?? list.length);
    } catch (error) {
      setMessage(error.message);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, [token, usuarioId]);

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
