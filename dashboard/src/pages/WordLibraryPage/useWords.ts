import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  useGetWordsQuery, 
  useDeleteWordMutation, 
  useUpdateWordMutation,
  useAddWordRelationMutation,
  useDeleteWordRelationMutation 
} from '@/store/api/wordsApi';

export function useWords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerIdParam = searchParams.get('ownerId') ? Number(searchParams.get('ownerId')) : undefined;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('All');

  const { data, isLoading } = useGetWordsQuery({ 
    page, 
    search, 
    type: filter === 'All' ? undefined : filter.toLowerCase(),
    ownerId: ownerIdParam
  });
  const [deleteWord] = useDeleteWordMutation();
  const [updateWord] = useUpdateWordMutation();
  const [addRelation] = useAddWordRelationMutation();
  const [deleteRelation] = useDeleteWordRelationMutation();

  const words = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0 };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleOwnerChange = (newOwnerId?: number) => {
    setPage(1);
    if (newOwnerId) {
      setSearchParams({ ownerId: String(newOwnerId) });
    } else {
      searchParams.delete('ownerId');
      setSearchParams(searchParams);
    }
  };

  const handleDelete = async (id: number) => {
    return deleteWord(id).unwrap();
  };

  const handleUpdate = async (id: number, data: { meaningVi?: string; type?: string; example?: string }) => {
    return updateWord({ id, data }).unwrap();
  };

  const handleAddRelation = async (wordId: number, type: string, value: string) => {
    return addRelation({ wordId, type, value }).unwrap();
  };

  const handleDeleteRelation = async (relationId: number) => {
    return deleteRelation(relationId).unwrap();
  };

  return {
    words,
    isLoading,
    search,
    setSearch: handleSearchChange,
    filter,
    setFilter,
    ownerId: ownerIdParam,
    setOwnerId: handleOwnerChange,
    page,
    setPage,
    totalPages: meta.totalPages,
    totalWords: meta.total,
    handleDelete,
    handleUpdate,
    handleAddRelation,
    handleDeleteRelation
  };
}
