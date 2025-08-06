import { Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/lib/types';
import { deleteProduct } from '@/models/product';
import { revalidatePath } from 'next/cache';

// Server action for deleting a product
async function deleteProductAction(formData: FormData) {
  'use server';
  const id = Number(formData.get('productId'));
  if (!id) return;
  await deleteProduct(id);
  revalidatePath('/seller');
}

interface SellerProductCardProps {
  product: Product;
}

export function SellerProductCard({ product }: SellerProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
      <div className="aspect-square bg-gray-200 flex items-center justify-center">
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-6xl font-light mb-2">600 × 600</div>
          </div>
        )}
      </div>
      <div className="p-4 pb-10">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600">Stock: {product.stock}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
        <p className="text-blue-600 font-semibold">
          Rp {Number(product.price).toLocaleString('id-ID')}
        </p>
      </div>
      {/* Edit and Delete Buttons */}
      <div className="absolute bottom-2 right-2 flex gap-2 z-10">
        <a
          href={`/seller/edit_product/${product.id}`}
          className="bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4 text-gray-600" />
        </a>
        <form action={deleteProductAction}>
          <input type="hidden" name="productId" value={product.id} />
          <button
            type="submit"
            className="bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </form>
      </div>
    </div>
  );
}
