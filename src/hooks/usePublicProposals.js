import { useState, useCallback } from 'react';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { normalizeProposal } from '../api/adapters';

export function usePublicProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProposals = useCallback(async () => {
    try {
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
      setLoading(false);
    }
  }, []);

  return {
    proposals,
    loading,
    error,
    fetchProposals,
    refetch: fetchProposals,
  };
}


