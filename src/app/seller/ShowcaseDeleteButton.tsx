'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { deleteShowCaseAction } from '@/app/seller/action/showcase';
import { useRouter } from 'next/navigation';

export function ShowcaseDeleteButton({ showcaseId }: { showcaseId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this showcase?');
    if (!confirmed) return;

    try {
      await deleteShowCaseAction(showcaseId);
      router.refresh(); // agar data terupdate
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
      Delete
    </DropdownMenuItem>
  );
}
