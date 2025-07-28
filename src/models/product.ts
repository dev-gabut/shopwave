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

import { Prisma, Product as PrismaProduct, ProductImage, Shop, Showcase } from '@prisma/client';
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

// Define a type for Prisma product with relations
type ProductWithRelations = PrismaProduct & {
  images: ProductImage[];
  shop: Shop;
  showcase: Showcase | null;
};

// Helper function to map Prisma product to our Product type
function mapToProduct(p: ProductWithRelations): Product {
  const product: Product = {
    id: p.id.toString(),
    name: p.name,
    slug: '', // slug is empty
    description: p.description,
    price: Number(p.price),
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
  
  return (prismaProducts as ProductWithRelations[]).map(mapToProduct);
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
  
  const where: Prisma.ProductWhereInput | undefined = query ? {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  } : undefined;
  
  const prismaProducts = await prisma.product.findMany({
    where,
    include: { images: true, shop: true, showcase: true },
  });
  
  return (prismaProducts as ProductWithRelations[]).map(mapToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { images: true, shop: true, showcase: true },
  });
  
  return product ? mapToProduct(product as ProductWithRelations) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Fallback to name search since we don't have slug field
  const product = await prisma.product.findFirst({
    where: { name: slug },
    include: { images: true, shop: true, showcase: true },
  });
  
  return product ? mapToProduct(product as ProductWithRelations) : null;
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
  
  return (relatedProducts as ProductWithRelations[]).map(mapToProduct);
}