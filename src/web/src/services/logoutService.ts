export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('sessionId');
  window.location.href = '/login';
};
