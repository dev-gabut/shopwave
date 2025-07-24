
// *************** IMPORT LIBRARY ***************
'use client';
import { useState } from 'react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

// *************** IMPORT MODULE ***************
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

// *************** IMPORT TYPE 
import type { Product } from '@/lib/types';

// *************** COMPONENT 
/**
 * AddToCartButton component allows users to select a quantity and add a product to the cart.
 * Shows a toast notification on successful add.
 *
 * @component
 * @param {{ product: Product }} props - The product to add to cart
 * @returns {JSX.Element} The rendered add-to-cart button UI
 */
function AddToCartButton({ product }: { product: Product }) {
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

// *************** EXPORT COMPONENT ***************
export { AddToCartButton };
