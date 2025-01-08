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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: string;
}

interface Scan {
  id: number;
  image_name: string;
  image_tag: string;
  scan_timestamp: string;
  severity_critical: number;
  severity_high: number;
  severity_medium: number;
  severity_low: number;
  vulnerabilities: {
    critical: Vulnerability[];
    high: Vulnerability[];
    medium: Vulnerability[];
    low: Vulnerability[];
  };
}

const ScanResults: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVulnerabilities, setCurrentVulnerabilities] = useState<Vulnerability[]>([]);
  const [currentSeverity, setCurrentSeverity] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVulnerabilities, setCurrentVulnerabilities] = useState<Vulnerability[]>([]);
  const [currentSeverity, setCurrentSeverity] = useState('');
  const navigate = useNavigate();

  const handleVulnerabilityClick = (scan: Scan, severity: string) => {
    switch(severity) {
      case 'critical':
        setCurrentVulnerabilities(scan.vulnerabilities.critical);
        break;
      case 'high':
        setCurrentVulnerabilities(scan.vulnerabilities.high);
        break;
      case 'medium':
        setCurrentVulnerabilities(scan.vulnerabilities.medium);
        break;
      case 'low':
        setCurrentVulnerabilities(scan.vulnerabilities.low);
        break;
      default:
        setCurrentVulnerabilities([]);
    }
    setCurrentSeverity(severity.toUpperCase());
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentVulnerabilities([]);
    setCurrentSeverity('');
  };

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

  const handleVulnerabilityClick = (scan: Scan, severity: string) => {
    switch(severity) {
      case 'critical':
        setCurrentVulnerabilities(scan.vulnerabilities.critical);
        break;
      case 'high':
        setCurrentVulnerabilities(scan.vulnerabilities.high);
        break;
      case 'medium':
        setCurrentVulnerabilities(scan.vulnerabilities.medium);
        break;
      case 'low':
        setCurrentVulnerabilities(scan.vulnerabilities.low);
        break;
      default:
        setCurrentVulnerabilities([]);
    }
    setCurrentSeverity(severity.toUpperCase());
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentVulnerabilities([]);
    setCurrentSeverity('');
  };

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
    <>
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
                <TableCell 
                  sx={{ color: 'error.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => handleVulnerabilityClick(scan, 'critical')}
                >
                  {scan.severity_critical}
                </TableCell>
                <TableCell 
                  sx={{ color: 'warning.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => handleVulnerabilityClick(scan, 'high')}
                >
                  {scan.severity_high}
                </TableCell>
                <TableCell 
                  sx={{ color: 'info.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => handleVulnerabilityClick(scan, 'medium')}
                >
                  {scan.severity_medium}
                </TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => handleVulnerabilityClick(scan, 'low')}
                >
                  {scan.severity_low}
                </TableCell>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>{currentSeverity} Vulnerabilities</DialogTitle>
      <DialogContent>
        {currentVulnerabilities.length > 0 ? (
          <List>
            {currentVulnerabilities.map((vuln) => (
              <ListItem key={vuln.id} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <ListItemText
                  primary={vuln.title}
                  secondary={vuln.description}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                  secondaryTypographyProps={{ whiteSpace: 'pre-wrap' }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <DialogContentText>
            No {currentSeverity.toLowerCase()} vulnerabilities found.
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Close</Button>
      </DialogActions>
      </Dialog>
    </>
  );
};

export default ScanResults;
