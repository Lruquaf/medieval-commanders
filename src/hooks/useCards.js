import { useState, useCallback, useEffect, useRef } from 'react';
import apiClient, { uploadClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { normalizeCard } from '../api/adapters';

export function useCards({ admin = false, pollMs = 0 } = {}) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchCards = useCallback(async () => {
    try {
      if (isFetchingRef.current) return cards; // avoid overlapping fetches
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const url = admin ? ENDPOINTS.ADMIN.CARDS : ENDPOINTS.CARDS;
      const res = await apiClient.get(url);
      const normalized = Array.isArray(res.data) ? res.data.map(normalizeCard).filter(Boolean) : [];
      setCards(normalized);
      return normalized;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [admin]);

  const createCard = useCallback(async (formData) => {
    const res = await uploadClient.post(ENDPOINTS.ADMIN.CARDS, formData, {
      headers: { 'Content-Type': undefined }
    });
    await fetchCards();
    return res.data;
  }, [fetchCards]);

  const updateCard = useCallback(async (id, formData) => {
    const res = await uploadClient.put(ENDPOINTS.ADMIN.cardById(id), formData, {
      headers: { 'Content-Type': undefined }
    });
    await fetchCards();
    return res.data;
  }, [fetchCards]);

  const deleteCard = useCallback(async (id) => {
    await apiClient.delete(ENDPOINTS.ADMIN.cardById(id));
    await fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    let intervalId;
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isFetchingRef.current) return;
      fetchCards();
    };
    intervalId = setInterval(tick, pollMs);
    return () => clearInterval(intervalId);
  }, [pollMs, fetchCards]);

  return {
    cards,
    loading,
    error,
    fetchCards,
    refetch: fetchCards,
    // Admin-only helpers (caller is responsible to call these when admin=true)
    createCard,
    updateCard,
    deleteCard,
  };
}


 

