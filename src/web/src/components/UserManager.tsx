import React, { useState, useEffect } from 'react';
import { useAuthService } from '../services/authService';
import { Box, Button, Typography, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Switch, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  roles?: string[];
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({username: '', email: '', password: ''});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/v1/users/me/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      const data = await response.json();
      setIsAdmin(data.roles.includes('admin'));
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

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

  const handleUpdateStatus = async (userId: number, isActive: boolean, isAdmin: boolean) => {
    if (!isActive && isAdmin) {
      const confirmDeactivate = window.confirm(
        'Warning: Deactivating an admin user could prevent system access if this is the last active admin. Continue?'
      );
      if (!confirmDeactivate) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/v1/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({is_active: isActive})
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user status');
      }
      
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user status');
      // Refresh the list to ensure we show current state
      fetchUsers();
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

  const handleDeleteUser = async (userId: number, isAdmin: boolean) => {
    if (isAdmin) {
      if (!window.confirm('Warning: Deleting an admin user could prevent system access if this is the last admin. Are you sure you want to continue?')) {
        return;
      }
    } else if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete user');
      }
      
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user');
    }
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
              onChange={(e) => handleUpdateStatus(user.id, e.target.checked, false)}
              color="primary"
            />
            {isAdmin && (
              <>
                <Tooltip title="Edit User">
                  <IconButton 
                    color="primary"
                    onClick={() => setEditUser(user)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete User">
                  <IconButton 
                    color="error"
                    onClick={() => handleDeleteUser(user.id, false)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
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
