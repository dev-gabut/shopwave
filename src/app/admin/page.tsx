'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
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
  
  if (user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-headline font-bold mb-8">Admin Panel</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>This is the central control panel for managing the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here you can manage users, products, orders, and system settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
