'use client';
import React, { useState } from 'react';
import type { ProductImage } from '@/components/product-image-upload';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Showcase type must be passed as prop from server
export type Showcase = {
  id: string;
  name: string;
  productCount: number;
};

export type ImageUploadWrapperProps = {
  showcases: Showcase[];
  categories: { value: string; label: string }[];
  shopId: string;
};

const ProductImageUpload = dynamic(
  () => import('@/components/product-image-upload'),
  { ssr: false }
);

export default function ImageUploadWrapper({
  showcases,
  categories,
  shopId,
}: ImageUploadWrapperProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageError, setImageError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const setPrimaryImage = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === imageId }))
    );
  };
  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== imageId);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    form.append('shopId', String(shopId));
    images.forEach((img) => {
      if (img.file) {
        form.append('images', img.file);
      }
    });
    try {
      const res = await fetch('/api/product', {
        method: 'POST',
        body: form,
      });
      const result = await res.json();
      if (res.ok) {
        router.push('/seller');
      } else {
        alert(result.error || 'Failed to add product');
      }
    } catch (err) {
      alert('Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Product Image Upload (Client) */}
      <ProductImageUpload
        images={images}
        setImages={setImages}
        errors={imageError}
        setPrimaryImage={setPrimaryImage}
        removeImage={removeImage}
      />
      {/* Main Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              placeholder="Enter product name"
              required
            />
          </div>
          {/* Product Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              placeholder="Describe your product..."
              required
            />
          </div>
          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price (Rp) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              placeholder="0.00"
              required
            />
          </div>
          {/* Stock */}
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stock *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min="0"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              placeholder="0"
              required
            />
          </div>
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm border-gray-300"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          {/* Showcase */}
          <div>
            <label
              htmlFor="showcaseId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Showcase
            </label>
            <select
              id="showcaseId"
              name="showcaseId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">No showcase</option>
              {showcases.map((showcase: Showcase) => (
                <option key={showcase.id} value={showcase.id}>
                  {showcase.name} ({showcase.productCount} products)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <a
          href="/seller"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Cancel
        </a>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
        >
          Add Product
        </button>
      </div>
    </form>
  );
}
