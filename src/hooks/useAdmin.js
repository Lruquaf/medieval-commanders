import { useCallback, useState } from 'react';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { normalizeAdminSettings } from '../api/adapters';

const AUTH_KEY = 'adminToken';

export function useAdmin() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = () => Boolean(localStorage.getItem(AUTH_KEY));

  const login = async (username, password) => {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { username, password });
    if (data?.token) {
      localStorage.setItem(AUTH_KEY, data.token);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    // Clean up any legacy auth flag if it exists
    try { localStorage.removeItem('adminAuthenticated'); } catch (_) {}
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(ENDPOINTS.ADMIN.SETTINGS);
      const s = normalizeAdminSettings(res.data);
      setSettings(s);
      return s;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (next) => {
    const payload = {
      email: next.email || '',
      instagramUrl: next.instagramUrl || '',
      twitterUrl: next.twitterUrl || '',
      facebookUrl: next.facebookUrl || '',
      linkedinUrl: next.linkedinUrl || '',
      youtubeUrl: next.youtubeUrl || '',
    };
    await apiClient.put(ENDPOINTS.ADMIN.SETTINGS, payload);
    await fetchSettings();
  }, [fetchSettings]);

  return {
    // auth helpers
    isAuthenticated,
    login,
    logout,
    // settings
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  };
}


