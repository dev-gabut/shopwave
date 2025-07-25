
'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

const checkoutSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  address: z.string().min(1, { message: 'Address is required.' }),
  city: z.string().min(1, { message: 'City is required.' }),
  postalCode: z.string().min(5, { message: 'Postal code is required.' }),
  country: z.string().min(1, { message: 'Country is required.' }),
  cardName: z.string().min(1, { message: 'Name on card is required.' }),
  cardNumber: z.string().refine((val) => /^\d{16}$/.test(val), { message: 'Invalid card number.' }),
  cardExpiry: z.string().refine((val) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), { message: 'Invalid format (MM/YY).' }),
  cardCvc: z.string().refine((val) => /^\d{3,4}$/.test(val), { message: 'Invalid CVC.' }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, loading, router]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: user?.email || '', firstName: '', lastName: '', address: '', city: '', postalCode: '', country: '', cardName: '', cardNumber: '', cardExpiry: '', cardCvc: '' },
  });

  // Fetch user addresses on mount
  useEffect(() => {
    async function fetchAddresses() {
      if (user?.id) {
        try {
          const res = await fetch('/api/user-addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });
          const result = await res.json();
          if (Array.isArray(result.addresses)) {
            setAddresses(result.addresses);
            // Select default address if available
            if (result.addresses.length > 0) {
              setSelectedAddressId(result.addresses[0].id.toString());
            }
          }
        } catch (err) {
          console.log('Error fetching addresses:', err);
        }
      }
    }
    fetchAddresses();
  }, [user]);

  // Autofill form fields when address selection changes
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const addr = addresses.find(a => a.id.toString() === selectedAddressId);
      if (addr) {
        form.setValue('firstName', addr.firstName || '');
        form.setValue('lastName', addr.lastName || '');
        form.setValue('address', addr.address || '');
        form.setValue('city', addr.city || '');
        form.setValue('postalCode', addr.postalCode || '');
        form.setValue('country', addr.country || '');
      }
    }
  }, [selectedAddressId, addresses, form]);

  useEffect(() => {
    if (user?.email) {
      form.setValue('email', user.email);
    }
  }, [user, form]);

  // *************** MIDTRANS PAYMENT INTEGRATION ***************
  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    // Prepare payload for Midtrans
    const payload = {
      total_price: cartTotal,
      full_name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      address: data.address,
      postal_code: data.postalCode,
      product: cartItems[0]?.name || 'Product',
      unit_price: cartItems[0]?.price || 0,
      quantity: cartItems[0]?.quantity || 1,
      shipping_cost: 25000, // You can make this dynamic
      insurance_cost: 0 // Add logic if you want insurance
    };

    console.log('Pay button clicked. Payload:', payload);

    try {
      const res = await fetch('/api/checkout-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log('Midtrans API response:', result);
      if (result.token) {
        // Load Snap.js if not loaded
        if (!window.snap) {
          console.log('Snap.js not loaded, injecting script...');
          const script = document.createElement('script');
          script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
          document.body.appendChild(script);
          script.onload = () => {
            console.log('Snap.js loaded, calling pay with token:', result.token);
            window.snap.pay(result.token, {
              onSuccess: (res) => {
                console.log('Midtrans Success:', res);
                toast({ title: "Payment Success!", description: "Thank you for your purchase." });
                clearCart();
                router.push('/');
              },
              onPending: (res) => {
                console.log('Midtrans Pending:', res);
                toast({ title: "Payment Pending", description: "Your payment is pending." });
              },
              onError: (res) => {
                console.log('Midtrans Error:', res);
                toast({ title: "Payment Error", description: "There was an error processing your payment." });
              },
              onClose: () => {
                console.log('Midtrans Closed');
                toast({ title: "Payment Cancelled", description: "You closed the payment popup." });
              },
            });
          };
        } else {
          console.log('Snap.js already loaded, calling pay with token:', result.token);
          window.snap.pay(result.token, {
            onSuccess: (res) => {
              console.log('Midtrans Success:', res);
              toast({ title: "Payment Success!", description: "Thank you for your purchase." });
              clearCart();
              router.push('/');
            },
            onPending: (res) => {
              console.log('Midtrans Pending:', res);
              toast({ title: "Payment Pending", description: "Your payment is pending." });
            },
            onError: (res) => {
              console.log('Midtrans Error:', res);
              toast({ title: "Payment Error", description: "There was an error processing your payment." });
            },
            onClose: () => {
              console.log('Midtrans Closed');
              toast({ title: "Payment Cancelled", description: "You closed the payment popup." });
            },
          });
        }
      } else {
        console.log('No token received from Midtrans:', result);
        toast({ title: "Payment Error", description: result.error || "Failed to create transaction." });
      }
    } catch (err: any) {
      console.log('Error in Midtrans payment:', err);
      toast({ title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Please log in to continue.</p>
      </div>
    );
  }

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-headline font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md object-cover" data-ai-hint="product image" />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping & Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <section className="space-y-4">
                  <h3 className="font-semibold text-lg">Contact Information</h3>
                  <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input placeholder="you@example.com" {...field} disabled /></FormControl> <FormMessage /> </FormItem> )} />
                </section>
                <section className="space-y-4">
                  <h3 className="font-semibold text-lg">Shipping Address</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Address</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={selectedAddressId || ''}
                      onChange={e => setSelectedAddressId(e.target.value)}
                      disabled={addresses.length === 0}
                    >
                      {addresses.length === 0 && <option value="">No address found</option>}
                      {addresses.map(addr => (
                        <option key={addr.id} value={addr.id}>{addr.label || `${addr.address}, ${addr.city}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>First Name</FormLabel> <FormControl><Input placeholder="John" {...field} disabled /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem> <FormLabel>Last Name</FormLabel> <FormControl><Input placeholder="Doe" {...field} disabled /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Address</FormLabel> <FormControl><Input placeholder="123 Main St" {...field} disabled /></FormControl> <FormMessage /> </FormItem> )} />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl><Input {...field} disabled /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem> <FormLabel>Postal Code</FormLabel> <FormControl><Input {...field} disabled /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>Country</FormLabel> <FormControl><Input placeholder="USA" {...field} disabled /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                </section>
                {/* Payment details removed for Midtrans integration */}
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Placing Order...' : `Pay ${formatPrice(cartTotal)}`}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    