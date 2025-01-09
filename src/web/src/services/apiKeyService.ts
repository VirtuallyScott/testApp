import axios from 'axios';

interface ApiKey {
  id: number;
  name: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  created_by: number;
}

export const fetchApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const response = await axios.get('/api/v1/api-keys', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching API keys:', error);
    throw error;
  }
};

export const createApiKey = async (name: string, expires_in_days: number): Promise<{ api_key: string }> => {
  try {
    const response = await axios.post('/api/v1/api-keys', 
      { name: name, expires_in_days: expires_in_days },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
};

export const extendApiKey = async (id: number, days: number): Promise<void> => {
  try {
    await axios.put(`/api/v1/api-keys/${id}/extend`, 
      { days },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error extending API key:', error);
    throw error;
  }
};

export const deleteApiKey = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/api/v1/api-keys/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};

export const suspendApiKey = async (id: number): Promise<void> => {
  try {
    const response = await axios.put(`/api/v1/api-keys/${id}/suspend`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status !== 200) {
      throw new Error('Failed to suspend API key');
    }
  } catch (error) {
    console.error('Error suspending API key:', error);
    throw error;
  }
};
