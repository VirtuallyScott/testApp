import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 4, mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        Container Security Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to the Container Security Dashboard. This application provides a 
        comprehensive view of your container security status, including:
      </Typography>
      <Box component="ul" sx={{ pl: 4, mb: 3 }}>
        <li>System health and readiness status</li>
        <li>Container vulnerability reports</li>
        <li>Security policy compliance</li>
        <li>Real-time monitoring</li>
      </Box>
      <Typography variant="body1" paragraph>
        Use the navigation above to explore the different features and manage your
        container security.
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={() => navigate('/dashboard')}
        sx={{ mt: 2 }}
      >
        View Dashboard
      </Button>
    </Paper>
  );
};

export default Home;
