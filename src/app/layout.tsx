import type { Metadata as NextMetadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import ThemeCustomizer from '@/components/ThemeCustomizer';

// ─────────────────────────────────────────────────────────────────
// Fonts — self-hosted automatiquement par Next.js (0 requête CDN)
// Élimine 300ms+ de latence sur réseaux africains (2G/3G)
// ─────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // Réduit de 6 à 3 poids pour gagner ~100ms
  variable: '--font-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '800'], // Concentré sur les titres
  variable: '--font-heading',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: NextMetadata = {
  title: 'DataGN — Dashboards Data & IA · Conakry, Guinée',
  description: 'Connectez Google Sheets, CSV, KoboToolbox ou votre API. Kadi IA analyse et surveille 24/7. Seule agence data locale en Guinée.',
  keywords: 'dashboard, data, Guinée, Conakry, ONG, PNUD, UNICEF, KoboToolbox',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'DataGN',
    capable: true, // remplace <meta name="apple-mobile-web-app-capable" content="yes">
    statusBarStyle: 'default',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: 'DataGN — Visualisez vos données terrain',
    description: 'Dashboards temps réel pour ONG, gouvernements et mines en Guinée',
    siteName: 'DataGN',
    locale: 'fr_GN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#EDB025',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${plusJakarta.variable} ${dmMono.variable}`}
    >
      <head>
        {/* Prérecherche DNS pour accélérer Keycloak et les APIs */}
        <link rel="dns-prefetch" href="http://localhost:8081" />
        <link rel="preconnect" href="http://localhost:8081" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <ThemeCustomizer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
