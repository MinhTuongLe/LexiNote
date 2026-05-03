import type { TFunction } from 'i18next';
import { WORD_TYPES } from '../constants/wordTypes';

/**
 * Get translated or custom label for a word type
 * @param typeValue The raw type string from backend
 * @param t Translation function
 * @param userSettings Optional user settings containing custom word types
 */
export const getTypeLabel = (typeValue: string, t: TFunction, userSettings?: any) => {
  if (!typeValue) return t('library.word_types.other');
  
  const lowerType = typeValue.toLowerCase().trim();
  
  // 1. Check default system types
  const defaultType = WORD_TYPES.find(t => t.value === lowerType);
  if (defaultType) {
    return t(`library.word_types.${lowerType}`);
  }

  // 2. Check custom user types if settings provided
  if (userSettings?.wordTypes) {
    const customType = userSettings.wordTypes.find((ct: any) => ct.value === lowerType);
    if (customType) return customType.label;
  }

  // 3. Fallback to capitalized raw value
  return typeValue.charAt(0).toUpperCase() + typeValue.slice(1);
};
