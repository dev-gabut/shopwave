import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

// Define the Address type explicitly
export interface User {
  id: number;
  name?: string;
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

// Get current user from JWT token
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ShopWaveToken')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.sub;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { 
        addresses: {
          orderBy: {
            isDefault: 'desc'
          }
        }
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl,
      addresses: user.addresses.map((address) => ({
        id: String(address.id),
        label: address.label,
        address: address.address,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      })),
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get addresses by user ID
export async function getAddressesByUserId(userId: number) {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: {
        isDefault: 'desc'
      }
    });

    return addresses.map((address) => ({
      id: String(address.id),
      label: address.label,
      address: address.address,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    }));
  } catch (error) {
    console.error('Error getting addresses:', error);
    return [];
  }
}

// Create new address for user
export async function createUserAddress(userId: number, addressData: Omit<Address, 'id'>) {
  try {
    // If this is set as default, make sure no other address is default
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        ...addressData
      }
    });

    return {
      id: String(newAddress.id),
      label: newAddress.label,
      address: newAddress.address,
      city: newAddress.city,
      province: newAddress.province,
      postalCode: newAddress.postalCode,
      isDefault: newAddress.isDefault,
    };
  } catch (error) {
    console.error('Error creating user address:', error);
    throw new Error('Failed to create address');
  }
}

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
      name: dbUser.name,
      role: dbUser.role,
      email: dbUser.email,
      imageUrl: dbUser.imageUrl,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day expiry
    },
    JWT_SECRET
  );

  return {
    id: String(dbUser.id),
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    imageUrl: dbUser.imageUrl,
    addresses: dbUser.addresses.map((address) => ({
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
