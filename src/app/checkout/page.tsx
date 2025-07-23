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
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, loading, router]);


  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: user?.email || '', firstName: '', lastName: '', address: '', city: '', postalCode: '', country: '', cardName: '', cardNumber: '', cardExpiry: '', cardCvc: '' },
  });

  useEffect(() => {
    if (user?.email) {
      form.setValue('email', user.email);
    }
  }, [user, form]);

  const onSubmit = (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    console.log('Order submitted:', data);

    setTimeout(() => {
      toast({
        title: "Order Placed!",
        description: "Thank you for your purchase. Your order is on its way.",
      });
      clearCart();
      router.push('/');
    }, 1500);
  };
  
  if (loading || !user) {
    return (
        <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
        </div>
    )
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>First Name</FormLabel> <FormControl><Input placeholder="John" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem> <FormLabel>Last Name</FormLabel> <FormControl><Input placeholder="Doe" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Address</FormLabel> <FormControl><Input placeholder="123 Main St" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem> <FormLabel>City</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem> <FormLabel>Postal Code</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="country" render={({ field }) => ( <FormItem> <FormLabel>Country</FormLabel> <FormControl><Input placeholder="USA" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                </section>
                 <section className="space-y-4">
                    <h3 className="font-semibold text-lg">Payment Details</h3>
                     <FormField control={form.control} name="cardName" render={({ field }) => ( <FormItem> <FormLabel>Name on Card</FormLabel> <FormControl><Input placeholder="John M Doe" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                     <FormField control={form.control} name="cardNumber" render={({ field }) => ( <FormItem> <FormLabel>Card Number</FormLabel> <FormControl><div className="relative"><CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input className="pl-10" placeholder="0000 0000 0000 0000" {...field} /></div></FormControl> <FormMessage /> </FormItem> )} />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="cardExpiry" render={({ field }) => ( <FormItem> <FormLabel>Expiration (MM/YY)</FormLabel> <FormControl><Input placeholder="MM/YY" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="cardCvc" render={({ field }) => ( <FormItem> <FormLabel>CVC</FormLabel> <FormControl><Input placeholder="123" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                </section>
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

    