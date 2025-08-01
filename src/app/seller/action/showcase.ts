'use server';

import { deleteShowCaseById } from '@/models/showcase';
import { revalidatePath } from 'next/cache';

export async function deleteShowCaseAction(showCaseId: number) {
  await deleteShowCaseById(showCaseId);
  revalidatePath('/seller'); // atau path lain yang perlu direfresh
}

