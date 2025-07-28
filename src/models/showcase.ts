import { prisma } from '@/lib/prisma';

// Define type for showcase with product count
type ShowcaseWithCount = {
  id: number;
  name: string;
  _count: {
    products: number;
  };
};

export async function getShowcasesByShopId(shopId: number) {
  // Get distinct showcases that have products belonging to this shop
  const showcases = await prisma.showcase.findMany({
    where: {
      products: {
        some: {
          shopId: shopId
        }
      }
    },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  // Add explicit type to showcase parameter
  return showcases.map((showcase: ShowcaseWithCount) => ({
    id: showcase.id,
    name: showcase.name,
    productCount: showcase._count.products
  }));
}