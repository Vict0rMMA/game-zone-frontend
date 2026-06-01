import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'GameZone — Tienda de Videojuegos',
  description: 'Catálogo y gestión de videojuegos y periféricos gaming',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1a1d28', color: '#e8eaf0', border: '1px solid rgba(255,255,255,0.08)' },
              success: { iconTheme: { primary: '#39ff14', secondary: '#0a0b0f' } },
              error: { iconTheme: { primary: '#ff4757', secondary: '#0a0b0f' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
