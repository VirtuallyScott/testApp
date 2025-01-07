import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ApiKey {
  id: number;
  name: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<{name: string, expires_in_days: number}>({name: '', expires_in_days: 30});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/v1/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch API keys');
      const data = await response.json();
      setKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching API keys');
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: newKey.name,
          expires_in_days: newKey.expires_in_days
        })
      });
      
      if (!response.ok) throw new Error('Failed to create API key');
      
      const data = await response.json();
      setGeneratedKey(data.api_key);
      setShowCreateDialog(false);
      fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating API key');
    }
  };

  const handleDeleteKey = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete API key');
      
      fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting API key');
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
            <Button 
              color="error"
              onClick={() => handleDeleteKey(key.id)}
            >
              Delete
            </Button>
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
