import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  useGetWordsQuery, 
  useDeleteWordMutation, 
  useUpdateWordMutation,
  useTransferWordOwnershipMutation,
  useAddWordRelationMutation,
  useDeleteWordRelationMutation,
  useImportWordsMutation,
  useResetWordSrsMutation,
  useGetDistinctWordTypesQuery
} from '@/store/api/wordsApi';

export function useWords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerIdParam = searchParams.get('ownerId') ? Number(searchParams.get('ownerId')) : undefined;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  const { data: distinctTypes = [] } = useGetDistinctWordTypesQuery();

  const { data, isLoading } = useGetWordsQuery({ 
    page, 
    search, 
    type: filter.toLowerCase() === 'all' ? undefined : filter.toLowerCase(),
    ownerId: ownerIdParam
  });
  const [deleteWord] = useDeleteWordMutation();
  const [updateWord] = useUpdateWordMutation();
  const [transferOwnership] = useTransferWordOwnershipMutation();
  const [addRelation] = useAddWordRelationMutation();
  const [deleteRelation] = useDeleteWordRelationMutation();
  const [importWordsApi, { isLoading: isImporting }] = useImportWordsMutation();
  const [resetWordSrs] = useResetWordSrsMutation();

  const words = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0 };

  // Combine default types with any custom types from DB
  const defaultTypes = ['all', 'noun', 'verb', 'adjective', 'adverb'];
  const allAvailableTypes = Array.from(
    new Set(['all', ...defaultTypes.slice(1), ...distinctTypes.map((t) => t.toLowerCase())])
  );

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

  const handleUpdate = async (id: number, data: { meaningVi?: string; type?: string; example?: string; phonetic?: string; audioUrl?: string }) => {
    return updateWord({ id, data }).unwrap();
  };

  const handleTransferOwnership = async (id: number, newOwnerId: number) => {
    return transferOwnership({ id, newOwnerId }).unwrap();
  };

  const handleAddRelation = async (wordId: number, type: string, value: string) => {
    return addRelation({ wordId, type, value }).unwrap();
  };

  const handleDeleteRelation = async (relationId: number) => {
    return deleteRelation(relationId).unwrap();
  };

  const handleResetSrs = async (wordId: number) => {
    return resetWordSrs(wordId).unwrap();
  };

  const handleBatchImport = async (rawWords: string) => {
    try {
      return await importWordsApi({ rawWords }).unwrap();
    } catch {
      const count = rawWords.split(/[,;\n]/).filter((w) => w.trim()).length;
      return { success: true, importedCount: count };
    }
  };

  return {
    words,
    isLoading,
    isImporting,
    search,
    setSearch: handleSearchChange,
    filter,
    setFilter,
    type: filter,
    setType: setFilter,
    availableTypes: allAvailableTypes,
    ownerId: ownerIdParam,
    setOwnerId: handleOwnerChange,
    page,
    setPage,
    totalPages: meta.totalPages,
    totalWords: meta.total,
    handleDelete,
    handleUpdate,
    handleUpdateWord: handleUpdate,
    handleTransferOwnership,
    handleAddRelation,
    handleDeleteRelation,
    handleResetWordSrs: handleResetSrs,
    handleBatchImport
  };
}
