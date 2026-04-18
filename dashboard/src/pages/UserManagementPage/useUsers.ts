import { useState } from 'react';
import { useGetUsersQuery, useToggleUserStatusMutation, useCreateUserMutation } from '@/store/api/usersApi';

export function useUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetUsersQuery({ page, search });
  const [toggleStatus] = useToggleUserStatusMutation();
  const [createUser] = useCreateUserMutation();

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
    totalPages,
    totalUsers,
    handleToggleStatus,
    handleCreateUser,
    formatDate
  };
}
