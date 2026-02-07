/**
 * =============================================================================
 * SNACKS BY LEBO - Infrastructure Layer: Database Connection
 * =============================================================================
 * 
 * Clean Architecture Layer: INFRASTRUCTURE (outermost)
 * 
 * This module handles SQLite database connection and initialization.
 * Using sql.js for a pure JavaScript SQLite implementation.
 * =============================================================================
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

let db = null;
let SQL = null;
let dbPath = null;

/**
 * Initialize database connection
 * @param {string} databasePath - Path to database file
 * @returns {Promise<Database>} SQLite database instance
 */
async function initDatabase(databasePath) {
    dbPath = databasePath;
    
    // Ensure data directory exists
    const dir = path.dirname(databasePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Initialize SQL.js
    SQL = await initSqlJs();
    
    // Load existing database or create new one
    try {
        if (fs.existsSync(databasePath)) {
            const fileBuffer = fs.readFileSync(databasePath);
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
        }
    } catch (error) {
        console.warn('Creating new database:', error.message);
        db = new SQL.Database();
    }
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Create tables
    createTables();
    
    // Save database
    saveDatabase();
    
    return db;
}

/**
 * Create database tables if they don't exist
 */
function createTables() {
    // Products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            category TEXT NOT NULL,
            emoji TEXT,
            badge TEXT,
            items TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Orders table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            reference_number TEXT UNIQUE NOT NULL,
            customer_id TEXT,
            customer_details TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            items TEXT NOT NULL,
            subtotal INTEGER NOT NULL,
            delivery_fee INTEGER NOT NULL,
            total INTEGER NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT DEFAULT 'pending',
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create indexes for common queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference_number)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`);
}

/**
 * Save database to file
 */
function saveDatabase() {
    if (db && dbPath) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

/**
 * Get database instance
 * @returns {Database}
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

/**
 * Execute a prepared statement and return results
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Result with statement
 */
function prepare(query) {
    const stmt = db.prepare(query);
    return {
        run(...params) {
            stmt.bind(params);
            stmt.step();
            stmt.free();
            saveDatabase();
            return { changes: db.getRowsModified() };
        },
        get(...params) {
            stmt.bind(params);
            const result = stmt.step() ? stmt.getAsObject() : null;
            stmt.free();
            return result;
        },
        all(...params) {
            stmt.bind(params);
            const results = [];
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            return results;
        }
    };
}

/**
 * Close database connection
 */
function closeDatabase() {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
    }
}

module.exports = {
    initDatabase,
    getDatabase,
    closeDatabase,
    prepare,
    saveDatabase
};
