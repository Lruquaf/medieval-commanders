import { useState, useCallback, useEffect, useRef } from 'react';
import apiClient, { uploadClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { normalizeProposal } from '../api/adapters';

export function useProposals({ pollMs = 0 } = {}) {
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
      const res = await apiClient.get(ENDPOINTS.ADMIN.PROPOSALS);
      const normalized = Array.isArray(res.data) ? res.data.map(normalizeProposal).filter(Boolean) : [];
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

  const approveProposal = useCallback(async (id) => {
    await apiClient.post(ENDPOINTS.ADMIN.proposalApprove(id));
    await fetchProposals();
  }, [fetchProposals]);

  const rejectProposal = useCallback(async (id) => {
    await apiClient.post(ENDPOINTS.ADMIN.proposalReject(id));
    await fetchProposals();
  }, [fetchProposals]);

  const updateProposal = useCallback(async (id, formData) => {
    await uploadClient.put(ENDPOINTS.ADMIN.proposalById(id), formData, {
      headers: { 'Content-Type': undefined }
    });
    await fetchProposals();
  }, [fetchProposals]);

  const deleteProposal = useCallback(async (id) => {
    await apiClient.delete(ENDPOINTS.ADMIN.proposalById(id));
    await fetchProposals();
  }, [fetchProposals]);

  const submitPublicProposal = useCallback(async (formData) => {
    const res = await apiClient.post(ENDPOINTS.PROPOSALS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data;
  }, []);

  return {
    proposals,
    loading,
    error,
    fetchProposals,
    refetch: fetchProposals,
    approveProposal,
    rejectProposal,
    updateProposal,
    deleteProposal,
    submitPublicProposal,
  };
}


