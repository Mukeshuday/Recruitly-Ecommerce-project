require('dotenv').config({ path: '.env.local' }); // Load env

const mongoose = require('mongoose');
const Product = require('./lib/models/Product'); // Reuse your existing schema

// Function to generate unique SKUs
function generateSKU(prefix = 'SKU') {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`; // e.g., SKU-4821
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Clear old data
    await Product.deleteMany({});
    console.log('🗑 Old products cleared');

    // Insert new products with auto SKUs
    await Product.insertMany([
      {
        name: 'Laptop',
        sku: generateSKU(),
        description: 'A high-performance laptop for all your needs.',
        category: 'Electronics',
        brand: 'TechBrand',
        price: 899.99,
        costPrice: 650.00,
        currentStock: 15,
        tags: ['computers', 'gadgets'],
      },
      {
        name: 'Smartphone',
        sku: generateSKU(),
        description: 'Latest model smartphone with high-end features.',
        category: 'Electronics',
        brand: 'PhoneMaker',
        price: 499.99,
        costPrice: 350.00,
        currentStock: 30,
        tags: ['mobile', 'gadgets'],
      },
      {
        name: 'Headphones',
        sku: generateSKU(),
        description: 'Noise-cancelling over-ear headphones.',
        category: 'Accessories',
        brand: 'SoundMaster',
        price: 99.99,
        costPrice: 60.00,
        currentStock: 50,
        tags: ['audio', 'music'],
      },
      {
        name: 'Keyboard',
        sku: generateSKU(),
        description: 'Mechanical keyboard with RGB lighting.',
        category: 'Accessories',
        brand: 'KeyMasters',
        price: 39.99,
        costPrice: 25.00,
        currentStock: 25,
        tags: ['computers', 'peripherals'],
      }
    ]);

    console.log('🎉 Products seeded successfully with unique SKUs!');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    mongoose.connection.close();
  }
}

seed();
