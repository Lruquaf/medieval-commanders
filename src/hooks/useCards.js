import { useState, useCallback } from 'react';
import apiClient, { uploadClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { normalizeCard } from '../api/adapters';

export function useCards({ admin = false } = {}) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCards = useCallback(async () => {
    try {
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


