import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  isLoading,
  disabled = false,
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, translateY: -2 }}
      whileTap={{ scale: 0.95, translateY: 2 }}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
      disabled={disabled || Boolean(isLoading)}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? <span className="btn-spinner" style={{ marginRight: 6 }} /> : null}
      {children}
    </motion.button>
  );
};

export default Button;
