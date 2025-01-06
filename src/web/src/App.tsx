import React from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { theme } from './theme';
import HealthDashboard from './components/HealthDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <HealthDashboard />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
