
// *************** IMPORT LIBRARY ***************
import { notFound } from 'next/navigation';
import Image from 'next/image';

// *************** IMPORT MODULE ***************
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { AddToCartButton } from './add-to-cart-button';
import type { Metadata } from 'next';
import { getProductById, getProductBySlug, getProducts, getRelatedProducts } from '@/models/product';
import { Product } from '@/lib/types';


// *************** TYPE 
type ProductPageProps = {
  params:  Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};


/**
 * Generates static params for product pages based on product ids.
 *
 * @async
 * @function generateStaticParams
 * @returns {Promise<Array<{id: string}>>} Array of params objects for static generation
 */
export async function generateStaticParams() {
	const products = await getProducts();
	return products.map((product) => ({
		id: product.id,
	}));
}


/**
 * Generates metadata for a product page based on the product id.
 *
 * @async
 * @function generateMetadata
 * @param {ProductPageProps} props - The route params containing the product id
 * @returns {Promise<{title: string, description: string}>} Metadata for the page
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const product = await getProductBySlug((await params).id);
	if (!product) {
		return { title: 'Product not found' };
	}
	return {
		title: `${product.name} | ShopWave`,
		description: product.description,
	};
}

// *************** COMPONENT ***************
/**
 * ProductPage component displays a product's details and related products.
 * Fetches product and related products by id, and normalizes for AddToCartButton.
 *
 * @async
 * @function ProductPage
 * @param {ProductPageProps} props - The route params containing the product id
 * @returns {Promise<JSX.Element>} The rendered product page
 */
async function ProductPage({ params }: ProductPageProps) {
  const product: Product | null = await getProductById((await params).id);
  if (!product) {
    notFound();
  }
  const relatedProducts: Product[] = await getRelatedProducts(product.id);

  // *************** Map DBProduct to Product for AddToCartButton
  const productForCart = {
    id: String(product.id),
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    showcase: product.showcase ?? '',
    category: product.showcase ?? '',
    relatedProducts: [],
    shopName: product.shopName,
    slug: product.slug,
  };

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
        </div>
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline">{product.name}</h1>
            <p className="text-muted-foreground text-lg">{product.showcase}</p>
            <p className="text-sm text-muted-foreground">Shop: {product.shopName}</p>
          </div>
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          <Separator />
          <p className="text-foreground/80 leading-relaxed">{product.description}</p>
          <AddToCartButton product={productForCart} />
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

// *************** EXPORT COMPONENT ***************
export default ProductPage;
