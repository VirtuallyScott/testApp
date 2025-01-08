import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Switch } from '@mui/material';
import { format } from 'date-fns';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({username: '', email: '', password: ''});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const params = new URLSearchParams();
      params.append('username', newUser.username);
      params.append('email', newUser.email);
      params.append('password', newUser.password);
      params.append('is_active', 'true'); // Default to active

      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: params
      });
      
      if (!response.ok) throw new Error('Failed to create user');
      
      setShowCreateDialog(false);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating user');
    }
  };

  const handleUpdateStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/v1/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({is_active: isActive})
      });
      
      if (!response.ok) throw new Error('Failed to update user status');
      
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user status');
    }
  };

  const handleChangePassword = async (userId: number, newPassword: string) => {
    try {
      const response = await fetch(`/api/v1/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({new_password: newPassword})
      });
      
      if (!response.ok) throw new Error('Failed to change password');
      
      setEditUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error changing password');
    }
  };

  const onLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button 
        variant="contained" 
        onClick={() => setShowCreateDialog(true)}
        sx={{ mb: 2 }}
      >
        Create New User
      </Button>

      <List>
        {users.map(user => (
          <ListItem key={user.id} divider>
            <ListItemText
              primary={user.username}
              secondary={
                <>
                  Email: {user.email}<br />
                  Status: {user.is_active ? 'Active' : 'Inactive'}<br />
                  Created: {format(new Date(user.created_at), 'yyyy-MM-dd HH:mm')}
                </>
              }
            />
            <Switch
              checked={user.is_active}
              onChange={(e) => handleUpdateStatus(user.id, e.target.checked)}
              color="primary"
            />
            <Button 
              color="primary"
              onClick={() => setEditUser(user)}
            >
              Edit
            </Button>
          </ListItem>
        ))}
      </List>

      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (
            <>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                onChange={(e) => handleChangePassword(editUser.id, e.target.value)}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManager;
