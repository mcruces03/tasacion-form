import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  filledCount?: number;
  totalCount?: number;
}

export default function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = false,
  filledCount = 0,
  totalCount = 0,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const progress = totalCount > 0 ? (filledCount / totalCount) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-oliva-100 text-oliva-600">
            {icon}
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            {totalCount > 0 && (
              <p className="text-xs text-slate-500">
                {filledCount} de {totalCount} campos
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-200 sm:block">
              <div
                className="h-full rounded-full bg-gradient-to-r from-oliva-400 to-oliva-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-5 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
