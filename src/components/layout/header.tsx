'use client';

import Link from 'next/link';
import { ShoppingBag, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartIcon } from '@/components/cart-icon';

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Waves className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold font-headline text-primary">ShopWave</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/#products" className="text-foreground/80 hover:text-primary transition-colors">
            All Products
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
