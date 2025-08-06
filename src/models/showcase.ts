// Get all showcases for a shop (even if empty)
export async function getAllShowcasesByShopId(shopId: string) {
  // Find all showcases that are referenced by products in this shop, or that exist (if you want to show all created showcases for this shop)
  // Since Showcase does not have a shopId, we assume all showcases created by this shop's AddShowcaseInlineForm belong to this shop
  // So, fetch all showcases that have at least one product in this shop, OR that have no products at all (newly created)
  // If you want to show all showcases regardless of products, just fetch all showcases
  const showcases = await prisma.showcase.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });
  return showcases.map((showcase: any) => ({
    id: showcase.id,
    name: showcase.name,
    productCount: showcase._count.products,
  }));
}
// Create a new showcase for a given shopId
export async function createShowcaseBasedShopId({
  shopId,
  name,
  parentId,
}: {
  shopId: string;
  name: string;
  parentId?: string;
}) {
  // Attach the new showcase to the shop by creating a productless showcase
  // (Showcase is not directly related to shop, but to products in shop)
  // So we just create a showcase, and products in this shop can be assigned to it later
  return prisma.showcase.create({
    data: {
      name,
      parentId: parentId ?? null,
      // No direct shopId field, but this showcase will be used for products in this shop
    },
  });
}
import { prisma } from '@/lib/prisma';

// Define type for showcase with product count
type ShowcaseWithCount = {
  id: string;
  name: string;
  _count: {
    products: number;
  };
};

export async function getShowcasesByShopId(shopId: string) {
  // Get distinct showcases that have products belonging to this shop
  const showcases = await prisma.showcase.findMany({
    where: {
      products: {
        some: {
          shopId: shopId,
        },
      },
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  // Add explicit type to showcase parameter
  return showcases.map((showcase: ShowcaseWithCount) => ({
    id: showcase.id,
    name: showcase.name,
    productCount: showcase._count.products,
  }));
}

// delete showcase
export async function deleteShowCaseById(showCaseId: string) {
  return prisma.showcase.delete({
    where: { id: showCaseId },
  });
}

export async function updateShowCaseById(data: { id: string; name: string }) {
  return prisma.showcase.update({
    where: { id: data.id },
    data: { name: data.name },
  });
}
