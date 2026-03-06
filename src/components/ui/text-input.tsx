'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  description?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  onValueChange?: (_value: string) => void;
  isRequired?: boolean;
  isReadOnly?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      errorMessage,
      isInvalid,
      description,
      startContent,
      endContent,
      onValueChange,
      isRequired,
      isReadOnly,
      className,
      id,
      ...rest
    },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-white/50">
            {label}
            {isRequired && <span className="ml-0.5 text-red-400">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {startContent && (
            <span className="pointer-events-none absolute left-3 flex items-center text-white/40">
              {startContent}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            required={isRequired}
            readOnly={isReadOnly}
            onChange={(e) => onValueChange?.(e.target.value)}
            className={[
              'w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white',
              'placeholder:text-white/25 outline-none transition-all',
              'hover:border-white/20 focus:border-golf-green/50 focus:ring-1 focus:ring-golf-green/20',
              startContent ? 'pl-10' : '',
              endContent ? 'pr-10' : '',
              isInvalid
                ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                : 'border-white/10',
              isReadOnly ? 'cursor-not-allowed opacity-60' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />
          {endContent && (
            <span className="absolute right-3 flex items-center text-white/40">{endContent}</span>
          )}
        </div>
        {isInvalid && errorMessage && <p className="mt-1.5 text-xs text-red-400">{errorMessage}</p>}
        {description && !isInvalid && <p className="mt-1.5 text-xs text-white/30">{description}</p>}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

export { TextInput };
export type { TextInputProps };
