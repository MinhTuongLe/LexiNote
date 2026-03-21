import { useState, useRef, useEffect } from 'react';
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

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`cute-select-container ${className}`} ref={containerRef}>
      {label && <label className="cute-select-label">{label}</label>}
      <div 
        className={`cute-select-trigger ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={20} className={`chevron ${isOpen ? 'rotate' : ''}`} />
      </div>

      {isOpen && (
        <div className={`cute-select-dropdown animate-pop align-${align}`}>
          {options.map((option) => (
            <div 
              key={option.value} 
              className={`cute-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {value === option.value && <span className="check">✨</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CuteSelect;
