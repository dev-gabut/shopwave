import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DBProduct } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: DBProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/${product.id}`} className="group block">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0 border-b">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="product image"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-lg font-headline font-semibold leading-tight">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">Shop: {product.shopName}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <p className="text-lg font-semibold text-primary">{formatPrice(product.price)}</p>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
