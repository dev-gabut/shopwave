export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  slug: string;
  price: number;
  images: string[];
  showcase?: string;
  relatedProducts: string[];
  shopName: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}
