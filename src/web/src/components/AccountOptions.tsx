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
  InputLabel
} from '@mui/material';

interface UserPreferences {
  theme: string;
  notifications_enabled: boolean;
}

interface UserProfile {
  email: string;
  username: string;
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

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/v1/users/me/preferences', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch preferences');
        const data = await response.json();
        setPreferences(data);
      } catch (err) {
        setError('Failed to load preferences');
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
        setError('Failed to load user profile');
      }
    };

    fetchPreferences();
    fetchUserProfile();
  }, []);

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
    </Paper>
  );
};

export default AccountOptions;
