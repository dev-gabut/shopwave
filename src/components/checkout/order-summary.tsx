'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { formatPrice } from '@/lib/client-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2 } from 'lucide-react';

export function OrderSummary() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
            <div className="flex-grow">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
