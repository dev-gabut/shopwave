'use client';
import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';

export type ProductImage = {
  id: string;
  file: File;
  url: string | ArrayBuffer | null;
  isPrimary: boolean;
};

export type ProductImageUploadProps = {
  images: ProductImage[];
  setImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
  errors?: string;
  setPrimaryImage: (imageId: string) => void;
  removeImage: (imageId: string) => void;
};

export default function ProductImageUpload({
  images,
  setImages,
  errors,
  setPrimaryImage,
  removeImage,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || isProcessing) return;

    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    setIsProcessing(true);

    const processFiles = async () => {
      const newImages: ProductImage[] = [];

      for (const file of files) {
        const image = await new Promise<ProductImage>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            resolve({
              id: String(Date.now() + Math.random()),
              file,
              url:
                typeof ev.target?.result === 'string' ? ev.target.result : '',
              isPrimary: false,
            });
          };
          reader.readAsDataURL(file);
        });
        newImages.push(image);
      }

      setImages((prevImages) => {
        const updatedImages = [...prevImages, ...newImages];
        if (prevImages.length === 0 && newImages.length > 0) {
          updatedImages[0].isPrimary = true;
        }
        return updatedImages;
      });

      // Reset input using DOM manipulation
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setIsProcessing(false);
    };

    processFiles();
  };

  const triggerFileInput = () => {
    if (isProcessing) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Product Images *
      </h3>
      {/* Upload Area */}
      <div className="mb-4">
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            errors
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={triggerFileInput}
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600">
            {isProcessing ? 'Processing images...' : 'Click to upload images'}
          </p>
          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
        </div>
        <input
          type="file"
          id="images"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          ref={fileInputRef}
        />
        {errors && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors}
          </p>
        )}
      </div>
      {/* Image Preview */}
      {images.length > 0 ? (
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
      ) : (
        <div className="text-center py-6">
          <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No images uploaded</p>
        </div>
      )}
    </div>
  );
}
