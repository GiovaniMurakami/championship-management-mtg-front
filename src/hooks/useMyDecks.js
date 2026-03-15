import { useEffect, useState, useCallback } from "react";
import { listarDecks } from "../services/backendApi";

export function useMyDecks(token, usuarioId) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDecks = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await listarDecks(token, usuarioId);
      setDecks(Array.isArray(data) ? data : []);
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
    loading,
    message,
    fetchDecks,
  };
}
