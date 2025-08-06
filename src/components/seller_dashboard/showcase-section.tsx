import { Store, Folder } from 'lucide-react';
import AddShowcaseInlineForm from '@/app/seller/AddShowcaseInlineForm';
import {
  ShowcaseDeleteButton,
  ShowcaseEditButton,
} from '@/app/seller/ShowcaseDeleteButton';

type Showcase = { id: string; name: string; productCount?: number };

interface ShowcaseSectionProps {
  showcases: Showcase[];
  shopId: string;
  productsLength: number;
}

export function ShowcaseSection({
  showcases,
  shopId,
  productsLength,
}: ShowcaseSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Showcase</h4>
        {/* Client-side Add Showcase form */}
        <AddShowcaseInlineForm shopId={shopId} />
      </div>
      <div className="space-y-1">
        {/* All Products as first item */}
        <a
          href="/seller"
          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors bg-blue-100 text-blue-800 border border-blue-200"
        >
          <Store className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium flex-1">All Products</span>
          <span className="text-xs text-gray-500">({productsLength})</span>
        </a>
        {/* Separator line */}
        {showcases.length > 0 && (
          <div className="border-t border-gray-200 my-2"></div>
        )}
        {/* Showcase items */}
        {showcases.length === 0 ? (
          <div className="text-center py-4 border-t border-gray-200 mt-3">
            <Folder className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-3">No showcases yet</p>
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
              <span>
                <ShowcaseEditButton
                  showcase={{
                    ...showcase,
                    parentId: showcase.id || null,
                  }}
                />
              </span>
              <span>
                <ShowcaseDeleteButton showcaseId={showcase.id} />
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
