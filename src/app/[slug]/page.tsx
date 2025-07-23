import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug, getRelatedProducts, getProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { AddToCartButton } from './add-to-cart-button';

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Product not found' };
  }
  return {
    title: `${product.name} | ShopWave`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }
  
  const relatedProducts = await getRelatedProducts(product.id);

  return (
    <div className="space-y-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="md:col-span-1">
          <div className="aspect-square relative w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint="product image"
              priority
            />
          </div>
          {/* Add gallery for multiple images if needed */}
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline">{product.name}</h1>
            <p className="text-muted-foreground text-lg">{product.category}</p>
          </div>
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          <Separator />
          <p className="text-foreground/80 leading-relaxed">{product.description}</p>
          <AddToCartButton product={product} />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-semibold mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
