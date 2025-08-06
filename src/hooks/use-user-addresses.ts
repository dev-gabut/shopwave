'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface Address {
  id: number;
  label: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export function useUserAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch addresses from database
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const fetchedAddresses = await response.json();
        setAddresses(fetchedAddresses);
        console.log('Fetched addresses from API:', fetchedAddresses);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Always fetch from API to get the most up-to-date addresses
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  const addAddress = (newAddress: Address) => {
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    console.log('Added new address, total addresses now:', updatedAddresses.length);
    
    // Optionally refresh from database to get the most up-to-date list
    setTimeout(() => fetchAddresses(), 500);
  };

  return {
    addresses,
    loading,
    addAddress,
  };
}
