import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a seller user
  const seller = await prisma.user.create({
    data: {
      name: 'Seller Example',
      email: 'seller@example.com',
      password: 'password123', // You should hash passwords in production
      role: 'SELLER',
      shop: {
        create: {
          shopName: 'Example Shop',
          description: 'This is an example shop for the seller.',
        },
      },
      addresses: {
        create: [
          {
            label: 'Main Address',
            address: 'Jl. Contoh No. 1',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            postalCode: '12345',
            isDefault: true,
          },
        ],
      },
    },
    include: {
      shop: true,
      addresses: true,
    },
  });

  console.log('Seeded seller user:', seller);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
