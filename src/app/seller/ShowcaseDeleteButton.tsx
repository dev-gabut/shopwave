'use client';

import { deleteShowCaseAction } from '@/app/seller/action/showcase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Showcase } from '@prisma/client';
import { Pencil, Trash2 } from 'lucide-react';
import { EditShowcaseModal } from '@/components/edit-showcase-modal';

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
    <button className="text-red-500 " onClick={handleDelete}>
      <Trash2 className="w-4 h-4 text-red-600" />
    </button>
  );
}
export function ShowcaseEditButton({ showcase }: { showcase: Showcase }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-blue-600">
        <Pencil className="w-4 h-4 text-blue-600" />
      </button>
      {open && (
        <EditShowcaseModal showcase={showcase} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
