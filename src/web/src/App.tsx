import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { theme } from './theme';
import HealthDashboard from './components/HealthDashboard';
import Login from './components/Login';
import Footer from './components/Footer';
import Home from './components/Home';
import Header from './components/Header';
import ScanResults from './components/ScanResults';
import ScanDetail from './components/ScanDetail';
import ApiKeys from './components/ApiKeys';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg" sx={{ pb: 8, pt: 2 }}> {/* Add padding bottom for footer */}
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
                  <Home />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <HealthDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/scans"
              element={
                isAuthenticated ? (
                  <ScanResults />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/scans/:scanId"
              element={
                isAuthenticated ? (
                  <ScanDetail />
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
            <Route
              path="/api-keys"
              element={
                isAuthenticated ? (
                  <ApiKeys />
                ) : (
                  <Navigate to="/login" />
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
