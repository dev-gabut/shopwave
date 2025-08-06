'use server';

import { deleteShowCaseById, updateShowCaseById } from '@/models/showcase';
import { revalidatePath } from 'next/cache';

export async function deleteShowCaseAction(showCaseId: string) {
  await deleteShowCaseById(showCaseId);
  revalidatePath('/seller'); // atau path lain yang perlu direfresh
}

export async function updateShowCaseAction(data: { id: string; name: string }) {
  await updateShowCaseById(data);
  revalidatePath('/seller');
}
