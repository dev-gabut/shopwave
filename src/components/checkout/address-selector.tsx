'use client';

import { Control, UseFormSetValue } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

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

interface AddressSelectorProps {
  addresses: Address[];
  control: Control<CheckoutFormValues>;
  useNewAddress: boolean;
  setUseNewAddress: (value: boolean) => void;
  setValue: UseFormSetValue<CheckoutFormValues>;
}

export function AddressSelector({
  addresses = [],
  control,
  useNewAddress,
  setUseNewAddress,
  setValue,
}: AddressSelectorProps) {
  if (!Array.isArray(addresses)) {
    console.warn('AddressSelector: addresses is not an array:', addresses);
    return null;
  }

  return (
    <div className="space-y-4">
      {addresses.length > 0 && (
        <>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="existing-address"
              checked={!useNewAddress}
              onChange={() => {
                setUseNewAddress(false);
                setValue('useNewAddress', false);
              }}
              className="h-4 w-4"
            />
            <label htmlFor="existing-address" className="font-medium">
              Use existing address
            </label>
          </div>

          {!useNewAddress && (
            <FormField
              control={control}
              name="addressId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Address</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() || ''}
                    key={`address-select-${addresses.length}-${field.value}`} // Force re-render when addresses change or value changes
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {addresses?.map((address) => (
                        <SelectItem
                          key={address.id}
                          value={address.id.toString()}
                        >
                          <div className="flex flex-col text-left w-full">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {address.label}
                              </span>
                              {address.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {address.address}, {address.city},{' '}
                              {address.province} {address.postalCode}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id="new-address"
          checked={useNewAddress}
          onChange={() => {
            setUseNewAddress(true);
            setValue('useNewAddress', true);
          }}
          className="h-4 w-4"
        />
        <label htmlFor="new-address" className="font-medium">
          {addresses && addresses.length > 0
            ? 'Add new address'
            : 'Add delivery address'}
        </label>
      </div>
    </div>
  );
}
