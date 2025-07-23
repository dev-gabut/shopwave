
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductSearchProps {
  onSearchChange?: (term: string) => void;
  onSearchSubmit?: (term: string) => void;
  initialValue?: string;
}

export function ProductSearch({ onSearchChange, onSearchSubmit, initialValue = '' }: ProductSearchProps) {
  const [term, setTerm] = useState(initialValue);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setTerm(newTerm);
    if (onSearchChange) {
      onSearchChange(newTerm);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(term);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for products..."
          className="pl-10 text-base py-6 rounded-full"
          value={term}
          onChange={handleInputChange}
        />
      </div>
    </form>
  );
}
