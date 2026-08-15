import { useEffect, useState, useCallback, useRef } from "react";
import { listarDecks } from "../services/backendApi";

/**
 * @param {string|null|undefined} token
 * @param {string|null|undefined} usuarioId
 * @param {{ enabled?: boolean }} [options] — default true; use false para adiar o fetch
 */
export function useMyDecks(token, usuarioId, options = {}) {
  const enabled = options.enabled !== false;
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
    if (!enabled) {
      setDecks([]);
      setTotal(0);
      setLoading(false);
      setMessage("");
      return;
    }
    fetchDecks();
  }, [enabled, fetchDecks]);

  return {
    decks,
    total,
    loading,
    message,
    fetchDecks,
  };
}
