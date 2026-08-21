import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'B2BR Order Collector - Omie ERP Portal',
  description: 'Portal de Pedidos B2BR integrado ao ERP Omie.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen bg-[#f9faf7] text-[#191c1b]">
        {children}
      </body>
    </html>
  );
}

