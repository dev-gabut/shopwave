// Category type matching Prisma enum
export type Category =
  | 'ELECTRONICS'
  | 'FASHION'
  | 'FOOD'
  | 'BEAUTY'
  | 'HOME'
  | 'TOYS'
  | 'SPORTS'
  | 'BOOKS'
  | 'OTHER';

import { prisma } from '@/lib/prisma';
import type { Product } from '../lib/types';
export type { Product } from '@/lib/types';

// Extend the Product type to include additional fields
declare module '../lib/types' {
  interface Product {
    showcase?: string;
    category?: string;
    stock?: number;
    showcaseId?: number | null;
  }
}

// Helper function to map Prisma product to our Product type
function mapToProduct(p: {
  id: number;
  name: string;
  description: string;
  price: number | { toString: () => string }; // Handle Decimal type
  images: { imageUrl: string }[];
  shop: { shopName: string };
  showcase?: { name: string } | null;
  category?: string;
  stock?: number;
  showcaseId?: number | null;
}): Product {
  // Convert price to number safely
  const priceValue = typeof p.price === 'number' 
    ? p.price 
    : Number(p.price.toString());

  const product: Product = {
    id: p.id.toString(),
    name: p.name,
    slug: '', // slug is empty
    description: p.description,
    price: priceValue,
    images: p.images.map(img => img.imageUrl),
    relatedProducts: [],
    shopName: p.shop.shopName,
  };

  // Add additional fields if needed
  if (p.showcase?.name) product.showcase = p.showcase.name;
  if (p.category) product.category = p.category;
  if (p.stock) product.stock = p.stock;
  if (p.showcaseId) product.showcaseId = p.showcaseId;

  return product;
}

// Get products by shopId
export async function getProductsByShopId(shopId: number): Promise<Product[]> {
  const prismaProducts = await prisma.product.findMany({
    where: { shopId },
    include: { images: true, shop: true, showcase: true },
  });
  
  return prismaProducts.map(mapToProduct);
}

export type CreateProductInput = {
  shopId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  showcaseId?: number | null;
  images: { imageUrl: string; isPrimary?: boolean }[];
};

export async function createProduct({
  shopId,
  name,
  description,
  price,
  stock,
  category,
  showcaseId,
  images
}: CreateProductInput) {
  // Validate shop exists
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw new Error('Shop not found');

  // Create product - use direct category assignment
  return prisma.product.create({
    data: {
      shopId,
      name,
      description,
      price,
      stock,
      category: category, // Directly use the enum value
      showcaseId: showcaseId ?? null,
      images: {
        create: images.map(img => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary || false,
        })),
      },
    },
    include: {
      images: true,
      shop: true,
      showcase: true,
    },
  });
}

export async function getProducts(query?: string): Promise<Product[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Fixed where clause with proper Prisma types
  const where = query ? {
    OR: [
      { 
        name: { 
          contains: query, 
          mode: 'insensitive' as const 
        } 
      },
      { 
        description: { 
          contains: query, 
          mode: 'insensitive' as const 
        } 
      },
    ],
  } : undefined;
  
  const prismaProducts = await prisma.product.findMany({
    where,
    include: { images: true, shop: true, showcase: true },
  });
  
  return prismaProducts.map(mapToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { images: true, shop: true, showcase: true },
  });
  
  return product ? mapToProduct(product) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Fallback to name search since we don't have slug field
  const product = await prisma.product.findFirst({
    where: { name: slug },
    include: { images: true, shop: true, showcase: true },
  });
  
  return product ? mapToProduct(product) : null;
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
    include: { images: true, shop: true, showcase: true },
  });
  
  if (!product) return [];
  
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
    },
    include: { images: true, shop: true, showcase: true },
  });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return relatedProducts.map(mapToProduct);
}