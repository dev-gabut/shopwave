'use client';

import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type CheckoutFormValues = {
  email: string;
  addressId?: number;
  newAddress?: {
    label: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
  };
  useNewAddress: boolean;
};

interface NewAddressFormProps {
  control: Control<CheckoutFormValues>;
  hasExistingAddresses: boolean;
}

export function NewAddressForm({ control, hasExistingAddresses }: NewAddressFormProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
      <h4 className="font-medium">New Address Details</h4>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="newAddress.label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="Home, Office, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="newAddress.postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input placeholder="12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="newAddress.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St, Apt 4B" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="newAddress.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Jakarta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="newAddress.province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <FormControl>
                <Input placeholder="DKI Jakarta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {hasExistingAddresses && (
        <FormField
          control={control}
          name="newAddress.isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set as default address</FormLabel>
              </div>
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
