import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password for buyer
  const buyerPassword = await bcrypt.hash('buyerpassword', 10);
  // Create a buyer user with address
  const buyer = await prisma.user.create({
    data: {
      name: 'agung',
      email: 'buyer.123@gmail.com',
      password: buyerPassword,
      role: 'BUYER',
      addresses: {
        create: [
          {
            label: 'Home',
            address: 'Jl. Mawar No. 123',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postalCode: '12345',
            isDefault: true,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  console.log('Seeded buyer:', buyer);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
