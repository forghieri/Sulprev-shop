import { SQLiteDatabase } from "expo-sqlite";

export const initializeDatabase = (db: SQLiteDatabase): void => {
  try {
    console.log("Executando criação das tabelas...");
    db.execSync(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT,
        quantity INTEGER,
        price TEXT,
        description TEXT,
        images TEXT,
        targetScreen TEXT,
        category TEXT
      );
      DROP TABLE IF EXISTS orders;
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerName TEXT,
        cpf TEXT,
        cep TEXT,
        address TEXT,
        number TEXT,
        neighborhood TEXT,
        city TEXT,
        state TEXT,
        cartItems TEXT,
        total REAL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS products (
        id_product INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        quantity INTEGER,
        price TEXT,
        description TEXT,
        image TEXT,
        targetScreen TEXT,
        planPrices TEXT,
        category TEXT
      );
    `);
    console.log("Tabelas 'items', 'orders' e 'products' criadas ou já existentes.");
  } catch (error) {
    console.error("Erro ao inicializar tabelas:", error);
    throw error;
  }
};