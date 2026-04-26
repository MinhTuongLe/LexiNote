import { 
  useGetUsersQuery, 
  useToggleUserStatusMutation, 
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation 
} from '@/store/api/usersApi';
import { useState } from 'react';

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

  const users = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const totalUsers = data?.meta?.total || 0;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleToggleStatus = (id: number) => {
    toggleStatus(id);
  };

  const handleCreateUser = async (data: any) => {
    return createUser(data).unwrap();
  };

  const handleUpdateUser = async (id: number, data: any) => {
    return updateUser({ id, data }).unwrap();
  };

  const handleDeleteUser = async (id: number) => {
    return deleteUser(id).unwrap();
  };

  const formatDate = (epoch: any) => {
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
