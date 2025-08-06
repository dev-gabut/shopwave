import { Plus, Store } from 'lucide-react';
import { Product } from '@/lib/types';
import { SellerProductCard } from './seller-product-card';

interface ProductsAreaProps {
  products: Product[];
}

export function ProductsArea({ products }: ProductsAreaProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            All Products
          </h2>
          <p className="text-sm text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/seller/add_product"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </a>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product: Product) => (
          <SellerProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-4">
            Start selling by adding your first product
          </p>
        </div>
      )}
    </div>
  );
}
