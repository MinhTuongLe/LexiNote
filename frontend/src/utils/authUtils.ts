/**
 * Check if the user has already seen the onboarding guide.
 * Evaluates both local storage cache and database user settings.
 */
export const checkHasSeenGuide = (user: any): boolean => {
  if (!user) return false;

  const userIdKey = user.id ?? user.userId ?? user._id ?? user.email ?? 'unknown';
  const storageKey = `hasSeenGuide_${userIdKey}`;
  const locallySeen = localStorage.getItem(storageKey) === 'true';

  const rawSettings = user.settings || {};
  const remotelySeen = rawSettings.preferences?.hasSeenGuide === true || rawSettings.hasSeenGuide === true;

  return Boolean(locallySeen || remotelySeen);
};

/**
 * Mark the onboarding guide as seen in local storage for immediate persistence.
 */
export const markGuideAsSeenLocal = (user: any): void => {
  if (!user) return;
  const userIdKey = user.id ?? user.userId ?? user._id ?? user.email ?? 'unknown';
  const storageKey = `hasSeenGuide_${userIdKey}`;
  localStorage.setItem(storageKey, 'true');
};
