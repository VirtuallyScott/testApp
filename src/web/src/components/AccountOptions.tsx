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

const AccountOptions: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications_enabled: true
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

    fetchPreferences();
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
