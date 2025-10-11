// Centralized API endpoint paths
export const ENDPOINTS = {
  CARDS: '/api/cards',
  PROPOSALS: '/api/proposals',
  ADMIN: {
    ROOT: '/api/admin',
    CARDS: '/api/admin/cards',
    PROPOSALS: '/api/admin/proposals',
    SETTINGS: '/api/admin/settings',
    proposalApprove: (id) => `/api/admin/proposals/${id}/approve`,
    proposalReject: (id) => `/api/admin/proposals/${id}/reject`,
    cardById: (id) => `/api/admin/cards/${id}`,
    proposalById: (id) => `/api/admin/proposals/${id}`,
  },
};


