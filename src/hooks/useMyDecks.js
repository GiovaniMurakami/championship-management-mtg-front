import { useEffect, useState } from "react";
import { listarDecks } from "../services/backendApi";

export function useMyDecks(token) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDecks = async () => {
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await listarDecks(token);
      setDecks(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [token]);

  return {
    decks,
    loading,
    message,
    fetchDecks,
  };
}
