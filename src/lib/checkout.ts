
// *************** IMPORT MODULE ***************
import { prisma } from './prisma';

/**
 * Retrieves the default address for a user.
 *
 * @async
 * @function GetUserDefaultAddress
 * @param {number} userId - The user's ID
 * @returns {Promise<object|null>} The default address object or null if not found
 */
async function GetUserDefaultAddress(userId: number) {
  return prisma.address.findFirst({
    where: { userId, isDefault: true },
  });
}

/**
 * Retrieves products for the given cart item IDs, including images and shop name.
 *
 * @async
 * @function GetCartProductsByIds
 * @param {number[]} ids - Array of product IDs in the cart
 * @returns {Promise<Array<{id:number,name:string,price:number,image:string,shopName:string}>>} Array of product objects for the cart
 */
async function GetCartProductsByIds(ids: number[]) {
  if (!ids.length) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: true, shop: true },
  });
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image: product.images[0]?.imageUrl || '',
    shopName: product.shop?.shopName || '',
  }));
}

// *************** EXPORT FUNCTIONS ***************
export { GetUserDefaultAddress, GetCartProductsByIds };
