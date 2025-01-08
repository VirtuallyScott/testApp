import axios from 'axios';
import { useCallback } from 'react';

export const logout = () => {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
};

export const getCurrentUserRoles = async (): Promise<string[]> => {
  try {
    const response = await axios.get('/api/v1/users/me/roles');
    console.log('User roles response:', response.data);
    return response.data.roles || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};

export const useAuthService = () => {
  const handleLogout = useCallback(() => {
    logout();
  }, []);

  return {
    logout: handleLogout
  };
};
