import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import './CuteSelect.css';

interface Option {
  value: string;
  label: string;
}

interface CuteSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  align?: 'left' | 'right';
}

const CuteSelect: React.FC<CuteSelectProps> = ({ options, value, onChange, label, className = '', align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value) || options[0] || { value: '', label: 'Select an option' };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((open) => !open);
    }
  };

  return (
    <div className={`cute-select-container ${className}`} ref={containerRef}>
      {label && <label className="cute-select-label" htmlFor={listboxId}>{label}</label>}
      <button
        ref={triggerRef}
        id={listboxId}
        type="button"
        className={`cute-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={options.length === 0}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={20} className={`chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className={`cute-select-dropdown animate-pop align-${align}`} role="listbox" aria-labelledby={listboxId}>
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`cute-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
              {value === option.value && <span className="check">âœ¨</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CuteSelect;
