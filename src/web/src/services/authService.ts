import axios from 'axios';

export const getCurrentUserRoles = async (): Promise<string[]> => {
  try {
    const response = await axios.get('/api/v1/users/me/roles');
    return response.data.roles || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};
