import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface WordData {
  id: number;
  text: string;
  type: string;
  translations: number;
  usersAdded: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const wordsApi = {
  getWords: async (): Promise<WordData[]> => {
    // In a real app, this would be an API call. 
    // For now, mirroring the current implementation's data but through a service pattern.
    return [
      { id: 1, text: 'Serendipity', type: 'Noun', translations: 12, usersAdded: 843, difficulty: 'Hard' },
      { id: 2, text: 'Melancholy', type: 'Noun', translations: 5, usersAdded: 620, difficulty: 'Medium' },
      { id: 3, text: 'Enthusiasm', type: 'Noun', translations: 8, usersAdded: 1540, difficulty: 'Easy' },
      { id: 4, text: 'Resilient', type: 'Adj', translations: 4, usersAdded: 932, difficulty: 'Medium' },
    ];
  },
};

export function useWords() {
  return useQuery({
    queryKey: ['words'],
    queryFn: wordsApi.getWords,
  });
}
