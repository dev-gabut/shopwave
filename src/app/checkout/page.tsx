'use client';

import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useUserAddresses } from '@/hooks/use-user-addresses';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/client-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { OrderSummary } from '@/components/checkout/order-summary';
import { AddressSelector } from '@/components/checkout/address-selector';
import { NewAddressForm } from '@/components/checkout/new-address-form';

const checkoutSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  addressId: z.number().optional(),
  newAddress: z.object({
    label: z.string().min(1, { message: 'Address label is required.' }),
    address: z.string().min(1, { message: 'Address is required.' }),
    city: z.string().min(1, { message: 'City is required.' }),
    province: z.string().min(1, { message: 'Province is required.' }),
    postalCode: z.string().min(5, { message: 'Postal code is required.' }),
    isDefault: z.boolean().default(false),
  }).optional(),
  useNewAddress: z.boolean().default(false),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { addresses = [], addAddress, loading: addressLoading } = useUserAddresses();
  const { cartItems = [], cartTotal = 0, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { 
      email: user?.email || '',
      addressId: addresses.find(addr => addr.isDefault)?.id || addresses[0]?.id || undefined,
      newAddress: {
        label: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        isDefault: addresses.length === 0 || false,
      },
      useNewAddress: addresses.length === 0 || false,
    },
  });

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin?redirect=/checkout');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setUseNewAddress(addresses.length === 0);
    if (user?.email) {
      form.setValue('email', user.email);
    }
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      form.setValue('addressId', defaultAddress.id);
    }
  }, [addresses, user, form]);

  // Function to create new address
  const handleCreateAddress = async () => {
    const newAddressData = form.getValues('newAddress');
    
    if (!newAddressData?.label || !newAddressData?.address || !newAddressData?.city || 
        !newAddressData?.province || !newAddressData?.postalCode) {
      toast({
        title: "Error",
        description: "Please fill in all address fields.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingAddress(true);
    
    try {
      const createAddressResponse = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddressData),
      });

      if (!createAddressResponse.ok) {
        const error = await createAddressResponse.json();
        throw new Error(error.error || 'Failed to create address');
      }

      const addressData = await createAddressResponse.json();
      addAddress(addressData);
      
      toast({
        title: "Address Created!",
        description: "New address has been added to your account.",
      });

      // Switch back to existing address mode and select the new address
      setUseNewAddress(false);
      form.setValue('addressId', addressData.id);
      
      // Reset new address form
      form.setValue('newAddress', {
        label: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        isDefault: false,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create address.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAddress(false);
    }
  };

  // Show loading state
  if (loading || addressLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg">Loading checkout...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  // Return while redirecting
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg">Redirecting...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Only use existing addresses for order creation
      if (useNewAddress) {
        toast({
          title: "Error",
          description: "Please create the address first before placing the order.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const selectedAddress = addresses.find(addr => addr.id === data.addressId);
      if (!selectedAddress) {
        throw new Error('Please select a valid address');
      }

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        address: selectedAddress,
        totalAmount: cartTotal
      };
      
      // TODO: Send to API to create order
      setTimeout(() => {
        toast({
          title: "Order Created!",
          description: "Redirecting to payment...",
        });
        clearCart();
        router.push('/');
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-headline font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Button asChild size="lg">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <OrderSummary />

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <section className="space-y-4">
                  <h3 className="font-semibold text-lg">Contact Information</h3>
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input value={user?.name || 'User'} disabled />
                    </FormControl>
                  </FormItem>
                  <FormField 
                    control={form.control} 
                    name="email" 
                    render={({ field }) => ( 
                      <FormItem> 
                        <FormLabel>Email</FormLabel> 
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} disabled />
                        </FormControl> 
                        <FormMessage /> 
                      </FormItem> 
                    )} 
                  />
                </section>
                
                <section className="space-y-4">
                  <h3 className="font-semibold text-lg">Delivery Address</h3>
                  <AddressSelector 
                    addresses={addresses}
                    control={form.control}
                    useNewAddress={useNewAddress}
                    setUseNewAddress={setUseNewAddress}
                    setValue={form.setValue}
                  />
                  {useNewAddress && (
                    <>
                      <NewAddressForm 
                        control={form.control}
                        hasExistingAddresses={addresses && addresses.length > 0}
                      />
                      <Button 
                        type="button" 
                        onClick={handleCreateAddress}
                        disabled={isCreatingAddress}
                        className="w-auto px-6 mx-auto block"
                        size="sm"
                      >
                        {isCreatingAddress ? 'Creating Address...' : 'Create Address'}
                      </Button>
                    </>
                  )}
                </section>

                <Button 
                  type="submit" 
                  className="w-auto px-8 mx-auto block" 
                  size="sm" 
                  disabled={isSubmitting || useNewAddress}
                >
                  {isSubmitting ? 'Processing...' : useNewAddress ? 'Create Address First' : `Complete Order - ${formatPrice(cartTotal)}`}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
