import { SQLiteDatabase } from "expo-sqlite";
import { Item } from "../models/Item";
import { ProductRow } from "./types";
import { CartItem } from "../routes/modelRoutes";

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

export const insertProduct = (database: SQLiteDatabase, product: Item): void => {
  try {
    if (!product.name || !product.description || !product.images || !product.targetScreen || !product.category) {
      throw new Error("Campos obrigatórios ausentes: " + JSON.stringify(product));
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

    console.log("Inserindo produto com valores:", values);
    database.runSync(
      `INSERT INTO products (name, quantity, price, description, image, targetScreen, planPrices, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
    console.log("Produto inserido com sucesso:", product);
  } catch (error) {
    console.error("Erro ao inserir produto:", error);
    throw error;
  }
};

export const getProductsByTargetScreen = (
  database: SQLiteDatabase,
  targetScreen: string
): Item[] => {
  try {
    console.log("Buscando produtos para targetScreen:", targetScreen);
    const rows = database.getAllSync<ProductRow>(
      `SELECT * FROM products WHERE targetScreen = ?`,
      [targetScreen]
    );
    const products = rows.map(toItem);
    console.log(`Produtos encontrados para ${targetScreen}:`, products);
    return products;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
};

// Em itemRepository.ts ou onde getAllOrders é definido
export const getAllOrders = (db) => {
  console.log("Buscando todas as vendas no banco de dados...");
  const rows = db.getAllSync("SELECT * FROM orders ORDER BY createdAt DESC");
  console.log("Linhas brutas retornadas do banco:", rows);

  const processedSales = rows.map((row) => {
    let items = [];
    if (row.cartItems) {
      try {
        items = JSON.parse(row.cartItems); // Garante que items seja um array plano
      } catch (error) {
        console.error("Erro ao parsear cartItems:", error);
      }
    }
    console.log("Convertendo row para Sale:", { row, items });
    return {
      id: row.id.toString(),
      date: row.createdAt,
      items, // Não deve ser [items], apenas items
      total: row.total,
    };
  });

  console.log("Vendas processadas:", processedSales);
  return processedSales;
};

export const updateProduct = (
  database: SQLiteDatabase,
  id: string,
  product: Partial<Item>
): void => {
  try {
    console.log("Atualizando produto ID:", id, "com dados:", product);
    database.runSync(
      `UPDATE products SET 
        name = ?, 
        quantity = ?, 
        price = ?, 
        description = ?, 
        image = ?, 
        targetScreen = ?, 
        planPrices = ?, 
        category = ?
       WHERE id_product = ?`,
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
    console.log("Produto atualizado com sucesso:", { id, ...product });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
};

export const deleteProduct = (database: SQLiteDatabase, id: string): void => {
  try {
    console.log("Deletando produto ID:", id);
    database.runSync(`DELETE FROM products WHERE id_product = ?`, [id]);
    console.log("Produto deletado com sucesso:", id);
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
};

export const getProductById = (
  database: SQLiteDatabase,
  id: string
): Item | null => {
  try {
    console.log("Buscando produto por ID:", id);
    const row = database.getFirstSync<ProductRow>(
      `SELECT * FROM products WHERE id_product = ?`,
      [id]
    );
    if (!row) {
      console.log("Produto não encontrado para ID:", id);
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

export const saveOrder = (
  db: SQLite.SQLiteDatabase,
  customerName: string,
  cpf: string,
  cep: string,
  address: string,
  number: string,
  neighborhood: string,
  city: string,
  state: string,
  cartItems: any, // Deve ser o array de itens
  total: number
) => {
  const createdAt = new Date().toISOString();
  const cartItemsJson = JSON.stringify(cartItems);

  console.log("Executando inserção no banco com:", {
    customerName,
    cpf,
    cep,
    address,
    number,
    neighborhood,
    city,
    state,
    cartItemsJson,
    total,
    createdAt,
  });

  db.runSync(
    `INSERT INTO orders (
      customerName, cpf, cep, address, number, neighborhood, city, state, cartItems, total, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customerName,
      cpf,
      cep,
      address,
      number,
      neighborhood,
      city,
      state,
      cartItemsJson,
      total,
      createdAt,
    ]
  );

  console.log("Inserção concluída.");
};