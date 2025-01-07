import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Container Security Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          <Button color="inherit" component={Link} to="/user-manager">
            User Manager
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
