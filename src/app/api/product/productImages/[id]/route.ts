import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/models/product';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    const { slug } = params;

    const result = slug == '*' ? await getProducts() : await getProducts(slug);

    return NextResponse.json(result);
}
