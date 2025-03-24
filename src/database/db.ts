import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "app_database_v2.db";

export const getDatabase = (): SQLite.SQLiteDatabase => {
  console.log("Abrindo banco de dados:", DATABASE_NAME);
  const db = SQLite.openDatabaseSync(DATABASE_NAME);
  if (!db) {
    throw new Error("Falha ao abrir o banco de dados: objeto nulo retornado.");
  }
  console.log("Banco de dados aberto com sucesso.");
  return db;
};