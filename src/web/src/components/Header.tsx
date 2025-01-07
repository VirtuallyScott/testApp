import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

interface DecodedToken {
  sub: string;
  is_admin: boolean;
  exp: number;
}

interface HeaderProps {
  isAuthenticated: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      return;
    }
    const checkAdminStatus = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwt_decode<DecodedToken>(token);
          console.log('Token decoded:', decoded); // Debug log
          setIsAdmin(decoded.is_admin);
        } catch (error) {
          console.error('Error decoding token:', error);
          setIsAdmin(false);
        }
      } else {
        console.log('No token found'); // Debug log
        setIsAdmin(false);
      }
    };

    // Check immediately
    checkAdminStatus();

    // Set up interval to check periodically
    const interval = setInterval(checkAdminStatus, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Container Security Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/scans">
            Scan Results
          </Button>
          {isAdmin && (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/api-keys"
                sx={{ fontWeight: 'bold' }}
              >
                API Keys
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/user-manager"
                sx={{ fontWeight: 'bold' }}
              >
                User Manager
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
