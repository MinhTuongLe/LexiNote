import { useSelector } from 'react-redux';

export const useSound = () => {
  const { user } = useSelector((state: any) => state.auth);
  const soundEnabled = user?.settings?.preferences?.soundEnabled ?? true;

  const playSound = (type: 'success' | 'error' | 'click' | 'flip' | 'win' | 'pop') => {
    if (!soundEnabled) return;

    let url = '';
    let volume = 0.5;

    switch (type) {
      case 'success':
        url = 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3';
        volume = 0.4;
        break;
      case 'error':
        url = 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3';
        volume = 0.35;
        break;
      case 'flip':
        url = 'https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3';
        volume = 0.5;
        break;
      case 'win':
        url = 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3';
        volume = 0.5;
        break;
      case 'pop':
        url = 'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3';
        volume = 0.4;
        break;
      case 'click':
        url = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
        volume = 0.4;
        break;
    }

    if (url) {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(err => console.warn('Sound playback failed:', err));
    }
  };

  return { playSound };
};
