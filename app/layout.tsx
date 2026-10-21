import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'HCP+ Inventario IT | Gestión de Equipamiento',
  description: 'Sistema de gestión de inventario informático (portátiles, sobremesas, periféricos e historial) sin base de datos, preparado para servidor IIS y Windows Server.',
  openGraph: {
    title: 'HCP+ Inventario IT',
    description: 'Sistema de gestión de inventario informático adaptado para IIS Windows Server sin base de datos.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HCP+ Inventario IT',
    description: 'Sistema de gestión de inventario informático adaptado para IIS Windows Server sin base de datos.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
