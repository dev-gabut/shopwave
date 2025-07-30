'use client';

import { useEffect, useState } from 'react';
import { Plus, Store, Folder, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getShopByUserId } from '@/models/shop';
import { getProductsByShopId } from '@/models/product';

// Define Product type with showcase property
type Showcase = { id: number; name: string; productCount?: number };
type Product = {
  id: number;
  name: string;
  images: string[];
  stock: number;
  category: string;
  price: number;
  showcase?: Showcase | null;
};
import { getShowcasesByShopId } from '@/models/showcase';

// StatCard component
const StatCard = ({ title, count, bgColor = "bg-gray-200" }: { 
  title: string; 
  count: number; 
  bgColor?: string 
}) => (
  <div className={`${bgColor} rounded-lg p-4 text-center`}>
    <div className="text-xs font-medium text-gray-700 mb-1">{title}</div>
    <div className="text-2xl font-bold text-gray-900">{count}</div>
  </div>
);

// ProductCard component
const ProductCard = ({ product }: { product: Product }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">Stock: {product.stock}</span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          {product.category}
        </span>
      </div>
      <p className="text-blue-600 font-semibold">Rp {Number(product.price).toLocaleString('id-ID')}</p>
    </div>
  </div>
);

// Categories from your Prisma schema
const CATEGORIES = [
  'ELECTRONICS',
  'FASHION',
  'FOOD',
  'BEAUTY',
  'HOME',
  'TOYS',
  'SPORTS',
  'BOOKS',
  'OTHER'
] as const;

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // State variables
  type Shop = {
    id: number;
    shopName: string;
    description?: string;
    imageUrl?: string | null;
    // add other fields as needed
  };
  const [shopData, setShopData] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'category' | 'showcase'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Use a proper type for showcase, assuming showcase has at least id and name
  type Showcase = { id: number; name: string; productCount?: number };
  const [selectedShowcase, setSelectedShowcase] = useState<Showcase | null>(null);
  
  // Dummy stats for now
  const [stats] = useState({
    newOrders: 5,
    paidOrders: 3,
    shippedOrders: 6,
    failedOrders: 2,
    newReviews: 0
  });

  // Load shop data
  useEffect(() => {
    if (!user) return;
    
    const loadShopData = async () => {
      try {
        setIsLoading(true);
        
        // Get shop by user ID
        const shop = await getShopByUserId(Number(user.id));
        if (shop) {
          setShopData(shop);
          
          // Get products by shop ID
          const productsRaw = await getProductsByShopId(shop.id);
          const products = productsRaw.map(p => ({
            ...p,
            id: typeof p.id === 'string' ? Number(p.id) : p.id,
            showcase: p.showcase && typeof p.showcase === 'object' && 'id' in p.showcase
              ? ((p.showcase as Showcase).name
                  ? { 
                      id: Number((p.showcase as Showcase).id), 
                      name: String((p.showcase as Showcase).name), 
                      productCount: (p.showcase as Showcase).productCount 
                    }
                  : null)
              : null,
            stock: typeof p.stock === 'number' ? p.stock : 0, // Ensure stock is always a number
            category: typeof p.category === 'string' ? p.category : 'OTHER' // Ensure category is always a string
          }));
          setProducts(products);
          
          // Get showcases by shop ID
          const showcases = await getShowcasesByShopId(shop.id);
          setShowcases(showcases);
        }
      } catch (error) {
        toast({
          title: 'Error loading shop',
          description: 'Could not load your shop data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadShopData();
  }, [user, toast]);

  // Filter products based on current selection
  const filteredProducts = () => {
    if (filterType === 'category' && selectedCategory) {
      return products.filter(product => product.category === selectedCategory);
    } else if (filterType === 'showcase' && selectedShowcase) {
      return products.filter(product => 
        product.showcase && product.showcase.id === selectedShowcase.id
      );
    }
    return products;
  };

  // Select category handler
  const selectCategory = (category: string) => {
    setFilterType('category');
    setSelectedCategory(category);
    setSelectedShowcase(null);
  };

  // Select showcase handler
  const selectShowcase = (showcase: Showcase) => {
    setFilterType('showcase');
    setSelectedShowcase(showcase);
    setSelectedCategory(null);
  };

  // Show all products handler
  const showAllProducts = () => {
    setFilterType('all');
    setSelectedCategory(null);
    setSelectedShowcase(null);
  };

  // Get filter title
  const getFilterTitle = () => {
    if (filterType === 'category' && selectedCategory) {
      return `${selectedCategory} Products`;
    } else if (filterType === 'showcase' && selectedShowcase) {
      return selectedShowcase.name;
    }
    return 'All Products';
  };

  // Get product count for a category
  const getCategoryProductCount = (category: string) => {
    return products.filter(p => p.category === category).length;
  };

  // Handle add product
  const handleAddProduct = () => {
    router.push('/seller/add_product');
  };

  // Handle add showcase
  const handleAddShowcase = () => {
    router.push('/seller/showcases/new');
  };

  // Loading state
  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Render seller dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Shop Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            {shopData?.imageUrl ? (
              <img 
                src={shopData.imageUrl} 
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
              {shopData?.shopName || "Your Shop"}
            </h1>
            <p className="text-gray-600">{shopData?.description || "Shop description"}</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your shop statistic</h2>
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
              {/* Combined Showcases Section with All Products */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Your Showcases</h4>
                  <button
                    onClick={handleAddShowcase}
                    className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                    title="Add Showcase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {/* All Products as first item */}
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      filterType === 'all'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={showAllProducts}
                  >
                    <Store className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium flex-1">All Products</span>
                    <span className="text-xs text-gray-500">({products.length})</span>
                  </div>

                  {/* Separator line */}
                  {showcases.length > 0 && (
                    <div className="border-t border-gray-200 my-2"></div>
                  )}

                  {/* Showcase items */}
                  {showcases.map(showcase => (
                    <div
                      key={showcase.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedShowcase?.id === showcase.id
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => selectShowcase(showcase)}
                    >
                      <Folder className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium flex-1">{showcase.name}</span>
                      <span className="text-xs text-gray-500">({showcase.productCount})</span>
                    </div>
                  ))}
                </div>

                {showcases.length === 0 && (
                  <div className="text-center py-4 border-t border-gray-200 mt-3">
                    <Folder className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-3">No showcases yet</p>
                    <button
                      onClick={handleAddShowcase}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1 mx-auto"
                    >
                      <Plus className="w-3 h-3" />
                      Add Showcase
                    </button>
                  </div>
                )}
              </div>

              {/* Categories Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Product Categories</h4>
                <div className="space-y-1">
                  {CATEGORIES.map(category => {
                    const count = getCategoryProductCount(category);
                    return (
                      <div
                        key={category}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedCategory === category
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => selectCategory(category)}
                      >
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium flex-1 capitalize">
                          {category.toLowerCase()}
                        </span>
                        <span className="text-xs text-gray-500">({count})</span>
                      </div>
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
                    {getFilterTitle()}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {filteredProducts().length} product{filteredProducts().length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={handleAddProduct}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {filteredProducts().map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                  />
                ))}
              </div>
              
              {filteredProducts().length === 0 && (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filterType === 'category' && selectedCategory 
                      ? `No products in ${selectedCategory} category yet`
                      : filterType === 'showcase' && selectedShowcase
                      ? `No products in ${selectedShowcase?.name} showcase yet`
                      : 'Start selling by adding your first product'
                    }
                  </p>
                  <button
                    onClick={handleAddProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}