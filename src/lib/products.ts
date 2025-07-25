
import type { Product } from './types';

const products: Product[] = [
  {
    id: '1',
    name: 'Classic Leather Tote',
    slug: 'classic-leather-tote',
    description: 'A timeless tote crafted from genuine leather. Spacious enough for your essentials, with a sleek design that complements any outfit. Features an interior zip pocket and a magnetic closure.',
    price: 189.99,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    category: 'Handbags',
    relatedProducts: ['2', '8'],
  },
  {
    id: '2',
    name: 'Modern Aviator Sunglasses',
    slug: 'modern-aviator-sunglasses',
    description: 'Protect your eyes in style with these modern aviator sunglasses. Featuring a lightweight metal frame and polarized lenses, they offer 100% UV protection and a comfortable fit.',
    price: 75.0,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    category: 'Accessories',
    relatedProducts: ['5', '6'],
  },
  {
    id: '3',
    name: 'Silk Blend Scarf',
    slug: 'silk-blend-scarf',
    description: 'Add a touch of elegance to your look with this luxurious silk blend scarf. The soft, lightweight fabric features a vibrant, artistic print, making it a versatile accessory for any season.',
    price: 49.5,
    images: ['https://placehold.co/600x600.png'],
    category: 'Accessories',
    relatedProducts: ['1', '7'],
  },
  {
    id: '4',
    name: 'Chronograph Watch',
    slug: 'chronograph-watch',
    description: 'A sophisticated chronograph watch with a stainless steel case and a genuine leather strap. Water-resistant and featuring a date display, it\'s the perfect blend of function and style.',
    price: 250.0,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    category: 'Watches',
    relatedProducts: ['2', '6'],
  },
  {
    id: '5',
    name: 'Minimalist Canvas Backpack',
    slug: 'minimalist-canvas-backpack',
    description: 'A durable and stylish canvas backpack designed for daily use. With a padded laptop sleeve and multiple compartments, it keeps your belongings organized and secure on the go.',
    price: 89.99,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    category: 'Bags',
    relatedProducts: ['1', '8'],
  },
  {
    id: '6',
    name: 'Suede Ankle Boots',
    slug: 'suede-ankle-boots',
    description: 'Step out in style with these chic suede ankle boots. A comfortable block heel and cushioned insole make them perfect for all-day wear, while the side zipper allows for easy on and off.',
    price: 120.0,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    category: 'Shoes',
    relatedProducts: ['3', '7'],
  },
  {
    id: '7',
    name: 'Denim Trucker Jacket',
    slug: 'denim-trucker-jacket',
    description: 'A timeless denim jacket that belongs in every wardrobe. Made from premium, non-stretch denim, it features a classic fit and button-front closure. Perfect for layering over any outfit.',
    price: 98.0,
    images: ['https://placehold.co/600x600.png'],
    category: 'Apparel',
    relatedProducts: ['3', '6'],
  },
  {
    id: '8',
    name: 'Cashmere Crewneck Sweater',
    slug: 'cashmere-crewneck-sweater',
    description: 'Indulge in the unparalleled softness of our 100% cashmere crewneck sweater. This versatile piece is lightweight yet warm, making it an essential layer for cooler weather.',
    price: 150.0,
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'],
    category: 'Apparel',
    relatedProducts: ['1', '4'],
  },
];

export async function getProducts(query?: string): Promise<Product[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  if (query) {
    const lowerCaseQuery = query.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(lowerCaseQuery) || p.description.toLowerCase().includes(lowerCaseQuery));
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const product = products.find((p) => p.slug === slug);
  return product || null;
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    const related = products.filter(p => product.relatedProducts.includes(p.id));
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return related;
}
