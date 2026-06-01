import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = '', id, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      ref={ref}
      id={id}
      {...props}
      className={`border rounded-lg px-3 py-2 text-sm outline-none transition-colors
        ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}
        ${className}`}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
