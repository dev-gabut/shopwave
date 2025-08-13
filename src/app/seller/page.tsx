import { cookies } from 'next/headers';
import { getShopByUserId } from '@/models/shop';
import { productServiceInstance } from '@/models/Product/product-service';
import {
  getShowcasesByShopId,
  getAllShowcasesByShopId,
} from '@/models/showcase';
import { Product } from '@/lib/types';
import { redirect } from 'next/navigation';

// Import components
import {
  StatCard,
  ShopHeader,
  StatisticsChart,
  ShowcaseSection,
  CategoriesSection,
  ProductsArea,
} from '@/components/seller_dashboard';

type Showcase = { id: string; name: string; productCount?: number };

export default async function SellerDashboard() {
  const cookieList = await cookies();
  const userIdHeader = cookieList.get('ShopWaveUserId')?.value;
  const userId = userIdHeader;
  if (!userId) {
    // Not authenticated, redirect to login
    redirect('/signin');
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
  const productsRaw = await productServiceInstance.filterByFields({ shopId: shop.id });
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

  // variable to make date dynamic
  const getLast7DaysRange = () => {
    const endDate = new Date(); // Hari ini
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
    };

    const formattedStart = startDate.toLocaleDateString('en-GB', options);
    const formattedEnd = endDate.toLocaleDateString('en-GB', options);

    return `from ${formattedStart} - ${formattedEnd}`;
  };

  // Render seller dashboard (no client handlers, no state)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Shop Header */}
        <ShopHeader shop={shop} />

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
        <StatisticsChart getLast7DaysRange={getLast7DaysRange} />

        {/* Main Content Area with Sidebar */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="space-y-4">
              {/* Showcases Section */}
              <ShowcaseSection
                showcases={showcases}
                shopId={shop.id}
                productsLength={products.length}
              />

              {/* Categories Section */}
              <CategoriesSection products={products} />
            </div>
          </div>

          {/* Products Area */}
          <div className="col-span-9">
            <ProductsArea products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
