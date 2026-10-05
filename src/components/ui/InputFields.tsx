/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputProps, TextareaProps, SelectProps } from '../../types';

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  id,
  type = 'text',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col w-full mb-4">
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className="font-sans text-xs uppercase tracking-wider font-medium text-brand-text mb-2 block"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div
            id={`${id}-left-icon-container`}
            className="absolute left-4 text-brand-text-muted flex items-center justify-center pointer-events-none"
          >
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          type={type}
          disabled={disabled}
          className={`w-full bg-brand-surface text-brand-text font-sans text-sm rounded-none border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-brand-accent focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary'
          } ${leftIcon ? 'pl-11' : 'pl-4'} ${rightIcon ? 'pr-11' : 'pr-4'} py-3.5 outline-none transition-all duration-300 disabled:bg-brand-surface-muted disabled:text-brand-text-muted`}
          {...props}
        />
        {rightIcon && (
          <div
            id={`${id}-right-icon-container`}
            className="absolute right-4 text-brand-text-muted flex items-center justify-center pointer-events-none"
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-red-500 text-xs mt-1.5 font-sans font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-brand-text-muted text-xs mt-1.5 font-sans">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  disabled,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col w-full mb-4">
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className="font-sans text-xs uppercase tracking-wider font-medium text-brand-text mb-2 block"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        className={`w-full bg-brand-surface text-brand-text font-sans text-sm rounded-none border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-brand-accent focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary'
        } px-4 py-3.5 outline-none transition-all duration-300 resize-none disabled:bg-brand-surface-muted disabled:text-brand-text-muted`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-red-500 text-xs mt-1.5 font-sans font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-brand-text-muted text-xs mt-1.5 font-sans">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  options,
  error,
  helperText,
  className = '',
  disabled,
  id,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col w-full mb-4">
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className="font-sans text-xs uppercase tracking-wider font-medium text-brand-text mb-2 block"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          id={id}
          disabled={disabled}
          className={`w-full bg-brand-surface text-brand-text font-sans text-sm rounded-none border appearance-none ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-brand-accent focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary'
          } px-4 py-3.5 pr-10 outline-none transition-all duration-300 disabled:bg-brand-surface-muted disabled:text-brand-text-muted`}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-brand-surface text-brand-text font-sans"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div
          id={`${id}-arrow`}
          className="absolute inset-y-0 right-4 flex items-center justify-center pointer-events-none text-brand-text-muted"
        >
          <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-red-500 text-xs mt-1.5 font-sans font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-brand-text-muted text-xs mt-1.5 font-sans">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
