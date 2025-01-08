import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Delete, Pause } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { fetchApiKeys, createApiKey, deleteApiKey, suspendApiKey } from '../services/apiKeyService';
import { getCurrentUserRoles } from '../services/authService';

interface ApiKey {
  id: number;
  name: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  created_by: number;
}

const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<{name: string, expires_in_days: number}>({name: '', expires_in_days: 30});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const checkAdminStatus = async () => {
    try {
      const roles = await getCurrentUserRoles();
      setIsAdmin(roles.includes('admin'));
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const loadKeys = async () => {
    try {
      const data = await fetchApiKeys();
      setKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching API keys');
    }
  };

  useEffect(() => {
    checkAdminStatus();
    loadKeys();
  }, []);

  const handleCreateKey = async () => {
    try {
      const result = await createApiKey(newKey.name, newKey.expires_in_days);
      setGeneratedKey(result.api_key);
      setShowCreateDialog(false);
      loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating API key');
    }
  };

  const handleDeleteKey = async (id: number) => {
    try {
      await deleteApiKey(id);
      loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting API key');
    }
  };

  const handleSuspendKey = async (id: number) => {
    try {
      await suspendApiKey(id);
      loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error suspending API key');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        API Keys Management
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button 
        variant="contained" 
        onClick={() => setShowCreateDialog(true)}
        sx={{ mb: 2 }}
      >
        Create New API Key
      </Button>

      <List>
        {keys.map(key => (
          <ListItem key={key.id} divider>
            <ListItemText
              primary={key.name}
              secondary={
                <>
                  Created: {format(new Date(key.created_at), 'yyyy-MM-dd HH:mm')}<br />
                  Expires: {key.expires_at ? format(new Date(key.expires_at), 'yyyy-MM-dd HH:mm') : 'Never'}<br />
                  Last Used: {key.last_used_at ? format(new Date(key.last_used_at), 'yyyy-MM-dd HH:mm') : 'Never'}
                </>
              }
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Suspend Key">
                <IconButton 
                  color="warning"
                  onClick={() => handleSuspendKey(key.id)}
                  disabled={!isAdmin && key.created_by !== parseInt(localStorage.getItem('user_id') || '0')}
                >
                  <Pause />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Key">
                <IconButton 
                  color="error"
                  onClick={() => handleDeleteKey(key.id)}
                  disabled={!isAdmin && key.created_by !== parseInt(localStorage.getItem('user_id') || '0')}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
        ))}
      </List>

      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Key Name"
            value={newKey.name}
            onChange={(e) => setNewKey({...newKey, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Expires in Days (optional)"
            type="number"
            value={newKey.expires_in_days}
            onChange={(e) => setNewKey({...newKey, expires_in_days: parseInt(e.target.value) || 0})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateKey} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!generatedKey} onClose={() => setGeneratedKey(null)}>
        <DialogTitle>API Key Created</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your new API key is:
          </Typography>
          <Typography variant="body2" sx={{ 
            backgroundColor: '#f5f5f5',
            p: 2,
            borderRadius: 1,
            wordBreak: 'break-all'
          }}>
            {generatedKey}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Please copy this key now as it will not be shown again!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGeneratedKey(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeys;
