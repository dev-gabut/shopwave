import { Store } from 'lucide-react';

interface Shop {
  id: number;
  shopName: string;
  description: string;
  imageUrl?: string | null;
}

interface ShopHeaderProps {
  shop: Shop;
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  return (
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
  );
}
