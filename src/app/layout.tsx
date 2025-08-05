import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartProvider } from '@/context/cart-context';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/client-utils';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'ShopWave',
  description: 'The future of online shopping.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      {/* Head elements should be placed in _document.tsx for Next.js apps */}
      <body className={cn('font-body antialiased h-full', 'font-body')}>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header/>
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
