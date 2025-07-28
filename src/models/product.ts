import type { Category } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Product } from '../lib/types';
export type { Product } from '@/lib/types';

// Get products by shopId
export async function getProductsByShopId(shopId: number): Promise<Product[]> {
  const prismaProducts = await prisma.product.findMany({
	where: { shopId },
	include: { images: true, shop: true, showcase: true },
  });
return prismaProducts.map((p) => ({
	id: p.id?.toString() ?? '',
	name: p.name ?? '',
	slug: '', // slug is empty
	description: p.description ?? '',
	price: Number(p.price ?? 0),
	images: Array.isArray(p.images) ? p.images.map((img) => img.imageUrl) : [],
	relatedProducts: [],
	shopName: p.shop?.shopName ?? '',
	showcase: p.showcase?.name ?? '',
	category: p.category ?? '',
	stock: p.stock ?? 0,
	showcaseId: p.showcaseId ?? null,
}));
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

export async function createProduct({ shopId, name, description, price, stock, category, showcaseId, images }: {
  shopId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  showcaseId?: number | null;
  images: { imageUrl: string; isPrimary?: boolean }[];
}) {
  // Validate shop exists
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw new Error('Shop not found');

  // Create product
  const product = await prisma.product.create({
	data: {
	  shopId,
	  name,
	  description,
	  price,
	  stock,
	  category,
	  showcaseId: showcaseId ?? null,
	  images: {
		create: images.map((img) => ({
		  imageUrl: img.imageUrl,
		  isPrimary: !!img.isPrimary,
		})),
	  },
	},
	include: {
	  images: true,
	  shop: true,
	  showcase: true,
	},
  });
  return product;
}


export async function getProducts(query?: string): Promise<Product[]> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));
	const where = query
		? {
			OR: [
				{ name: { contains: query, mode: 'insensitive' as const } },
				{ description: { contains: query, mode: 'insensitive' as const } },
			],
		}
		: undefined;
	const prismaProducts = await prisma.product.findMany({
		where,
		include: { images: true, shop: true, showcase: true },
	});
	return prismaProducts.map((p) => ({
		id: p.id?.toString() ?? '',
		name: p.name ?? '',
		slug: (p as { slug?: string }).slug ?? '',
		description: p.description ?? '',
		price: Number(p.price ?? 0),
		images: Array.isArray(p.images) ? p.images.map((img) => img.imageUrl) : [],
		relatedProducts: [],
		shopName: p.shop?.shopName ?? '',
	}));
}

export async function getProductById(id: string): Promise<Product | null> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));
	const p = await prisma.product.findUnique({
		where: { id: Number(id) },
		include: { images: true, shop: true, showcase: true },
	});
	if (!p) return null;
	return {
		id: p.id?.toString() ?? '',
		name: p.name ?? '',
		slug: '', // slug property does not exist, set to empty string or handle appropriately
		description: p.description ?? '',
		price: Number(p.price ?? 0),
		images: Array.isArray(p.images) ? p.images.map((img) => img.imageUrl) : [],
		relatedProducts: [],
		shopName: p.shop?.shopName ?? '',
	};
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 500));
	// If 'slug' is not a valid field, fallback to name or id
	const p = await prisma.product.findFirst({
		where: { name: slug },
		include: { images: true, shop: true, showcase: true },
	});
	if (!p) return null;
	return {
		id: p.id?.toString() ?? '',
		name: p.name ?? '',
		slug: '', // slug is optional and not present in DB
		description: p.description ?? '',
		price: Number(p.price ?? 0),
		images: Array.isArray(p.images) ? p.images.map((img) => img.imageUrl) : [],
		relatedProducts: [],
		shopName: p.shop?.shopName ?? '',
	};
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
	const product = await prisma.product.findUnique({
		where: { id: Number(productId) },
		include: { images: true, shop: true, showcase: true },
	});
	if (!product) return [];
	const relatedPrisma = await prisma.product.findMany({
		where: {
			category: product.category,
			id: { not: product.id },
		},
		include: { images: true, shop: true, showcase: true },
	});
	await new Promise((resolve) => setTimeout(resolve, 500));
	return relatedPrisma.map((p) => ({
		id: p.id?.toString() ?? '',
		name: p.name ?? '',
		slug: (p as { slug?: string }).slug ?? '',
		description: p.description ?? '',
		price: Number(p.price ?? 0),
		images: Array.isArray(p.images) ? p.images.map((img) => img.imageUrl) : [],
		relatedProducts: [],
		shopName: p.shop?.shopName ?? '',
	}));
}
