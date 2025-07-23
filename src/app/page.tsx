
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { ProductSearch } from '@/components/product-search';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getProducts();
      setProducts(allProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleSearch = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">Welcome to ShopWave</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover a curated collection of products that inspire and delight. Your next favorite thing is just a click away.
        </p>
        <div className="max-w-md mx-auto pt-4">
          <ProductSearch onSearchSubmit={handleSearch} />
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-headline font-semibold mb-8">Featured Products</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
