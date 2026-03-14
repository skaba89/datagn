'use client';

import { useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ============================================
// Types
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

// ============================================
// Component
// ============================================

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Add/remove event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Handle click outside
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '560px' },
    lg: { maxWidth: '720px' },
    xl: { maxWidth: '960px' },
    full: { maxWidth: '95vw', maxHeight: '95vh' },
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          background: 'var(--sf, rgba(10, 20, 15, 0.95))',
          borderRadius: '24px',
          border: '1px solid var(--bd, rgba(255, 255, 255, 0.08))',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'slideUp 0.3s ease-out',
          ...sizeStyles[size],
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '24px 24px 0',
            }}
          >
            <div>
              {title && (
                <h2
                  id="modal-title"
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--tx, #F8FAFC)',
                    margin: 0,
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  style={{
                    fontSize: '14px',
                    color: 'var(--mu, #94A3B8)',
                    margin: '8px 0 0 0',
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Fermer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--mu, #94A3B8)',
                  cursor: 'pointer',
                  padding: '8px',
                  fontSize: '20px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ============================================
// Confirm Modal
// ============================================

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const variantColors = {
    danger: { bg: '#EF4444', text: '#fff' },
    warning: { bg: '#F59E0B', text: '#000' },
    info: { bg: '#3B82F6', text: '#fff' },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ color: 'var(--mu, #94A3B8)', marginBottom: '24px' }}>{message}</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid var(--bd, rgba(255, 255, 255, 0.08))',
            borderRadius: '10px',
            color: 'var(--tx, #F8FAFC)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: variantColors[variant].bg,
            color: variantColors[variant].text,
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {isLoading ? 'Chargement...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;
