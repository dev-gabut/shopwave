
// *************** IMPORT LIBRARY ***************
import { notFound } from 'next/navigation';
import Image from 'next/image';

// *************** IMPORT MODULE ***************
import { getProductById, getRelatedProducts, GetProducts, type DBProduct } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { AddToCartButton } from './add-to-cart-button';


// *************** TYPE 
type ProductPageProps = {
  params: {
    id: string;
  };
};


/**
 * Generates static params for product pages based on product ids.
 *
 * @async
 * @function GenerateStaticParams
 * @returns {Promise<Array<{id: string}>>} Array of params objects for static generation
 */
export async function GenerateStaticParams() {
  const products = await GetProducts();
  return products.map((product: DBProduct) => ({
    id: product.id.toString(),
  }));
}


/**
 * Generates metadata for a product page based on the product id.
 *
 * @async
 * @function GenerateMetadata
 * @param {ProductPageProps} props - The route params containing the product id
 * @returns {Promise<{title: string, description: string}>} Metadata for the page
 */
async function GenerateMetadata({ params }: ProductPageProps) {
  const product = await getProductById(params.id);
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
  const product: DBProduct | undefined = await getProductById(params.id);
  if (!product) {
    notFound();
  }
  const relatedProducts: DBProduct[] = await getRelatedProducts(product.id);

  // *************** Map DBProduct to Product for AddToCartButton
  const productForCart = {
    id: String(product.id),
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    category: product.category ?? '',
    relatedProducts: [],
    shopName: product.shopName,
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
            <p className="text-muted-foreground text-lg">{product.category}</p>
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

// *************** EXPORT FUNCTIONS ***************
export { GenerateMetadata };
