interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({ label, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}
