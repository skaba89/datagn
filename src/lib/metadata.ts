import { Metadata, Viewport } from 'next';

// ============================================
// Site Configuration
// ============================================

export const siteConfig = {
  name: 'DataGN',
  description: 'Plateforme d\'analyse de données avec IA pour l\'Afrique',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://datagn.com',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/skaba89/datagn',
    twitter: 'https://twitter.com/datagn',
  },
  creator: 'DataGN Team',
  locale: 'fr_GN',
} as const;

// ============================================
// Default Metadata
// ============================================

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: `${siteConfig.name} — Analyse de Données avec IA`,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  keywords: [
    'data visualization',
    'business intelligence',
    'analyse données',
    'dashboard',
    'Afrique',
    'Guinée',
    'IA',
    'intelligence artificielle',
    'KoboToolbox',
    'DHIS2',
    'reporting',
    'KPI',
  ],

  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,

  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@datagn',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/manifest.json',

  alternates: {
    canonical: siteConfig.url,
    languages: {
      'fr-GN': siteConfig.url,
      'en-US': `${siteConfig.url}/en`,
    },
  },

  category: 'technology',
};

// ============================================
// Viewport Configuration
// ============================================

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#030604' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark light',
};

// ============================================
// Page-specific Metadata Generators
// ============================================

interface PageMetadata {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

export function generatePageMetadata(page: PageMetadata): Metadata {
  return {
    title: page.title,
    description: page.description || siteConfig.description,
    openGraph: {
      title: page.title,
      description: page.description || siteConfig.description,
      images: page.image ? [{ url: page.image }] : undefined,
    },
    twitter: {
      title: page.title,
      description: page.description || siteConfig.description,
      images: page.image ? [page.image] : undefined,
    },
    robots: page.noIndex ? { index: false, follow: false } : undefined,
  };
}

// ============================================
// Dashboard Metadata Generator
// ============================================

interface DashboardMetadata {
  name: string;
  description?: string;
  isPublic: boolean;
}

export function generateDashboardMetadata(dashboard: DashboardMetadata): Metadata {
  if (!dashboard.isPublic) {
    return {
      title: dashboard.name,
      robots: { index: false, follow: false },
    };
  }

  return generatePageMetadata({
    title: `${dashboard.name} — Dashboard`,
    description: dashboard.description || `Tableau de bord: ${dashboard.name}`,
  });
}

// ============================================
// JSON-LD Structured Data
// ============================================

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [siteConfig.links.github, siteConfig.links.twitter],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@datagn.com',
      availableLanguage: ['French', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GN',
      addressLocality: 'Conakry',
    },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GNF',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };
}

export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: 'BusinessApplication',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    operatingSystem: 'Any',
    permissions: 'none',
  };
}
