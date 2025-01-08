import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getCurrentUserRoles } from '../services/authService';
import { logout } from '../services/logoutService';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const handleLogout = () => {
    logout();
  };

  // Update the clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!isAuthenticated) {
        setUserRoles([]);
        return;
      }

      try {
        const roles = await getCurrentUserRoles();
        setUserRoles(roles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
      }
    };

    // Fetch immediately
    fetchUserRoles();

    // Set up interval to check periodically
    const interval = setInterval(fetchUserRoles, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const isAdmin = userRoles.includes('admin');
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="subtitle1" sx={{ marginRight: 2 }}>
          {format(currentDateTime, 'yyyy-MM-dd HH:mm:ss')}
        </Typography>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Container Security Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginLeft: 'auto', alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/scans">
            Scan Results
          </Button>
          <Button color="inherit" component={Link} to="/api-keys">
            API Keys
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
          {isAuthenticated && (
            <>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ fontWeight: 'bold' }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
