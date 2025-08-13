import { prisma } from '@/lib/prisma';
import { ProductInterface } from '@/models/Product/product-interface';
import { ResourceService } from '@/models/resource-service';

const productInclude = {
	images: true,
	shop: true,
	showcase: true,
	reviews: true,
	_count: true,
	orderItems: true,
};

class ProductService implements ResourceService<ProductInterface> {
	private static instance: ProductService;

	private constructor() {}

	static getInstance(): ProductService {
		if (!ProductService.instance) {
			ProductService.instance = new ProductService();
		}
		return ProductService.instance;
	}

	async create(data: ProductInterface): Promise<ProductInterface> {
		if (!this.validate(data)) throw new Error('Invalid product data');
		return prisma.product.create({ data });
	}

	async getById(id: string) {
		return prisma.product.findUnique({ where: { id }, include: productInclude });
	}

	async getAll() {
		return prisma.product.findMany({ include: productInclude });
	}

	async update(id: string, data: Partial<ProductInterface>) {
		if (!this.validate(data)) throw new Error('Invalid product data');
		return prisma.product.update({ where: { id }, data });
	}

	async delete(id: string) {
		await prisma.product.delete({ where: { id } });
	}

	async search(query: string) {
		return prisma.product.findMany({
			where: {
				OR: [{ name: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }],
			},
			include: productInclude,
		});
	}

	async filterByFields(filters: Partial<Record<keyof ProductInterface, unknown>>) {
		const where: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(filters)) {
			if (value !== undefined) {
				where[key] = value;
			}
		}

		return prisma.product.findMany({
			where,
			include: productInclude,
		});
	}

	validate(data: Partial<ProductInterface>): boolean {
		// TODO
		return true;
	}
}

export const productServiceInstance = ProductService.getInstance();