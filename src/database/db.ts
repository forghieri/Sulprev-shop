// src/database/db.ts
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "app_database_v2.db";

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = SQLite.openDatabaseSync(DATABASE_NAME); // Usar openDatabaseSync
  return db;
};