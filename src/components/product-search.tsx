
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductSearchProps {
  onSearchSubmit: (term: string) => void;
  initialValue?: string;
}

export function ProductSearch({ onSearchSubmit, initialValue = '' }: ProductSearchProps) {
  const [term, setTerm] = useState(initialValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearchSubmit(term);
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
