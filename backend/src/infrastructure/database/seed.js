/**
 * =============================================================================
 * SNACKS BY LEBO - Database Seed Script
 * =============================================================================
 * 
 * Populates the database with initial product data.
 * Run with: npm run seed
 * =============================================================================
 */

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { initDatabase, closeDatabase } = require('./connection');
const ProductRepository = require('../repositories/ProductRepository');
const Product = require('../../domain/entities/Product');

// Initial product data (prices in cents)
const seedProducts = [
    {
        id: uuidv4(),
        name: "Starter Snack Pack",
        description: "Perfect for trying our delicious flavors",
        price: 25000, // R250.00
        category: "starter",
        emoji: "🎁",
        badge: "Best for Trying",
        items: [
            "2x Fruity Rainbow Bites",
            "2x Crispy Veggie Chips",
            "2x Berry Blast Popcorn"
        ],
        isActive: true
    },
    {
        id: uuidv4(),
        name: "Family Favorites Pack",
        description: "Great variety for the whole family",
        price: 45000, // R450.00
        category: "family",
        emoji: "👨‍👩‍👧‍👦",
        badge: "Most Popular",
        items: [
            "2x Fruity Rainbow Bites",
            "2x Crispy Veggie Chips",
            "2x Berry Blast Popcorn",
            "2x Spinach Power Puffs",
            "2x Mango Fruit Roll",
            "2x Broccoli Cheddar Squares"
        ],
        isActive: true
    },
    {
        id: uuidv4(),
        name: "Ultimate Deluxe Pack",
        description: "Everything you love - our complete collection",
        price: 60000, // R600.00
        category: "premium",
        emoji: "👑",
        badge: "Best Value",
        items: [
            "2x Fruity Rainbow Bites",
            "2x Crispy Veggie Chips",
            "2x Berry Blast Popcorn",
            "2x Spinach Power Puffs",
            "2x Mango Fruit Roll",
            "2x Broccoli Cheddar Squares",
            "2x Honey Granola Clusters",
            "2x Almond Joy Bites",
            "2x Strawberry Chewy Bars"
        ],
        isActive: true
    }
];

async function seed() {
    console.log('🌱 Starting database seed...\n');

    // Initialize database
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/snacks_by_lebo.db');
    await initDatabase(dbPath);

    const productRepo = new ProductRepository();

    // Check if products already exist
    const existingProducts = await productRepo.findAll();
    
    if (existingProducts.length > 0) {
        console.log(`⚠️  Database already has ${existingProducts.length} products.`);
        console.log('   Skipping seed to prevent duplicates.\n');
        closeDatabase();
        return;
    }

    // Create products
    console.log('📦 Creating products...\n');
    
    for (const productData of seedProducts) {
        try {
            const product = new Product(productData);
            await productRepo.create(product);
            console.log(`   ✅ Created: ${product.name} (${product.getFormattedPrice()})`);
        } catch (error) {
            console.error(`   ❌ Error creating product: ${error.message}`);
        }
    }

    console.log('\n✨ Seed completed successfully!');
    closeDatabase();
}

// Run seed
seed().catch(error => {
    console.error('Seed failed:', error);
    process.exit(1);
});
