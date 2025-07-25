
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts } from '@/lib/products';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { ProductSearch } from '@/components/product-search';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const allProducts = await getProducts(searchTerm);
      setProducts(allProducts);
      setLoading(false);
    };
    fetchProducts();
  }, [searchTerm]);
  
  const handleSearchSubmit = (term: string) => {
      setSearchTerm(term);
      router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">Search Results</h1>
        <div className="max-w-xl">
          <ProductSearch onSearchSubmit={handleSearchSubmit} initialValue={initialQuery} />
        </div>
      </section>

      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              Found {products.length} result{products.length === 1 ? '' : 's'} for &quot;{searchTerm}&quot;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold">No Products Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search term.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    )
}
