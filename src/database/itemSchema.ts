// src/database/productSchema.ts
import { type SQLiteDatabase } from "expo-sqlite";

export const initializeDatabase = async (database: SQLiteDatabase): Promise<void> => {
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id_product INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price TEXT,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        targetScreen TEXT NOT NULL,
        planPrices TEXT,
        category TEXT NOT NULL
      );
    `);
    console.log("Tabela 'products' criada ou já existe");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
    throw error;
  }
};