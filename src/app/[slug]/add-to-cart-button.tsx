'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: 'Added to cart!',
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border rounded-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-10 text-center font-bold">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          onClick={() => setQuantity((q) => q + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button size="lg" className="flex-grow" onClick={handleAddToCart}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </div>
  );
}
