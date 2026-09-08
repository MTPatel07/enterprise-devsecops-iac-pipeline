import { db } from './index';
import { users, products } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create sample users
    const [user] = await db.insert(users).values([
      {
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: '$2a$10$dummyhashfordemopurposes123456', // In production, use bcrypt
        role: 'customer',
      },
      {
        name: 'Admin User',
        email: 'admin@secureflow.com',
        passwordHash: '$2a$10$dummyhashfordemopurposes123456',
        role: 'admin',
      },
    ]).returning();

    console.log('✅ Created users');

    // Create sample products
    await db.insert(products).values([
      {
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
        price: '199.99',
        stock: 50,
        category: 'Electronics',
        imageUrl: null,
      },
      {
        name: 'Smart Watch',
        description: 'Fitness tracking smartwatch with heart rate monitor and GPS',
        price: '299.99',
        stock: 30,
        category: 'Electronics',
        imageUrl: null,
      },
      {
        name: 'Laptop Stand',
        description: 'Ergonomic aluminum laptop stand for better posture',
        price: '49.99',
        stock: 100,
        category: 'Accessories',
        imageUrl: null,
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches',
        price: '129.99',
        stock: 45,
        category: 'Electronics',
        imageUrl: null,
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        price: '39.99',
        stock: 75,
        category: 'Electronics',
        imageUrl: null,
      },
      {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
        price: '59.99',
        stock: 60,
        category: 'Accessories',
        imageUrl: null,
      },
      {
        name: 'Portable SSD',
        description: '1TB portable SSD with 540MB/s read speed',
        price: '149.99',
        stock: 40,
        category: 'Storage',
        imageUrl: null,
      },
      {
        name: 'Webcam 4K',
        description: '4K webcam with autofocus and noise-cancelling microphone',
        price: '89.99',
        stock: 55,
        category: 'Electronics',
        imageUrl: null,
      },
    ]);

    console.log('✅ Created products');
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
