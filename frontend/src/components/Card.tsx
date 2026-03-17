import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`cute-card ${className} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;
