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
  /** 'dark' (default) for glass/dark backgrounds, 'light' for white/light backgrounds */
  variant?: 'dark' | 'light';
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
      variant = 'dark',
      className,
      id,
      ...rest
    },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;

    const isDark = variant === 'dark';

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className={`mb-1.5 block text-sm font-medium ${isDark ? 'text-white/50' : 'text-gray-700'}`}
          >
            {label}
            {isRequired && (
              <span
                className={`ml-0.5 ${isDark ? 'text-red-400' : 'text-red-500'}`}
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}
        <div className="relative flex items-center">
          {startContent && (
            <span
              className={`pointer-events-none absolute left-3 flex items-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}
            >
              {startContent}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            required={isRequired}
            readOnly={isReadOnly}
            aria-invalid={isInvalid || undefined}
            aria-describedby={isInvalid && errorId ? errorId : undefined}
            onChange={(e) => onValueChange?.(e.target.value)}
            className={[
              'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all',
              isDark
                ? 'bg-white/5 text-white placeholder:text-white/25 hover:border-white/20 focus:border-golf-green/50 focus:ring-1 focus:ring-golf-green/20'
                : 'bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-golf-green focus:ring-1 focus:ring-golf-green/20',
              startContent ? 'pl-10' : '',
              endContent ? 'pr-10' : '',
              isInvalid
                ? isDark
                  ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                  : 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : isDark
                  ? 'border-white/10'
                  : 'border-gray-200',
              isReadOnly ? 'cursor-not-allowed opacity-60' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          />
          {endContent && (
            <span
              className={`absolute right-3 flex items-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}
            >
              {endContent}
            </span>
          )}
        </div>
        {isInvalid && errorMessage && (
          <p
            id={errorId}
            role="alert"
            className={`mt-1.5 text-xs ${isDark ? 'text-red-400' : 'text-red-500'}`}
          >
            {errorMessage}
          </p>
        )}
        {description && !isInvalid && (
          <p className={`mt-1.5 text-xs ${isDark ? 'text-white/30' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

export { TextInput };
export type { TextInputProps };
