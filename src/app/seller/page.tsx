'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SellerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'seller')) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
        <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
        </div>
    )
  }
  
  if (user.role !== 'seller') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-headline font-bold mb-8">Seller Panel</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Seller!</CardTitle>
          <CardDescription>Manage your products and view your sales performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here you can add new products, update existing ones, and track your orders.</p>
        </CardContent>
      </Card>
    </div>
  );
}
