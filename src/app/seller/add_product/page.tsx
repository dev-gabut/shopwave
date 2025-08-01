import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllShowcasesByShopId } from '@/models/showcase';
import { getShopByUserId } from '@/models/shop';
import { ArrowLeft } from 'lucide-react';

import ImageUploadWrapper from '@/components/image-upload-wrapper';

// Removed server action and its imports
// Showcase type
type Showcase = {
  id: number;
  name: string;
  productCount: number;
};

// Categories from Prisma schema
const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'FOOD', label: 'Food' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'HOME', label: 'Home' },
  { value: 'TOYS', label: 'Toys' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'OTHER', label: 'Other' },
];

export default async function AddProductPage() {
  // Get userId from request headers (set by middleware)
  const headersList = await headers();
  const userIdHeader = headersList.get('x-user-id');
  const userId = userIdHeader ? Number(userIdHeader) : null;
  if (!userId || isNaN(userId)) {
    redirect('/login');
  }
  const shop = await getShopByUserId(userId);
  if (!shop) {
    redirect('/seller');
  }
  // Fetch all showcases for this shop (even if empty)
  const showcases: Showcase[] = await getAllShowcasesByShopId(shop.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <a
            href="/seller"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </a>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Add New Product
            </h1>
            <p className="text-sm text-gray-600">Fill in the details below</p>
          </div>
        </div>
        {/* Client wrapper for image upload state and handlers */}
        <ImageUploadWrapper
          showcases={showcases}
          categories={CATEGORIES}
          shopId={shop.id}
        />
      </div>
    </div>
  );
}
