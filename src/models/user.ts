import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'shopwave-secret';

export async function loginUser({ email, password }: { email: string; password: string }) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { addresses: true },
  });
  if (!dbUser) throw new Error('User not found');
  const valid = await bcrypt.compare(password, dbUser.password);
  if (!valid) throw new Error('Invalid password');

  // Generate JWT token
  const token = jwt.sign(
    {
      id: dbUser.id,
      role: dbUser.role.toLowerCase(),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day expiry
    },
    JWT_SECRET
  );

  return {
    id: String(dbUser.id),
    email: dbUser.email,
    role: dbUser.role.toLowerCase(),
    addresses: dbUser.addresses.map(address => ({
      id: String(address.id),
      label: address.label,
      address: address.address,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    })),
    token,
  };
}
