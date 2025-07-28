// lib/models/showcase.ts
import { prisma } from '@/lib/prisma';

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

  return showcases.map(showcase => ({
    id: showcase.id,
    name: showcase.name,
    productCount: showcase._count.products
  }));
}