import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress,
  Box
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { fetchHealthStatus, fetchReadinessStatus, fetchVersion } from '../services/healthService';

interface ServiceStatus {
  status: string;
  database?: string;
  redis?: string;
}

const HealthDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<ServiceStatus | null>(null);
  const [readyStatus, setReadyStatus] = useState<ServiceStatus | null>(null);
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const [health, ready, ver] = await Promise.all([
        fetchHealthStatus(),
        fetchReadinessStatus(),
        fetchVersion()
      ]);
      setHealthStatus(health);
      setReadyStatus(ready);
      setVersion(ver.version);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const StatusIcon = ({ status }: { status: string }) => (
    status === 'healthy' || status === 'up' || status === 'ready' 
      ? <CheckCircleIcon color="success" />
      : <ErrorIcon color="error" />
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Status Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Health Status
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <StatusIcon status={healthStatus?.status || 'down'} />
                <Typography>
                  {healthStatus?.status || 'Unknown'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Readiness
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <StatusIcon status={readyStatus?.status || 'down'} />
                  <Typography>
                    Overall: {readyStatus?.status || 'Unknown'}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <StatusIcon status={readyStatus?.database || 'down'} />
                  <Typography>
                    Database: {readyStatus?.database || 'Unknown'}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <StatusIcon status={readyStatus?.redis || 'down'} />
                  <Typography>
                    Redis: {readyStatus?.redis || 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          Version: {version}
        </Typography>
      </Box>
    </Paper>
  );
};

export default HealthDashboard;
