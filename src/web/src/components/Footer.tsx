import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import axios from 'axios';

interface VersionInfo {
  version: string;
}

const Footer: React.FC = () => {
  const [version, setVersion] = useState<string>('');
  const [hostname, setHostname] = useState<string>('');
  const sessionId = localStorage.getItem('sessionId') || 'Not available';

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await axios.get<VersionInfo>('/version');
        setVersion(response.data.version || 'Unknown');
      } catch (error) {
        console.error('Failed to fetch version:', error);
        setVersion('Error');
      }
    };

    const fetchHostname = async () => {
      try {
        // This assumes your API provides an endpoint for system info
        // You may need to implement this endpoint
        const response = await axios.get('/health');
        setHostname(window.location.hostname);
      } catch (error) {
        console.error('Failed to fetch hostname:', error);
        setHostname('Unknown');
      }
    };

    fetchVersion();
    fetchHostname();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        bgcolor: 'background.paper',
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        zIndex: 1000
      }}
    >
      <Divider sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Version: {version}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Server: {hostname}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Session ID: {sessionId}
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
