import { updateShowCaseAction } from '@/app/seller/action/showcase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Showcase } from '@prisma/client';

export function EditShowcaseModal({
  showcase,
  onClose,
}: {
  showcase: Showcase;
  onClose: () => void;
}) {
  const [name, setName] = useState(showcase.name);
  const router = useRouter();

  const handleUpdate = async () => {
    try {
      await updateShowCaseAction({ id: showcase.id, name });
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]">
      <div className="bg-white p-4 rounded shadow w-[400px]">
        <h2 className="text-xl mb-4">Edit Showcase</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-2 py-1 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
