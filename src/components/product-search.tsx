'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductSearchProps {
  onSearchChange: (term: string) => void;
}

export function ProductSearch({ onSearchChange }: ProductSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for products..."
        className="pl-10 text-base py-6 rounded-full"
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
