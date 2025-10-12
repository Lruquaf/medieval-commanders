import { useCallback, useState } from 'react';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { normalizeAdminSettings } from '../api/adapters';

const AUTH_KEY = 'adminAuthenticated';

export function useAdmin() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === 'true';

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
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


