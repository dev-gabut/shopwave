
// *************** IMPORT TYPE ***************
import type { NextApiRequest, NextApiResponse } from 'next';

// *************** IMPORT MODULE ***************
import { GetUserDefaultAddress, GetCartProductsByIds } from '@/lib/checkout';

// *************** API ROUTE 
/**
 * API handler for fetching checkout data (user address and cart products).
 * Accepts POST requests with userId and cartIds in the body.
 *
 * @async
 * @function Handler
 * @param {NextApiRequest} req - The API request object
 * @param {NextApiResponse} res - The API response object
 * @returns {Promise<void>} Sends JSON response with address and products
 */
async function Handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { userId, cartIds } = req.body;
  if (!userId || !Array.isArray(cartIds)) {
    return res.status(400).json({ error: 'Missing userId or cartIds' });
  }
  const address = await GetUserDefaultAddress(Number(userId));
  const products = await GetCartProductsByIds(cartIds.map(Number));
  res.status(200).json({ address, products });
}

// *************** EXPORT HANDLER ***************
export default Handler;
