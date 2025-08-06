import { Tag } from 'lucide-react';
import { Product } from '@/lib/types';

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

interface CategoriesSectionProps {
  products: Product[];
}

export function CategoriesSection({ products }: CategoriesSectionProps) {
  return (
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
              href={`/seller?category=${encodeURIComponent(category)}`}
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
  );
}
