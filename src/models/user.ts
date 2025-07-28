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
    id: dbUser.id.toString(),
    email: dbUser.email,
    role: dbUser.role.toLowerCase(),
    addresses: dbUser.addresses.map((a: any) => ({
      id: a.id.toString(),
      label: a.label,
      address: a.address,
      city: a.city,
      province: a.province,
      postalCode: a.postalCode,
      isDefault: a.isDefault,
    })),
    token,
  };
}
