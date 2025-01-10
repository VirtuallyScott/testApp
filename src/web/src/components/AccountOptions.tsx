import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  Switch,
  FormControlLabel,
  FormGroup,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

interface UserPreferences {
  theme: string;
  notifications_enabled: boolean;
}

interface UserProfile {
  email: string;
  username: string;
}

interface ApiKey {
  id: number;
  name: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
}

const AccountOptions: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications_enabled: true
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ email: '', username: '' });
  const [newPassword, setNewPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiryDays, setNewKeyExpiryDays] = useState('30');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/v1/users/me/preferences', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPreferences(data);
        } else if (response.status === 404) {
          // If preferences don't exist yet, use defaults
          setPreferences({
            theme: 'light',
            notifications_enabled: true
          });
        } else {
          throw new Error('Failed to fetch preferences');
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
        // Don't show error for preferences load failure
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch user profile');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Unable to load user profile. Please try again later.');
      }
    };

    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/v1/api-keys', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch API keys');
        const data = await response.json();
        setApiKeys(data);
      } catch (err) {
        setError('Failed to load API keys');
      }
    };

    fetchPreferences();
    fetchUserProfile();
    fetchApiKeys();
  }, []);

  const handleCreateApiKey = async () => {
    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: newKeyName,
          expires_in_days: parseInt(newKeyExpiryDays)
        })
      });

      if (!response.ok) throw new Error('Failed to create API key');
      const data = await response.json();
      setNewKeyValue(data.api_key);
      setApiKeys([...apiKeys, data]);
    } catch (err) {
      setError('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (keyId: number) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete API key');
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
    } catch (err) {
      setError('Failed to delete API key');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/v1/users/me/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) throw new Error('Failed to save preferences');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save preferences');
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Account Options
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Preferences saved successfully!</Alert>}

      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Profile Settings
      </Typography>
      
      <FormGroup sx={{ mb: 4 }}>
        <TextField
          label="Email"
          value={profile.email}
          onChange={(e) => setProfile({...profile, email: e.target.value})}
          margin="normal"
          fullWidth
        />
        
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          fullWidth
        />

        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={async () => {
              try {
                if (newPassword) {
                  const response = await fetch('/api/v1/users/me/password', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    },
                    body: JSON.stringify({ new_password: newPassword })
                  });
                  if (!response.ok) throw new Error('Failed to update password');
                  setPasswordChanged(true);
                  setNewPassword('');
                  setTimeout(() => setPasswordChanged(false), 3000);
                }

                const emailResponse = await fetch('/api/v1/users/me/email', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                  },
                  body: JSON.stringify({ new_email: profile.email })
                });
                if (!emailResponse.ok) throw new Error('Failed to update email');
                
              } catch (err) {
                setError('Failed to update profile');
              }
            }}
            color="primary"
            sx={{ mr: 2 }}
          >
            Update Profile
          </Button>
        </Box>
      </FormGroup>

      <Typography variant="h5" gutterBottom>
        Preferences
      </Typography>
      
      <FormGroup sx={{ mt: 3 }}>
        <FormControl sx={{ mb: 2 }}>
          <InputLabel>Theme</InputLabel>
          <Select
            value={preferences.theme}
            label="Theme"
            onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={preferences.notifications_enabled}
              onChange={(e) => setPreferences({
                ...preferences,
                notifications_enabled: e.target.checked
              })}
            />
          }
          label="Enable Notifications"
        />

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleSave}
            color="primary"
          >
            Save Preferences
          </Button>
        </Box>
      </FormGroup>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        API Keys
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => setShowCreateKeyDialog(true)}
          color="primary"
        >
          Create New API Key
        </Button>
      </Box>

      <List>
        {apiKeys.map((key) => (
          <ListItem
            key={key.id}
            secondaryAction={
              <IconButton 
                edge="end" 
                aria-label="delete"
                onClick={() => handleDeleteApiKey(key.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={key.name}
              secondary={
                <>
                  Created: {format(new Date(key.created_at), 'yyyy-MM-dd HH:mm')}
                  <br />
                  Expires: {key.expires_at ? format(new Date(key.expires_at), 'yyyy-MM-dd HH:mm') : 'Never'}
                  <br />
                  Last Used: {key.last_used_at ? format(new Date(key.last_used_at), 'yyyy-MM-dd HH:mm') : 'Never'}
                  <br />
                  Status: {key.is_active ? 'Active' : 'Inactive'}
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog 
        open={showCreateKeyDialog} 
        onClose={() => {
          setShowCreateKeyDialog(false);
          setNewKeyValue(null);
          setNewKeyName('');
          setNewKeyExpiryDays('30');
        }}
      >
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          {!newKeyValue ? (
            <>
              <TextField
                fullWidth
                label="Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Expires in Days"
                type="number"
                value={newKeyExpiryDays}
                onChange={(e) => setNewKeyExpiryDays(e.target.value)}
                margin="normal"
              />
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Copy this API key now. You won't be able to see it again!
              </Alert>
              <TextField
                fullWidth
                value={newKeyValue}
                InputProps={{
                  readOnly: true,
                }}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCreateKeyDialog(false);
            setNewKeyValue(null);
            setNewKeyName('');
            setNewKeyExpiryDays('30');
          }}>
            {newKeyValue ? 'Close' : 'Cancel'}
          </Button>
          {!newKeyValue && (
            <Button onClick={handleCreateApiKey} color="primary">
              Create
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AccountOptions;
