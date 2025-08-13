export interface ResourceService<T> {
	create: (data: T) => Promise<T>;
	getById: (id: string) => Promise<T | null>;
	getAll: () => Promise<T[]>;
	update: (id: string, data: T) => Promise<T>;
	delete: (id: string) => Promise<void>;
	search: (query: string) => Promise<T[]>;
	filterByFields: (filters: Partial<Record<keyof T, unknown>>) => Promise<T[]>;
	validate: (data: T) => boolean;
}
