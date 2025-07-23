'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Button asChild variant="ghost" size="icon" className="relative">
      <Link href="/checkout">
        <ShoppingBag className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {itemCount}
          </span>
        )}
        <span className="sr-only">View your shopping cart</span>
      </Link>
    </Button>
  );
}
