import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { format } from 'date-fns';
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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update the clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (!isAuthenticated) {
        console.log('Not authenticated, hiding admin links');
        setIsAdmin(false);
        return;
      }
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No token found');
        setIsAdmin(false);
        return;
      }

      try {
        const decoded = jwt_decode<DecodedToken>(token);
        console.log('Token decoded:', decoded);
        console.log('Admin status:', decoded.is_admin);
        setIsAdmin(decoded.is_admin);
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAdmin(false);
      }
    };

    // Check immediately
    checkAdminStatus();

    // Set up interval to check periodically
    const interval = setInterval(checkAdminStatus, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [isAuthenticated]); // Add isAuthenticated as dependency
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Container Security Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ marginRight: 3 }}>
          {format(currentDateTime, 'yyyy-MM-dd HH:mm:ss')}
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
