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
  package_name?: string;
  installed_version?: string;
  fixed_version?: string;
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
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('scan_timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVulnerabilities, setCurrentVulnerabilities] = useState<Vulnerability[]>([]);
  const [currentSeverity, setCurrentSeverity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await axios.get('/api/v1/scans', {
          params: {
            page,
            per_page: perPage,
            sort_by: sortBy,
            sort_order: sortOrder
          }
        });
        setScans(response.data.items);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error('Error fetching scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  const handleVulnerabilityClick = async (scan: Scan, severity: string) => {
    try {
      const response = await axios.get(`/api/v1/scans/${scan.id}`);
      const rawResults = response.data.raw_results || {};
      const vulnerabilities = rawResults.Results?.[0]?.Vulnerabilities || [];
      const filteredVulns = vulnerabilities.filter((vuln: any) => 
        vuln.Severity?.toLowerCase() === severity.toLowerCase()
      ).map((vuln: any) => ({
        id: vuln.VulnerabilityID || '',
        title: vuln.Title || '',
        description: vuln.Description || '',
        severity: vuln.Severity || '',
        package_name: vuln.PkgName || '',
        installed_version: vuln.InstalledVersion || '',
        fixed_version: vuln.FixedVersion || ''
      }));
      setCurrentVulnerabilities(filteredVulns);
      setCurrentSeverity(severity.toUpperCase());
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
      // Show error message to user
      setCurrentVulnerabilities([]);
      setCurrentSeverity('ERROR');
      setOpenDialog(true);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || 'Failed to fetch vulnerability details';
        alert(errorMessage);
      } else {
        alert('An unexpected error occurred while fetching vulnerability details');
      }
    }
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Scan Results
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              label="Results per page"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              sx={{ width: 100 }}
            >
              {[10, 25, 50, 100].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => {
                  if (sortBy === 'image_name') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('image_name');
                    setSortOrder('asc');
                  }
                }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                Image Name {sortBy === 'image_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Tag</TableCell>
              <TableCell 
                onClick={() => {
                  if (sortBy === 'scan_timestamp') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('scan_timestamp');
                    setSortOrder('asc');
                  }
                }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                Scan Date {sortBy === 'scan_timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                onClick={() => {
                  if (sortBy === 'severity_critical') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('severity_critical');
                    setSortOrder('desc');
                  }
                }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                Critical {sortBy === 'severity_critical' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                onClick={() => {
                  if (sortBy === 'severity_high') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('severity_high');
                    setSortOrder('desc');
                  }
                }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                High {sortBy === 'severity_high' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                onClick={() => {
                  if (sortBy === 'severity_medium') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('severity_medium');
                    setSortOrder('desc');
                  }
                }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                Medium {sortBy === 'severity_medium' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                onClick={() => {
                  if (sortBy === 'severity_low') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('severity_low');
                    setSortOrder('desc');
                  }
                }}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                Low {sortBy === 'severity_low' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableCell>
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
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={(_, value) => setPage(value)}
          color="primary"
          showFirstButton 
          showLastButton
        />
      </Box>
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
