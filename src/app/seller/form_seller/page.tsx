'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const shopSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  description: z.string().min(1, 'Description is required'),
  image: z
    .instanceof(FileList)
    .optional()
    .or(z.null()),
});

type ShopFormData = z.infer<typeof shopSchema>;

export default function SellerPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: { shopName: '', description: '', image: undefined },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const defaultAddress =
    user && user.addresses
      ? user.addresses.find((a: { isDefault: boolean }) => a.isDefault)
      : undefined;

  const onSubmit = async (data: ShopFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('shopName', data.shopName);
      formData.append('description', data.description);
      formData.append('userId', String(user?.id ?? ''));
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }

      const res = await fetch('/api/shop', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create shop');
      }

      await refreshUser?.();
      router.push('/seller');
    } catch (err) {
      // Optionally show error to user
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
    form.setValue('image', event.target.files);
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (user.role === 'seller') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-headline font-bold mb-8">Seller Panel</h1>
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Seller!</CardTitle>
            <CardDescription>
              Manage your products and view your sales performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Here you can add new products, update existing ones, and track
              your orders.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Become a Seller</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Your Shop</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Shop Image Avatar */}
              <div className="flex justify-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center relative group"
                >
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Shop"
                      className="object-cover w-full h-full"
                      width={128}
                      height={128}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm text-center">
                      Upload Image
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Shop Name */}
              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter shop name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shop Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter shop description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shop Address */}
              <div>
                <FormLabel>Shop Address</FormLabel>
                <div className="p-2 border rounded bg-muted">
                  {defaultAddress
                    ? `${defaultAddress.label}, ${defaultAddress.address}, ${defaultAddress.city}, ${defaultAddress.province}, ${defaultAddress.postalCode}`
                    : 'No default address found.'}
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Shop...' : 'Create Shop'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}