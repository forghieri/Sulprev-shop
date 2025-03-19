// src/database/productRepository.ts
import { type SQLiteDatabase } from "expo-sqlite";
import { Item } from "../models/Item";
import { ProductRow } from "./types";

const toItem = (row: ProductRow): Item => ({
  id: row.id_product.toString(),
  name: row.name,
  quantity: row.quantity,
  price: row.price || undefined,
  description: row.description,
  images: JSON.parse(row.image),
  targetScreen: row.targetScreen,
  planPrices: row.planPrices ? JSON.parse(row.planPrices) : undefined,
  category: row.category,
});

// Insere um novo produto
export const insertProduct = async (database: SQLiteDatabase, product: Item): Promise<void> => {
  try {
    // Validação explícita dos campos obrigatórios
    if (!product.name || !product.description || !product.images || !product.targetScreen || !product.category) {
      throw new Error("Um ou mais campos obrigatórios estão ausentes ou inválidos: " + JSON.stringify(product));
    }

    const values = {
      name: product.name,
      quantity: product.quantity || 0,
      price: product.price || null,
      description: product.description,
      image: JSON.stringify(product.images),
      targetScreen: product.targetScreen,
      planPrices: product.planPrices ? JSON.stringify(product.planPrices) : null,
      category: product.category,
    };

    console.log("Valores a serem inseridos no banco:", values);

    await database.runAsync(
      `INSERT INTO products (name, quantity, price, description, image, targetScreen, planPrices, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        values.name,
        values.quantity,
        values.price,
        values.description,
        values.image,
        values.targetScreen,
        values.planPrices,
        values.category,
      ]
    );
    console.log("Produto inserido:", product);
  } catch (error) {
    console.error("Erro ao inserir produto:", error);
    throw error;
  }
};

// Busca todos os produtos por targetScreen
export const getProductsByTargetScreen = async (
  database: SQLiteDatabase,
  targetScreen: string
): Promise<Item[]> => {
  try {
    console.log("Buscando itens para:", targetScreen);
    const rows = await database.getAllAsync<ProductRow>(
      `SELECT * FROM products WHERE targetScreen = ?;`,
      [targetScreen]
    );
    const products = rows.map(toItem);
    console.log(`Produtos carregados para ${targetScreen}:`, products);
    return products;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
};

// Atualiza um produto existente
export const updateProduct = async (
  database: SQLiteDatabase,
  id: string,
  product: Partial<Item>
): Promise<void> => {
  try {
    console.log("Atualizando produto com ID:", id, "Dados:", product);
    await database.runAsync(
      `UPDATE products SET 
        name = ?, 
        quantity = ?, 
        price = ?, 
        description = ?, 
        image = ?, 
        targetScreen = ?, 
        planPrices = ?, 
        category = ?
       WHERE id_product = ?;`,
      [
        product.name || null,
        product.quantity || 0,
        product.price || null,
        product.description || null,
        product.images ? JSON.stringify(product.images) : null,
        product.targetScreen || null,
        product.planPrices ? JSON.stringify(product.planPrices) : null,
        product.category || null,
        id,
      ]
    );
    console.log("Produto atualizado:", { id, ...product });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
};

// Deleta um produto
export const deleteProduct = async (database: SQLiteDatabase, id: string): Promise<void> => {
  try {
    console.log("Deletando produto com ID:", id);
    await database.runAsync(`DELETE FROM products WHERE id_product = ?;`, [id]);
    console.log("Produto deletado:", id);
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
};

// Busca um produto por ID
export const getProductById = async (
  database: SQLiteDatabase,
  id: string
): Promise<Item | null> => {
  try {
    console.log("Buscando produto com ID:", id);
    const row = await database.getFirstAsync<ProductRow>(
      `SELECT * FROM products WHERE id_product = ?;`,
      [id]
    );
    if (!row) {
      console.log("Nenhum produto encontrado para o ID:", id);
      return null;
    }
    const product = toItem(row);
    console.log("Produto encontrado:", product);
    return product;
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    throw error;
  }
};