import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button,
  CircularProgress,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Scan {
  id: number;
  image_name: string;
  image_tag: string;
  scan_timestamp: string;
  severity_critical: number;
  severity_high: number;
  severity_medium: number;
  severity_low: number;
}

const ScanResults: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await axios.get('/api/v1/scans');
        setScans(response.data);
      } catch (error) {
        console.error('Error fetching scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  const handleViewDetails = (scanId: number) => {
    navigate(`/scans/${scanId}`);
  };

  const handleDownload = async (scanId: number) => {
    try {
      const response = await axios.get(`/api/v1/scans/${scanId}`);
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scan-${scanId}.json`;
      link.click();
    } catch (error) {
      console.error('Error downloading scan:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Scan Results
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image Name</TableCell>
              <TableCell>Tag</TableCell>
              <TableCell>Scan Date</TableCell>
              <TableCell>Critical</TableCell>
              <TableCell>High</TableCell>
              <TableCell>Medium</TableCell>
              <TableCell>Low</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scans.map((scan) => (
              <TableRow key={scan.id}>
                <TableCell>{scan.image_name}</TableCell>
                <TableCell>{scan.image_tag}</TableCell>
                <TableCell>{new Date(scan.scan_timestamp).toLocaleString()}</TableCell>
                <TableCell sx={{ color: 'error.main' }}>{scan.severity_critical}</TableCell>
                <TableCell sx={{ color: 'warning.main' }}>{scan.severity_high}</TableCell>
                <TableCell sx={{ color: 'info.main' }}>{scan.severity_medium}</TableCell>
                <TableCell>{scan.severity_low}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => handleViewDetails(scan.id)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download JSON">
                    <IconButton onClick={() => handleDownload(scan.id)}>
                      <Download />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ScanResults;
