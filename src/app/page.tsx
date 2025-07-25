


// *************** IMPORT MODULE ***************
import { getProducts } from '@/models/product';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Product } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// *************** COMPONENT ***************
/**
 * Home page component displays a carousel and featured products.
 * Fetches products from the database and renders product cards and carousel items.
 *
 * @async
 * @function Home
 * @returns {Promise<JSX.Element>} The rendered home page
 */
export default async function Home() {
  const products: Product[] = await getProducts();
  return (
    <div className="space-y-12">
      <section>
        <Carousel
          className="w-full"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {products.slice(0, 5).map((product: Product) => (
              <CarouselItem key={product.id}>
                <div className="p-1">
                  <Link href={`/${product.id}`}>
                    <Card className="overflow-hidden">
                      <div className="relative aspect-[2/1] w-full">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          data-ai-hint="product image"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                          <h2 className="text-3xl md:text-5xl font-headline font-bold">{product.name}</h2>
                          <p className="text-lg mt-2 hidden md:block max-w-lg">{product.description}</p>
                          {product.showcase && (
                            <span className="text-sm font-semibold bg-white/20 rounded px-2 py-1 mr-2">{product.showcase}</span>
                          )}
                          <Button size="lg" className="mt-4">Shop Now</Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </section>

      <section>
        <h2 className="text-3xl font-headline font-semibold mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {products.slice(0, 4).map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
