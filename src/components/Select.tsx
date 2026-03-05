import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; minWidth: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const gap = 4;
      const menuHeight = 200;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const openAbove = spaceBelow < menuHeight && rect.top > menuHeight + gap;
      setMenuStyle({
        top: openAbove ? rect.top - menuHeight - gap : rect.bottom + gap,
        left: rect.left,
        minWidth: rect.width,
      });
    } else {
      setMenuStyle(null);
    }
  }, [isOpen]);

  const displayLabel = value ? options.find((o) => o.value === value)?.label ?? value : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-800 transition-all duration-200 focus:border-oliva-400 focus:outline-none focus:ring-2 focus:ring-oliva-100 data-[placeholder]:text-gray-400"
        data-placeholder={!value ? true : undefined}
      >
        <span>{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && menuStyle && (
        <div
          className="fixed z-[200] max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          style={{
            top: menuStyle.top,
            left: menuStyle.left,
            minWidth: menuStyle.minWidth,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-oliva-50 ${
              !value ? 'bg-oliva-50 text-oliva-700' : 'text-gray-700'
            }`}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-oliva-50 ${
                value === opt.value ? 'bg-oliva-50 text-oliva-700' : 'text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
