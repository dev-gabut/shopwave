import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;

// Define the Address type explicitly
export interface User {
  id: number;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  imageUrl?: string;
  addresses?: Address[];
}

type Address = {
  id: number;
  label: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    include: { addresses: true },
  });
  if (!dbUser) throw new Error('User not found');
  const valid = await bcrypt.compare(password, dbUser.password);
  if (!valid) throw new Error('Invalid password');

  // Generate JWT tokens
  const token = jwt.sign(
    {
      sub: dbUser.id,
      role: dbUser.role,
      email: dbUser.email,
      imageUrl: dbUser.imageUrl,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day expiry
    },
    JWT_SECRET
  );

  return {
    id: String(dbUser.id),
    email: dbUser.email,
    role: dbUser.role,
    addresses: dbUser.addresses.map((address: Address) => ({
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

export async function signUp({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
}
