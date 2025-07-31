
'use server';
import { createShowcaseBasedShopId } from '@/models/showcase';
import { revalidatePath } from 'next/cache';
import { Plus } from 'lucide-react';


export async function addShowcaseAction(formData: FormData) {
  const shopId = Number(formData.get('shopId'));
  const name = formData.get('name')?.toString() || '';
  if (!name.trim()) {
    // Optionally: set error in cookies or use redirect with error param
    return;
  }
  try {
    await createShowcaseBasedShopId({ shopId, name });
    revalidatePath('/seller');
  } catch (e) {
    // Optionally: set error in cookies or use redirect with error param
    return;
  }
}

export default async function AddShowcaseInlineForm({ shopId }: { shopId: number }) {
  return (
    <form action={addShowcaseAction} className="flex items-center gap-2">
      <input
        type="hidden"
        name="shopId"
        value={shopId}
      />
      <input
        type="text"
        name="name"
        placeholder="Showcase name"
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
        style={{ width: 120 }}
        required
      />
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </form>
  );
}
