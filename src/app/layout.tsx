import { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'DataGN - Plateforme de Visualisation de Donnees',
  description: 'Plateforme SaaS de visualisation et analyse de donnees pour la Guinee',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable + ' ' + plusJakarta.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#030604" />
      </head>
      <body style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif', background: '#030604', color: '#F8FAFC', minHeight: '100vh' }}>
        <Providers>
          <ToastProvider>
            <main id="main-content">{children}</main>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
