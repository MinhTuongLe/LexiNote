import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

interface BackButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  className?: string;
  showText?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  variant = 'outline', 
  className = '',
  showText = true
}) => {
  const { t } = useTranslation();

  return (
    <Button 
      variant={variant} 
      onClick={onClick} 
      className={`back-button-unified ${className}`}
    >
      <ArrowLeft size={18} /> {showText && t('common.back')}
    </Button>
  );
};

export default BackButton;
