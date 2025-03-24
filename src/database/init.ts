import { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "./db";
import { initializeDatabase } from "./itemSchema";

let isInitialized = false;
let dbInstance: SQLiteDatabase | null = null;

export const initDatabase = (): SQLiteDatabase => {
  console.log("Iniciando inicialização do banco de dados...");
  if (!isInitialized || !dbInstance) {
    dbInstance = getDatabase();
    console.log("Verificando e inicializando tabelas...");
    initializeDatabase(dbInstance);
    isInitialized = true;
  }
  console.log("Database inicializado com sucesso.");
  return dbInstance;
};