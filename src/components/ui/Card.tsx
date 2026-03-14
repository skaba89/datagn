'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';

// ============================================
// Types
// ============================================

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'solid' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
}

// ============================================
// Component
// ============================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      padding = 'md',
      hoverable = false,
      clickable = false,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: '0',
      sm: '16px',
      md: '24px',
      lg: '32px',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      glass: {
        background: 'rgba(10, 20, 15, 0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      },
      solid: {
        background: 'rgba(14, 28, 20, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      },
      outline: {
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      },
      default: {
        background: 'var(--sf, rgba(10, 20, 15, 0.7))',
        border: '1px solid var(--bd, rgba(255, 255, 255, 0.08))',
      },
    };

    const cardStyle: React.CSSProperties = {
      borderRadius: '24px',
      padding: paddingStyles[padding],
      transition: hoverable || clickable ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      cursor: clickable ? 'pointer' : 'inherit',
      ...variantStyles[variant],
      ...style,
    };

    return (
      <div
        ref={ref}
        style={cardStyle}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================
// Card Header
// ============================================

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action, style, ...props }: CardHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '16px',
        ...style,
      }}
      {...props}
    >
      <div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--tx, #F8FAFC)',
            margin: 0,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--mu, #94A3B8)',
              margin: '4px 0 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================
// Card Content
// ============================================

export function CardContent({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ ...style }} {...props}>
      {children}
    </div>
  );
}

// ============================================
// Card Footer
// ============================================

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export function CardFooter({ align = 'right', children, style, ...props }: CardFooterProps) {
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: justifyContent[align],
        gap: '12px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================
// Stats Card
// ============================================

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'primary',
}: StatsCardProps) {
  const colorMap = {
    primary: '#10B981',
    secondary: '#FBBF24',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  };

  const isPositive = change !== undefined && change >= 0;

  return (
    <Card variant="glass" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--mu, #94A3B8)',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--tx, #F8FAFC)',
              margin: 0,
            }}
          >
            {value}
          </p>
          {change !== undefined && (
            <p
              style={{
                fontSize: '13px',
                color: isPositive ? '#22C55E' : '#EF4444',
                margin: '8px 0 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(change)}%</span>
              {changeLabel && <span style={{ color: 'var(--mu, #94A3B8)' }}>{changeLabel}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${colorMap[color]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorMap[color],
              fontSize: '24px',
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export default Card;
