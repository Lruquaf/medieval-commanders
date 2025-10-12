import { useState, useCallback } from 'react';
import apiClient, { uploadClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { normalizeProposal } from '../api/adapters';

export function useProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProposals = useCallback(async () => {
    try {
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
      setLoading(false);
    }
  }, []);

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


