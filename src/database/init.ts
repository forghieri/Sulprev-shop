// src/database/init.ts
import { type SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "./db";
import { initializeDatabase } from "./itemSchema";

let isInitialized = false;

export const initDatabase = async (): Promise<SQLiteDatabase> => {
  if (isInitialized) {
    return getDatabase();
  }

  const db = await getDatabase();
  await initializeDatabase(db);
  isInitialized = true;
  return db;
};