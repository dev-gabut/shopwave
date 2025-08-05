'use server';

import { headers } from 'next/headers';

export async function getHeaders() {
	return headers();
}