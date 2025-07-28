"use client";
import React, { useState } from 'react';
import { ArrowLeft, Upload, X, ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
// Types matching Prisma schema
type ProductFormData = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  showcaseId: string;
};

type ProductImage = {
  id: number;
  file: File;
  url: string | ArrayBuffer | null;
  isPrimary: boolean;
};

type FormErrors = {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
  images?: string;
};


// Categories from your Prisma schema
const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'FOOD', label: 'Food' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'HOME', label: 'Home' },
  { value: 'TOYS', label: 'Toys' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'BOOKS', label: 'Books' },
  { value: 'OTHER', label: 'Other' }
];


// Mock showcases - in real app, fetch from API
const mockShowcases = [
  { id: 1, name: "Summer Collection" },
  { id: 2, name: "Tech Gadgets" },
  { id: 3, name: "Casual Wear" },
  { id: 4, name: "Winter Collection" }
];




export default function AddProductPage() {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    showcaseId: ''
  });
  const [images, setImages] = useState<ProductImage[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch shop for logged-in user
    const fetchShop = async () => {
      if (user?.id) {
        const res = await fetch(`/api/shop?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.shop && data.shop.id) {
            setShopId(data.shop.id);
          } else {
            setShopId(null);
          }
        } else {
          setShopId(null);
        }
      }
    };
    fetchShop();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const newImage: ProductImage = {
            id: Date.now() + Math.random(),
            file: file,
            url: typeof ev.target?.result === 'string' ? ev.target.result : '',
            isPrimary: images.length === 0
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId: number) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (imageId: number) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    if (!shopId) {
      alert('No shop found for this user.');
      return;
    }
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append('shopId', String(shopId));
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('stock', formData.stock);
      form.append('category', formData.category);
      if (formData.showcaseId) {
        form.append('showcaseId', formData.showcaseId);
      }
      images.forEach(img => {
        form.append('images', img.file);
      });
      const res = await fetch('/api/product', {
        method: 'POST',
        body: form,
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || 'Error adding product. Please try again.');
      } else {
        alert('Product added successfully!');
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          showcaseId: ''
        });
        setImages([]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    // TODO: Implement navigation to seller dashboard
    console.log('Navigate back to dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Add New Product
            </h1>
            <p className="text-sm text-gray-600">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Main Form Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Product Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Product Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your product..."
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rp) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.stock}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Showcase */}
              <div>
                <label htmlFor="showcaseId" className="block text-sm font-medium text-gray-700 mb-1">
                  Showcase
                </label>
                <select
                  id="showcaseId"
                  name="showcaseId"
                  value={formData.showcaseId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">No showcase</option>
                  {mockShowcases.map(showcase => (
                    <option key={showcase.id} value={showcase.id}>
                      {showcase.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Images *</h3>
            
            {/* Upload Area */}
            <div className="mb-4">
              <label htmlFor="images" className="block">
                <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}>
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {errors.images && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.images}
                </p>
              )}
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={typeof image.url === 'string' ? image.url : ''}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="flex gap-1">
                        {!image.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(image.id)}
                            className="bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100"
                          >
                            Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {image.isPrimary && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <div className="text-center py-6">
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No images uploaded</p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}