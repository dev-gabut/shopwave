import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword', // Use a real hash in production
      role: 'BUYER',
    },
  })

  // Create an address for the user
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: 'Home',
      address: '123 Main St',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
      isDefault: true,
    },
  })

  // Create a shop for the user (as seller)
  const seller = await prisma.user.create({
    data: {
      name: 'Seller User',
      email: 'seller@example.com',
      password: 'hashedpassword',
      role: 'SELLER',
    },
  })

  const shop = await prisma.shop.create({
    data: {
      userId: seller.id,
      shopName: 'Test Shop',
      description: 'A shop for testing',
    },
  })

  // Create a category
  const category = await prisma.category.create({
    data: {
      name: 'T-Shirt',
    },
  })

  // Create a product
  const product = await prisma.product.create({
    data: {
      shopId: shop.id,
      name: 'Aerostreet T-Shirt Constellate Hitam',
      description: 'A stylish black t-shirt for testing checkout.',
      price: 99000,
      stock: 10,
      categoryId: category.id,
    },
  })

  // Add a product image
  await prisma.productImage.create({
    data: {
      productId: product.id,
      imageUrl: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//catalog-image/92/MTA-145022464/brd-37294_aerostreet-t-shirt-constellate-hitam-kaos-t-shirt-tshirt-aacaa_full01-711d4521.jpg',
      isPrimary: true,
    },
  })

  // Add a review
  await prisma.review.create({
    data: {
      userId: user.id,
      productId: product.id,
      rating: 5,
      comment: 'Great t-shirt!',
    },
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })