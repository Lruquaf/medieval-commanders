import { useState, useCallback, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { normalizeProposal } from '../api/adapters';

export function usePublicProposals({ pollMs = 0 } = {}) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchProposals = useCallback(async () => {
    try {
      if (isFetchingRef.current) return proposals;
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const res = await apiClient.get(ENDPOINTS.PROPOSALS);
      const normalized = Array.isArray(res.data)
        ? res.data.map(normalizeProposal).filter(Boolean)
        : [];
      setProposals(normalized);
      return normalized;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    let intervalId;
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isFetchingRef.current) return;
      fetchProposals();
    };
    intervalId = setInterval(tick, pollMs);
    return () => clearInterval(intervalId);
  }, [pollMs, fetchProposals]);

  return {
    proposals,
    loading,
    error,
    fetchProposals,
    refetch: fetchProposals,
  };
}


