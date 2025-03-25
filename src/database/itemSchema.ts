import { SQLiteDatabase } from "expo-sqlite";

export const initializeDatabase = (db: SQLiteDatabase): void => {
  try {
    console.log("Dropping tabelas existentes...");
    // db.execSync(`
    //   DROP TABLE IF EXISTS users;
    //   DROP TABLE IF EXISTS payment_types;
    //   DROP TABLE IF EXISTS orders;
    //   DROP TABLE IF EXISTS products;
    //   DROP TABLE IF EXISTS itensParque;
    //   DROP TABLE IF EXISTS itensPlanos;
    // `);

    console.log("Executando criação das tabelas...");
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerName TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        cep TEXT,
        address TEXT,
        number TEXT,
        neighborhood TEXT,
        city TEXT,
        state TEXT
      );
      CREATE TABLE IF NOT EXISTS payment_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        UNIQUE(userId, name),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        paymentTypeId INTEGER NOT NULL,
        installments INTEGER,
        cartItems TEXT,
        total REAL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (paymentTypeId) REFERENCES payment_types(id)
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
      CREATE TABLE IF NOT EXISTS itensParque (
        id_product INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        quantity INTEGER,
        description TEXT,
        image TEXT,
        targetScreen TEXT DEFAULT 'Parque',
        category TEXT,
        valorBronze TEXT,
        valorOuro TEXT,
        valorDiamante TEXT,
        valorDiamantePlus TEXT
      );
      CREATE TABLE IF NOT EXISTS itensPlanos (
        id_product INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        quantity INTEGER,
        description TEXT,
        image TEXT,
        targetScreen TEXT DEFAULT 'Planos',
        category TEXT,
        valorStandard TEXT,
        valorMaster TEXT,
        valorPrime TEXT
      );
    `);
    console.log("Tabelas 'users', 'payment_types', 'orders', 'products', 'itensParque' e 'itensPlanos' criadas ou já existentes.");
    const tables = db.getAllSync("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tabelas existentes após inicialização:", tables);
  } catch (error) {
    console.error("Erro ao inicializar tabelas:", error);
    throw error;
  }
};