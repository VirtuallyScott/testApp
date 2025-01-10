import axios from 'axios';
import { useCallback } from 'react';

export const logout = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      await axios.post('/api/v1/logout', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
};

export const getCurrentUserRoles = async (): Promise<string[]> => {
  try {
    const response = await axios.get('/api/v1/users/me/roles');
    return response.data.roles || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};

export const getCurrentUserId = (): number | null => {
  const userId = localStorage.getItem('user_id');
  return userId ? parseInt(userId) : null;
};

export const useAuthService = () => {
  const handleLogout = useCallback(() => {
    logout();
  }, []);

  return {
    logout: handleLogout
  };
};
