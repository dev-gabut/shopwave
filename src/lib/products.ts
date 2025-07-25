

import { prisma } from './prisma';

export type DBProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  showcase: string | null;
  shopName: string;
};

/**
 * Retrieves products from the database, optionally filtered by a search query.
 *
 * @async
 * @function GetProducts
 * @param {string} [query] - Optional search query to filter products by name or description
 * @returns {Promise<DBProduct[]>} Array of product objects
 */
async function GetProducts(query?: string): Promise<DBProduct[]> {
  const { QueryMode } = require('@prisma/client');
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: QueryMode.insensitive } },
          { description: { contains: query, mode: QueryMode.insensitive } },
        ],
      }
    : undefined;
  const products = await prisma.product.findMany({
    where,
    include: {
      images: true,
      showcase: true,
      shop: true,
    },
    orderBy: { id: 'asc' },
  });
  return products.map((product: any) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    images: product.images?.map((image: any) => image.imageUrl) || [],
    showcase: product.showcase?.name ?? null,
    shopName: product.shop?.shopName ?? '',
  }));
}


/**
 * Retrieves related products by category, excluding the current product.
 *
 * @async
 * @function getRelatedProducts
 * @param {number} productId - The current product's id
 * @returns {Promise<DBProduct[]>} Array of related product objects
 */
async function getRelatedProducts(productId: number): Promise<DBProduct[]> {
  const product: any = await prisma.product.findUnique({
    where: { id: productId },
    include: { showcase: true },
  });
  if (!product || !product.showcaseId) return [];
  const related = await prisma.product.findMany({
    where: {
      showcaseId: product.showcaseId,
      NOT: { id: productId },
    },
    include: {
      images: true,
      showcase: true,
      shop: true,
    },
    take: 4,
  });
  return related.map((product: any) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    images: product.images?.map((image: any) => image.imageUrl) || [],
    showcase: product.showcase?.name ?? null,
    shopName: product.shop?.shopName ?? '',
  }));
}

/**
 * Retrieves a product by its id.
 *
 * @async
 * @function getProductById
 * @param {string|number} id - The product id
 * @returns {Promise<DBProduct | undefined>} The product object or undefined if not found
 */
async function getProductById(id: string | number): Promise<DBProduct | undefined> {
  const productId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(productId)) return undefined;
  const product: any = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      showcase: true,
      shop: true,
    },
  });
  if (!product) return undefined;
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    images: product.images?.map((image: any) => image.imageUrl) || [],
    showcase: product.showcase?.name ?? null,
    shopName: product.shop?.shopName ?? '',
  };
}
// *************** EXPORT FUNCTIONS ***************
export { GetProducts, getProductById, getRelatedProducts };