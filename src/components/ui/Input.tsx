'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';

// ============================================
// Types
// ============================================

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

// ============================================
// Component
// ============================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      fullWidth = true,
      disabled,
      id,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const sizeStyles = {
      sm: { padding: '8px 12px', fontSize: '13px' },
      md: { padding: '12px 16px', fontSize: '14px' },
      lg: { padding: '16px 20px', fontSize: '16px' },
    };

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: fullWidth ? '100%' : 'auto',
    };

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      background: 'var(--cd, rgba(14, 28, 20, 0.5))',
      border: `1px solid ${error ? 'var(--error, #EF4444)' : isFocused ? 'var(--gn, #10B981)' : 'var(--bd, rgba(255, 255, 255, 0.08))'}`,
      borderRadius: '10px',
      color: 'var(--tx, #F8FAFC)',
      fontFamily: 'var(--ff-sans, inherit)',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
      opacity: disabled ? 0.5 : 1,
      paddingLeft: leftIcon ? '44px' : undefined,
      paddingRight: rightIcon ? '44px' : undefined,
      ...sizeStyles[size],
      ...style,
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--tx, #F8FAFC)',
    };

    const hintStyle: React.CSSProperties = {
      fontSize: '12px',
      color: error ? 'var(--error, #EF4444)' : 'var(--mu, #94A3B8)',
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--mu, #94A3B8)',
      pointerEvents: 'none',
      width: '44px',
      height: '100%',
    };

    return (
      <div style={containerStyle}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}

        <div style={wrapperStyle}>
          {leftIcon && <div style={{ ...iconStyle, left: 0 }}>{leftIcon}</div>}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            style={inputStyle}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {rightIcon && <div style={{ ...iconStyle, right: 0 }}>{rightIcon}</div>}
        </div>

        {(error || hint) && (
          <span
            id={error ? `${inputId}-error` : `${inputId}-hint`}
            style={hintStyle}
            role={error ? 'alert' : undefined}
          >
            {error || hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// Textarea Variant
// ============================================

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, size = 'md', fullWidth = true, disabled, id, style, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const sizeStyles = {
      sm: { padding: '8px 12px', fontSize: '13px' },
      md: { padding: '12px 16px', fontSize: '14px' },
      lg: { padding: '16px 20px', fontSize: '16px' },
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label htmlFor={textareaId} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--tx, #F8FAFC)' }}>
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          style={{
            width: '100%',
            background: 'var(--cd, rgba(14, 28, 20, 0.5))',
            border: `1px solid ${error ? 'var(--error, #EF4444)' : isFocused ? 'var(--gn, #10B981)' : 'var(--bd, rgba(255, 255, 255, 0.08))'}`,
            borderRadius: '10px',
            color: 'var(--tx, #F8FAFC)',
            fontFamily: 'var(--ff-sans, inherit)',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
            opacity: disabled ? 0.5 : 1,
            resize: 'vertical',
            minHeight: '100px',
            ...sizeStyles[size],
            ...style,
          }}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />

        {(error || hint) && (
          <span
            id={error ? `${textareaId}-error` : `${textareaId}-hint`}
            style={{ fontSize: '12px', color: error ? 'var(--error, #EF4444)' : 'var(--mu, #94A3B8)' }}
            role={error ? 'alert' : undefined}
          >
            {error || hint}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
