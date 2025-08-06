import { prisma } from '@/lib/prisma';

export async function createShop({
  userId,
  shopName,
  description,
  imageUrl,
}: {
  userId: string;
  shopName: string;
  description: string;
  imageUrl: string;
}) {
  // Create shop and update user role
  const shop = await prisma.shop.create({
    data: {
      userId,
      shopName,
      description,
      imageUrl,
    },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'SELLER' },
  });
  return shop;
}

export async function getShopByUserId(userId: string) {
  return prisma.shop.findUnique({
    where: { userId },
  });
}

// Get shop by id
export async function getShopById(shopId: string) {
  return prisma.shop.findUnique({
    where: { id: shopId },
  });
}
