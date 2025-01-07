import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { theme } from './theme';
import HealthDashboard from './components/HealthDashboard';
import Login from './components/Login';
import Footer from './components/Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ pb: 8 }}> {/* Add padding bottom for footer */}
        {isAuthenticated && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
        <Box sx={{ my: 4 }}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <HealthDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </Box>
      </Container>
      <Footer />
    </ThemeProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
