import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  wordCount: number;
  createdAt: string;
}

export interface UserListResponse {
  data: UserData[];
  meta: {
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  getUsers: async (params: { page: number; search: string; limit: number }): Promise<UserListResponse> => {
    const { data } = await api.get('/dashboard/management/users', { params });
    return data;
  },
  toggleStatus: async (id: number): Promise<void> => {
    await api.post(`/dashboard/management/users/${id}/toggle-status`);
  },
};

export function useUsers(page: number, search: string) {
  return useQuery({
    queryKey: ['users', { page, search }],
    queryFn: () => usersApi.getUsers({ page, search, limit: 10 }),
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
