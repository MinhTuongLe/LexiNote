import { useState } from 'react';
import { useGetWordsQuery, useDeleteWordMutation } from '@/store/api/wordsApi';

export function useWords() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('All');

  const { data, isLoading } = useGetWordsQuery({ page, search });
  const [deleteWord] = useDeleteWordMutation();

  const words = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0 };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this word from the global registry?')) {
      await deleteWord(id);
    }
  };

  return {
    words,
    isLoading,
    search,
    setSearch: handleSearchChange,
    filter,
    setFilter,
    page,
    setPage,
    totalPages: meta.totalPages,
    totalWords: meta.total,
    handleDelete
  };
}
