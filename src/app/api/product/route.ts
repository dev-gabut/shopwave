import { createClient } from '@supabase/supabase-js';
import { createProduct } from '@/models/product';
import { Category } from '@prisma/client';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const VALID_CATEGORIES: Category[] = [
  'ELECTRONICS',
  'FASHION',
  'FOOD',
  'BEAUTY',
  'HOME',
  'TOYS',
  'SPORTS',
  'BOOKS',
  'OTHER',
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // Extract fields
    const shopId = Number(formData.get('shopId'));
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const category = String(formData.get('category'));
    const showcaseIdRaw = formData.get('showcaseId');
    let showcaseId: number | null = null;
    if (showcaseIdRaw !== null && showcaseIdRaw !== undefined && showcaseIdRaw !== '') {
      const parsed = Number(showcaseIdRaw);
      showcaseId = isNaN(parsed) ? null : parsed;
    }

    // Validate required fields
    if (!shopId || isNaN(shopId)) {
      return new Response(JSON.stringify({ error: 'Valid shopId is required' }), { status: 400 });
    }
    if (!name) {
      return new Response(JSON.stringify({ error: 'Product name is required' }), { status: 400 });
    }
    if (!description) {
      return new Response(JSON.stringify({ error: 'Product description is required' }), { status: 400 });
    }
    if (!price || isNaN(price) || price <= 0) {
      return new Response(JSON.stringify({ error: 'Valid price is required' }), { status: 400 });
    }
    if (isNaN(stock) || stock < 0) {
      return new Response(JSON.stringify({ error: 'Valid stock is required' }), { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category as Category)) {
      return new Response(JSON.stringify({ error: 'Valid category is required' }), { status: 400 });
    }

    // Handle image uploads
    const images: File[] = [];
    for (const entry of formData.entries()) {
      const [key, value] = entry;
      if (key === 'images' && value instanceof File && value.size > 0) {
        images.push(value);
      }
    }
    if (images.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one product image is required' }), { status: 400 });
    }

    const uploadedImages: { imageUrl: string; isPrimary: boolean }[] = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const fileName = `products/${Date.now()}_${i}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('bucketimage')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });
      if (error) {
        return new Response(JSON.stringify({ error: `Image upload failed: ${error.message}` }), { status: 500 });
      }
      if (data) {
        const publicUrlRes = supabase.storage.from('bucketimage').getPublicUrl(data.path);
        uploadedImages.push({
          imageUrl: publicUrlRes.data.publicUrl,
          isPrimary: i === 0,
        });
      }
    }

    if (uploadedImages.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid images were uploaded' }), { status: 400 });
    }

    // Save product to DB
    try {
      const product = await createProduct({
        shopId,
        name,
        description,
        price,
        stock,
        category: category as Category,
        showcaseId,
        images: uploadedImages,
      });
      return new Response(JSON.stringify({ product }), { status: 201 });
    } catch (error) {
      console.error('Product creation error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}