/**
 * DataGN Design System Tokens
 * Consistent design values across the application
 */

// ============================================
// Colors
// ============================================

export const colors = {
  // Primary
  primary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Secondary (Gold/Amber)
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24', // Main
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Neutral
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Semantic
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#065F46',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#991B1B',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#92400E',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1E40AF',
  },

  // Background
  background: {
    dark: '#030604',
    light: '#F8FAFC',
  },
} as const;

// ============================================
// Typography
// ============================================

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    heading: "'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "'DM Mono', 'Fira Code', monospace",
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// ============================================
// Spacing
// ============================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
} as const;

// ============================================
// Border Radius
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================
// Shadows
// ============================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',

  // Glow effects
  glow: {
    primary: '0 0 20px rgba(16, 185, 129, 0.3)',
    secondary: '0 0 20px rgba(251, 191, 36, 0.3)',
    error: '0 0 20px rgba(239, 68, 68, 0.3)',
  },
} as const;

// ============================================
// Transitions
// ============================================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  all: 'all 200ms ease',
  colors: 'color 200ms ease, background-color 200ms ease, border-color 200ms ease',
  transform: 'transform 200ms ease',
  opacity: 'opacity 200ms ease',
} as const;

// ============================================
// Z-Index
// ============================================

export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  top: 900,
  max: 9999,
} as const;

// ============================================
// Breakpoints
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// Components Styles
// ============================================

export const components = {
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: typography.fontWeight.bold,
      borderRadius: borderRadius.lg,
      transition: transitions.all,
    },
    sizes: {
      sm: {
        padding: `${spacing[1.5]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
      },
      md: {
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: typography.fontSize.base,
      },
      lg: {
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.lg,
      },
    },
    variants: {
      primary: {
        background: colors.primary[500],
        color: '#000',
        boxShadow: shadows.glow.primary,
      },
      secondary: {
        background: 'transparent',
        color: colors.secondary[400],
        border: `1px solid ${colors.secondary[400]}`,
      },
      ghost: {
        background: 'transparent',
        color: colors.neutral[400],
      },
    },
  },

  card: {
    base: {
      background: 'rgba(10, 20, 15, 0.7)',
      borderRadius: borderRadius['3xl'],
      border: `1px solid rgba(255, 255, 255, 0.08)}`,
      backdropFilter: 'blur(24px)',
    },
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
  },

  input: {
    base: {
      background: 'rgba(14, 28, 20, 0.5)',
      border: `1px solid rgba(255, 255, 255, 0.08)}`,
      borderRadius: borderRadius.lg,
      padding: `${spacing[2]} ${spacing[3]}`,
      color: colors.neutral[50],
      fontSize: typography.fontSize.base,
      transition: transitions.colors,
    },
    focus: {
      borderColor: colors.primary[500],
      boxShadow: `0 0 0 2px ${colors.primary[500]}40`,
    },
  },
} as const;

// ============================================
// CSS Variables Generator
// ============================================

export function generateCSSVariables(): string {
  return `
:root {
  /* Colors - Primary */
  --color-primary-50: ${colors.primary[50]};
  --color-primary-100: ${colors.primary[100]};
  --color-primary-500: ${colors.primary[500]};
  --color-primary-600: ${colors.primary[600]};
  --color-primary-700: ${colors.primary[700]};

  /* Colors - Secondary */
  --color-secondary-400: ${colors.secondary[400]};
  --color-secondary-500: ${colors.secondary[500]};

  /* Semantic */
  --color-success: ${colors.success.main};
  --color-error: ${colors.error.main};
  --color-warning: ${colors.warning.main};
  --color-info: ${colors.info.main};

  /* Typography */
  --font-sans: ${typography.fontFamily.sans};
  --font-heading: ${typography.fontFamily.heading};
  --font-mono: ${typography.fontFamily.mono};

  /* Spacing */
  --spacing-1: ${spacing[1]};
  --spacing-2: ${spacing[2]};
  --spacing-4: ${spacing[4]};
  --spacing-6: ${spacing[6]};
  --spacing-8: ${spacing[8]};

  /* Border Radius */
  --radius-sm: ${borderRadius.sm};
  --radius-md: ${borderRadius.md};
  --radius-lg: ${borderRadius.lg};
  --radius-xl: ${borderRadius.xl};
  --radius-2xl: ${borderRadius['2xl']};
  --radius-3xl: ${borderRadius['3xl']};

  /* Shadows */
  --shadow-sm: ${shadows.sm};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-xl: ${shadows.xl};

  /* Transitions */
  --transition-fast: ${transitions.duration.fast};
  --transition-normal: ${transitions.duration.normal};
  --transition-slow: ${transitions.duration.slow};

  /* Z-Index */
  --z-dropdown: ${zIndex.dropdown};
  --z-modal: ${zIndex.modal};
  --z-toast: ${zIndex.toast};
}
  `.trim();
}
