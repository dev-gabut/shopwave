import {
  Plus,
  Store,
  Folder,
  Tag,
  Pencil,
  Trash2,
  EllipsisVertical,
} from 'lucide-react';
import AddShowcaseInlineForm from './AddShowcaseInlineForm';
import { ShowcaseDeleteButton } from '@/app/seller/ShowcaseDeleteButton';
import { getShopByUserId } from '@/models/shop';
import { getProductsByShopId } from '@/models/product';
import {
  getShowcasesByShopId,
  getAllShowcasesByShopId,
} from '@/models/showcase';
import { Product } from '@/lib/types';
import { redirect } from 'next/navigation';
import { deleteProduct } from '@/models/product';
import { revalidatePath } from 'next/cache';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Showcase = { id: number; name: string; productCount?: number };

// StatCard component
function StatCard({
  title,
  count,
  bgColor = 'bg-gray-200',
}: {
  title: string;
  count: number;
  bgColor?: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-4 text-center`}>
      <div className="text-xs font-medium text-gray-700 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{count}</div>
    </div>
  );
}

// Server action for deleting a product
async function deleteProductAction(formData: FormData) {
  'use server';
  const id = Number(formData.get('productId'));
  if (!id) return;
  await deleteProduct(id);
  revalidatePath('/seller');
}

// ProductCard component
function ProductCard({ product }: { product: Product }) {
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
          href="{/seller/edit_product/${product.id}}"
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

const CATEGORIES = [
  'ELECTRONICS',
  'FASHION',
  'FOOD',
  'BEAUTY',
  'HOME',
  'TOYS',
  'SPORTS',
  'BOOKS',
  'OTHER',
] as const;

import { cookies, headers } from 'next/headers';

export default async function SellerDashboard() {
  // Get userId from request headers (set by middleware)
  const headersList = await headers();
  const userIdHeader = headersList.get('x-user-id');
  const userId = userIdHeader ? Number(userIdHeader) : null;
  if (!userId || isNaN(userId)) {
    // Not authenticated, redirect to login
    redirect('/login');
  }

  // Fetch shop data
  const shop = await getShopByUserId(userId);
  if (!shop) {
    // Optionally, redirect to create shop page
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-2">Shop not found</h2>
          <p className="mb-4">You need to create a shop first.</p>
          <a
            href="/seller/create-shop"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create Shop
          </a>
        </div>
      </div>
    );
  }
  const productsRaw = await getProductsByShopId(shop.id);
  // Fetch all showcases for the shop, not just those with products
  const showcases = await getAllShowcasesByShopId(shop.id);
  // Map products to match Product interface (id: string, showcase: string | undefined)
  const products: Product[] = productsRaw.map((p: any) => {
    const showcaseObj = p.showcase as { name?: string } | null | undefined;
    return {
      ...p,
      id: String(p.id),
      showcase:
        showcaseObj && typeof showcaseObj.name === 'string'
          ? showcaseObj.name
          : undefined,
      stock: p.stock || 0,
      category: p.category || 'OTHER',
    };
  });
  // Dummy stats for now
  const stats = {
    newOrders: 5,
    paidOrders: 3,
    shippedOrders: 6,
    failedOrders: 2,
    newReviews: 0,
  };
  // Render seller dashboard (no client handlers, no state)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Shop Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            {shop.imageUrl ? (
              <img
                src={shop.imageUrl}
                alt="Shop"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="text-gray-600 text-xs text-center">
                <Store className="w-6 h-6 mx-auto mb-1" />
                <div className="text-[10px]">Shop Photo</div>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {shop.shopName || 'Your Shop'}
            </h1>
            <p className="text-gray-600">
              {shop.description || 'Shop description'}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <StatCard title="New Order" count={stats.newOrders} />
          <StatCard title="Order Paid" count={stats.paidOrders} />
          <StatCard title="Order Send" count={stats.shippedOrders} />
          <StatCard title="Order Failed" count={stats.failedOrders} />
        </div>

        <div className="grid grid-cols-1 gap-3 mb-8">
          <StatCard
            title="New Review"
            count={stats.newReviews}
            bgColor="bg-gray-200"
          />
        </div>

        {/* Shop Statistics Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Your shop statistic
          </h2>
          <p className="text-gray-600 mb-4">from 18 July - 25 July</p>
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-lg font-medium">Chart Placeholder</div>
              <div className="text-sm">Sales statistics will appear here</div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="space-y-4">
              {/* Showcases Section with Add Showcase and All Products */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Showcase
                  </h4>
                  {/* Client-side Add Showcase form */}
                  <AddShowcaseInlineForm shopId={shop.id} />
                </div>
                <div className="space-y-1">
                  {/* All Products as first item */}
                  <a
                    href="/seller"
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    <Store className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium flex-1">
                      All Products
                    </span>
                    <span className="text-xs text-gray-500">
                      ({products.length})
                    </span>
                  </a>
                  {/* Separator line */}
                  {showcases.length > 0 && (
                    <div className="border-t border-gray-200 my-2"></div>
                  )}
                  {/* Showcase items */}
                  {showcases.length === 0 ? (
                    <div className="text-center py-4 border-t border-gray-200 mt-3">
                      <Folder className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-3">
                        No showcases yet
                      </p>
                    </div>
                  ) : (
                    showcases.map((showcase) => (
                      <div
                        key={showcase.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Folder className="w-4 h-4 text-gray-500" />

                        <span className="text-sm font-medium flex-1">
                          {showcase.name}
                        </span>

                        <span className="text-xs text-gray-500">
                          ({showcase.productCount ?? 0})
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-gray-200">
                              <EllipsisVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <ShowcaseDeleteButton showcaseId={showcase.id} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Categories Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Product Categories
                </h4>
                <div className="space-y-1">
                  {CATEGORIES.map((category) => {
                    const count = products.filter(
                      (p) => p.category === category
                    ).length;
                    return (
                      <a
                        key={category}
                        href="/seller?category=${encodeURIComponent(category)}"
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100"
                      >
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium flex-1 capitalize">
                          {category.toLowerCase()}
                        </span>
                        <span className="text-xs text-gray-500">({count})</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Products Area */}
          <div className="col-span-9">
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
                  <ProductCard key={product.id} product={product} />
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
          </div>
        </div>
      </div>
    </div>
  );
}
