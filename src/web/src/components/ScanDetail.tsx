import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Download } from '@mui/icons-material';
import axios from 'axios';

const ScanDetail: React.FC = () => {
  const { scanId } = useParams();
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const response = await axios.get(`/api/v1/scans/${scanId}`);
        setScan(response.data);
      } catch (error) {
        console.error('Error fetching scan details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [scanId]);

  const handleDownload = () => {
    const dataStr = JSON.stringify(scan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan-${scanId}.json`;
    link.click();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!scan) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Scan not found
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Scan Details: {scan.image_name}:{scan.image_tag}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownload}
        >
          Download JSON
        </Button>
      </Box>
      
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Image Name</TableCell>
              <TableCell>{scan.image_name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Image Tag</TableCell>
              <TableCell>{scan.image_tag}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Scan Date</TableCell>
              <TableCell>{new Date(scan.scan_timestamp).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Critical Vulnerabilities</TableCell>
              <TableCell sx={{ color: 'error.main' }}>{scan.severity_critical}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>High Vulnerabilities</TableCell>
              <TableCell sx={{ color: 'warning.main' }}>{scan.severity_high}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Medium Vulnerabilities</TableCell>
              <TableCell sx={{ color: 'info.main' }}>{scan.severity_medium}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Low Vulnerabilities</TableCell>
              <TableCell>{scan.severity_low}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom>
        Raw Results
      </Typography>
      <Box
        component="pre"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          maxHeight: '500px',
          overflow: 'auto'
        }}
      >
        {JSON.stringify(scan.raw_results, null, 2)}
      </Box>
    </Paper>
  );
};

export default ScanDetail;
