// *************** IMPORT TYPE ***************
import type { NextApiRequest, NextApiResponse } from 'next';

// *************** IMPORT MODULE ***************
import midtransClient from 'midtrans-client';

// *************** CONSTANTS ***************
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

// *************** API ROUTE 
/**
 * API handler for creating a Midtrans Snap transaction.
 * Accepts POST requests with checkout data and returns Snap token.
 *
 * @async
 * @function CreateMidtransTransactionHandler
 * @param {NextApiRequest} req - The API request object
 * @param {NextApiResponse} res - The API response object
 * @returns {Promise<void>} Sends JSON response with Snap token or error
 */
async function CreateMidtransTransactionHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body;
  const requiredFields = [
    'total_price', 'full_name', 'email', 'address', 'postal_code', 'product', 'unit_price', 'quantity', 'shipping_cost', 'insurance_cost'
  ];
  for (const field of requiredFields) {
    if (!body[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }
  let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY,
  });

  let parameter = {
    transaction_details: {
      order_id: `ORD-${Date.now()}`,
      gross_amount: body.total_price,
    },
    customer_details: {
      first_name: body.full_name,
      email: body.email || '',
      shipping_address: {
        address: body.address,
        postal_code: body.postal_code,
      },
    },
    item_details: [
      {
        id: 'product',
        name: body.product,
        price: body.unit_price,
        quantity: body.quantity,
      },
      {
        id: 'shipping',
        name: 'Shipping Cost',
        price: body.shipping_cost,
        quantity: 1,
      },
      {
        id: 'insurance',
        name: 'Insurance',
        price: body.insurance_cost,
        quantity: 1,
      },
    ],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return res.status(200).json(transaction);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// *************** EXPORT HANDLER ***************
export default CreateMidtransTransactionHandler;
