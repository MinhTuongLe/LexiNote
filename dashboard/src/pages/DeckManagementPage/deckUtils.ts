export interface DeckWordInput {
  word: string;
  meaningVi: string;
  type: string;
}

export const parseDeckWords = (raw: string): DeckWordInput[] => raw
  .split(/\r?\n/)
  .map((line) => line.split('|').map((value) => value.trim()))
  .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
  .map(([word, meaningVi, type = 'noun']) => ({ word, meaningVi, type: type || 'noun' }));
