import { useState, useEffect } from 'react';
import { apiClient } from './api-client';

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  mustChangePassword?: boolean;
}

// Combined Request Type for Create/Update
export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password?: string; // Only for create
}



const USER_SERVICE_ADMIN = '/user-service/api/v1/admin';

export function useUsers() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<UserDTO[]>(`${USER_SERVICE_ADMIN}/users`);
      setUsers(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- MUTATIONS ---

  const createUser = async (data: UserRequest) => {
    await apiClient.post(`${USER_SERVICE_ADMIN}/users`, data);
    fetchUsers(); // Refresh list
  };

  const updateUser = async (id: string, data: UserRequest) => {
    await apiClient.put(`${USER_SERVICE_ADMIN}/users/${id}`, data);
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await apiClient.delete(`${USER_SERVICE_ADMIN}/users/${id}`);
    fetchUsers();
  };

  return { users, isLoading, error, createUser, updateUser, deleteUser, refetch: fetchUsers };
}