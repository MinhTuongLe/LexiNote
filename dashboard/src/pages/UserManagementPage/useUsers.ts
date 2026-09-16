import { 
  useGetUsersQuery, 
  useToggleUserStatusMutation, 
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation 
} from '@/store/api/usersApi';
import { useState } from 'react';

export interface CreateUserData {
  fullName: string;
  email: string;
}

export interface UpdateUserData {
  fullName: string;
}

export interface DashboardUserItem {
  id: number;
  email: string;
  fullName: string;
  avatar?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: number | string;
  wordCount?: number;
  role?: string;
}

export function useUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const { data, isLoading } = useGetUsersQuery({ 
    page, 
    search, 
    isActive: status === 'ALL' ? undefined : status === 'ACTIVE'
  });
  const [toggleStatus] = useToggleUserStatusMutation();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users: DashboardUserItem[] = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalUsers = data?.meta?.total || 0;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleToggleStatus = (id: number) => {
    toggleStatus(id);
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    return createUser(userData).unwrap();
  };

  const handleUpdateUser = async (id: number, userData: UpdateUserData) => {
    return updateUser({ id, data: userData }).unwrap();
  };

  const handleDeleteUser = async (id: number) => {
    return deleteUser(id).unwrap();
  };

  const formatDate = (epoch: number | string | undefined | null) => {
    if (!epoch) return 'N/A';
    return new Date(Number(epoch)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return {
    users,
    isLoading,
    search,
    setSearch: handleSearchChange,
    page,
    setPage,
    status,
    setStatus,
    totalPages,
    totalUsers,
    handleToggleStatus,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    formatDate
  };
}
