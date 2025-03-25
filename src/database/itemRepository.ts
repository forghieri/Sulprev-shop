import { SQLiteDatabase } from "expo-sqlite";
import { Item } from "../models/Item";
import { ProductRow, Sale, SaleItem } from "./types";
import { CartItem } from "../routes/modelRoutes";

interface OrderRow {
  id: number;
  date: string;
  items: string;
  total: number;
  paymentTypeName: string;
  installments: number | null;
  customerName: string;
  cpf: string;
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ProductRow {
  id_product: number;
  name: string;
  quantity: number;
  price: string | null;
  description: string;
  image: string;
  targetScreen: string;
  planPrices: string | null;
  category: string;
}

interface ParqueProductRow {
  id_product: number;
  name: string;
  quantity: number;
  description: string;
  image: string;
  targetScreen: string;
  category: string;
  valorBronze: string | null;
  valorOuro: string | null;
  valorDiamante: string | null;
  valorDiamantePlus: string | null;
}

interface PlanosProductRow {
  id_product: number;
  name: string;
  quantity: number;
  description: string;
  image: string;
  targetScreen: string;
  category: string;
  valorStandard: string | null;
  valorMaster: string | null;
  valorPrime: string | null;
}

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

const toParqueItem = (row: ParqueProductRow): Item => ({
  id: row.id_product.toString(),
  name: row.name,
  quantity: row.quantity,
  description: row.description,
  images: JSON.parse(row.image),
  targetScreen: row.targetScreen,
  category: row.category,
  planPrices: {
    Bronze: row.valorBronze || undefined,
    Ouro: row.valorOuro || undefined,
    Diamante: row.valorDiamante || undefined,
    "Diamante Plus": row.valorDiamantePlus || undefined,
  },
});

const toPlanosItem = (row: PlanosProductRow): Item => ({
  id: row.id_product.toString(),
  name: row.name,
  quantity: row.quantity,
  description: row.description,
  images: JSON.parse(row.image),
  targetScreen: row.targetScreen,
  category: row.category,
  planPrices: {
    Standard: row.valorStandard || undefined,
    Master: row.valorMaster || undefined,
    Prime: row.valorPrime || undefined,
  },
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

export const insertParqueProduct = (database: SQLiteDatabase, product: Item): void => {
  try {
    if (!product.name || !product.description || !product.images || !product.category) {
      throw new Error("Campos obrigatórios ausentes: " + JSON.stringify(product));
    }

    const values = {
      name: product.name,
      quantity: product.quantity || 0,
      description: product.description,
      image: JSON.stringify(product.images),
      category: product.category,
      valorBronze: product.planPrices?.Bronze || null,
      valorOuro: product.planPrices?.Ouro || null,
      valorDiamante: product.planPrices?.Diamante || null,
      valorDiamantePlus: product.planPrices?.["Diamante Plus"] || null,
    };

    console.log("Inserindo produto em itensParque com valores:", values);
    database.runSync(
      `INSERT INTO itensParque (name, quantity, description, image, category, valorBronze, valorOuro, valorDiamante, valorDiamantePlus) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        values.name,
        values.quantity,
        values.description,
        values.image,
        values.category,
        values.valorBronze,
        values.valorOuro,
        values.valorDiamante,
        values.valorDiamantePlus,
      ]
    );
    console.log("Produto inserido com sucesso em itensParque:", product);
  } catch (error) {
    console.error("Erro ao inserir produto em itensParque:", error);
    throw error;
  }
};

export const insertPlanosProduct = (database: SQLiteDatabase, product: Item): void => {
  try {
    if (!product.name || !product.description || !product.images || !product.category) {
      throw new Error("Campos obrigatórios ausentes: " + JSON.stringify(product));
    }

    const values = {
      name: product.name,
      quantity: product.quantity || 0,
      description: product.description,
      image: JSON.stringify(product.images),
      category: product.category,
      valorStandard: product.planPrices?.Standard || null,
      valorMaster: product.planPrices?.Master || null,
      valorPrime: product.planPrices?.Prime || null,
    };

    console.log("Inserindo produto em itensPlanos com valores:", values);
    database.runSync(
      `INSERT INTO itensPlanos (name, quantity, description, image, category, valorStandard, valorMaster, valorPrime) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        values.name,
        values.quantity,
        values.description,
        values.image,
        values.category,
        values.valorStandard,
        values.valorMaster,
        values.valorPrime,
      ]
    );
    console.log("Produto inserido com sucesso em itensPlanos:", product);
  } catch (error) {
    console.error("Erro ao inserir produto em itensPlanos:", error);
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

export const getParqueProducts = (database: SQLiteDatabase): Item[] => {
  try {
    console.log("Buscando produtos da tabela itensParque...");
    const rows = database.getAllSync<ParqueProductRow>(
      `SELECT * FROM itensParque WHERE targetScreen = 'Parque'`
    );
    const products = rows.map(toParqueItem);
    console.log("Produtos encontrados em itensParque:", products);
    return products;
  } catch (error) {
    console.error("Erro ao buscar produtos em itensParque:", error);
    throw error;
  }
};

export const getPlanosProducts = (database: SQLiteDatabase): Item[] => {
  try {
    console.log("Buscando produtos da tabela itensPlanos...");
    const rows = database.getAllSync<PlanosProductRow>(
      `SELECT * FROM itensPlanos WHERE targetScreen = 'Planos'`
    );
    const products = rows.map(toPlanosItem);
    console.log("Produtos encontrados em itensPlanos:", products);
    return products;
  } catch (error) {
    console.error("Erro ao buscar produtos em itensPlanos:", error);
    throw error;
  }
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

export const updateParqueProduct = (
  database: SQLiteDatabase,
  id: string,
  product: Partial<Item>
): void => {
  try {
    console.log("Atualizando produto em itensParque ID:", id, "com dados:", product);
    database.runSync(
      `UPDATE itensParque SET 
        name = ?, 
        quantity = ?, 
        description = ?, 
        image = ?, 
        category = ?, 
        valorBronze = ?, 
        valorOuro = ?, 
        valorDiamante = ?, 
        valorDiamantePlus = ?
       WHERE id_product = ?`,
      [
        product.name || null,
        product.quantity || 0,
        product.description || null,
        product.images ? JSON.stringify(product.images) : null,
        product.category || null,
        product.planPrices?.Bronze || null,
        product.planPrices?.Ouro || null,
        product.planPrices?.Diamante || null,
        product.planPrices?.["Diamante Plus"] || null,
        id,
      ]
    );
    console.log("Produto atualizado com sucesso em itensParque:", { id, ...product });
  } catch (error) {
    console.error("Erro ao atualizar produto em itensParque:", error);
    throw error;
  }
};

export const updatePlanosProduct = (
  database: SQLiteDatabase,
  id: string,
  product: Partial<Item>
): void => {
  try {
    console.log("Atualizando produto em itensPlanos ID:", id, "com dados:", product);
    database.runSync(
      `UPDATE itensPlanos SET 
        name = ?, 
        quantity = ?, 
        description = ?, 
        image = ?, 
        category = ?, 
        valorStandard = ?, 
        valorMaster = ?, 
        valorPrime = ?
       WHERE id_product = ?`,
      [
        product.name || null,
        product.quantity || 0,
        product.description || null,
        product.images ? JSON.stringify(product.images) : null,
        product.category || null,
        product.planPrices?.Standard || null,
        product.planPrices?.Master || null,
        product.planPrices?.Prime || null,
        id,
      ]
    );
    console.log("Produto atualizado com sucesso em itensPlanos:", { id, ...product });
  } catch (error) {
    console.error("Erro ao atualizar produto em itensPlanos:", error);
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

export const deleteParqueProduct = (database: SQLiteDatabase, id: string): void => {
  try {
    console.log("Deletando produto da tabela itensParque ID:", id);
    database.runSync(`DELETE FROM itensParque WHERE id_product = ?`, [id]);
    console.log("Produto deletado com sucesso da tabela itensParque:", id);
  } catch (error) {
    console.error("Erro ao deletar produto em itensParque:", error);
    throw error;
  }
};

export const deletePlanosProduct = (database: SQLiteDatabase, id: string): void => {
  try {
    console.log("Deletando produto da tabela itensPlanos ID:", id);
    database.runSync(`DELETE FROM itensPlanos WHERE id_product = ?`, [id]);
    console.log("Produto deletado com sucesso da tabela itensPlanos:", id);
  } catch (error) {
    console.error("Erro ao deletar produto em itensPlanos:", error);
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

export const getParqueProductById = (
  database: SQLiteDatabase,
  id: string
): Item | null => {
  try {
    console.log("Buscando produto em itensParque por ID:", id);
    const row = database.getFirstSync<ParqueProductRow>(
      `SELECT * FROM itensParque WHERE id_product = ?`,
      [id]
    );
    if (!row) {
      console.log("Produto não encontrado em itensParque para ID:", id);
      return null;
    }
    const product = toParqueItem(row);
    console.log("Produto encontrado em itensParque:", product);
    return product;
  } catch (error) {
    console.error("Erro ao buscar produto em itensParque por ID:", error);
    throw error;
  }
};

export const getPlanosProductById = (
  database: SQLiteDatabase,
  id: string
): Item | null => {
  try {
    console.log("Buscando produto em itensPlanos por ID:", id);
    const row = database.getFirstSync<PlanosProductRow>(
      `SELECT * FROM itensPlanos WHERE id_product = ?`,
      [id]
    );
    if (!row) {
      console.log("Produto não encontrado em itensPlanos para ID:", id);
      return null;
    }
    const product = toPlanosItem(row);
    console.log("Produto encontrado em itensPlanos:", product);
    return product;
  } catch (error) {
    console.error("Erro ao buscar produto em itensPlanos por ID:", error);
    throw error;
  }
};

export const getOrCreateUser = (
  db: SQLiteDatabase,
  customerName: string,
  cpf: string,
  cep: string,
  address: string,
  number: string,
  neighborhood: string,
  city: string,
  state: string
): number => {
  console.log("Verificando/inserindo usuário com CPF:", cpf);
  let userId = db.getFirstSync("SELECT id FROM users WHERE cpf = ?", [cpf])?.id;

  if (!userId) {
    const result = db.runSync(
      `INSERT INTO users (customerName, cpf, cep, address, number, neighborhood, city, state) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerName, cpf, cep, address, number, neighborhood, city, state]
    );
    userId = result.lastInsertRowId;
    console.log("Usuário inserido com ID:", userId);
  } else {
    console.log("Usuário existente encontrado com ID:", userId);
  }

  return userId;
};

export const getOrCreatePaymentTypeId = (
  db: SQLiteDatabase,
  userId: number,
  paymentTypeName: string
): number => {
  console.log(`Verificando/inserindo tipo de pagamento '${paymentTypeName}' para userId: ${userId}`);
  let paymentTypeId = db.getFirstSync<{ id: number }>(
    "SELECT id FROM payment_types WHERE userId = ? AND name = ?",
    [userId, paymentTypeName]
  )?.id;

  if (!paymentTypeId) {
    const result = db.runSync(
      `INSERT INTO payment_types (userId, name) VALUES (?, ?)`,
      [userId, paymentTypeName]
    );
    paymentTypeId = result.lastInsertRowId;
    console.log(`Tipo de pagamento '${paymentTypeName}' inserido com ID: ${paymentTypeId}`);
  } else {
    console.log(`Tipo de pagamento '${paymentTypeName}' existente encontrado com ID: ${paymentTypeId}`);
  }

  return paymentTypeId;
};

export const saveOrder = (
  db: SQLiteDatabase,
  userId: number,
  paymentTypeName: string,
  installments: number | null,
  cartItems: any,
  total: number
) => {
  const createdAt = new Date().toISOString();
  const cartItemsJson = JSON.stringify(cartItems);
  const paymentTypeId = getOrCreatePaymentTypeId(db, userId, paymentTypeName);

  console.log("Executando inserção no banco com:", {
    userId,
    paymentTypeId,
    installments,
    cartItemsJson,
    total,
    createdAt,
  });

  db.runSync(
    `INSERT INTO orders (userId, paymentTypeId, installments, cartItems, total, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, paymentTypeId, installments, cartItemsJson, total, createdAt]
  );

  console.log("Inserção concluída.");
};

export const getAllOrders = (db: SQLiteDatabase): Sale[] => {
  console.log("Buscando todas as ordens...");
  const results = db.getAllSync<OrderRow>(
    `SELECT 
      o.id, 
      o.createdAt AS date, 
      o.cartItems AS items, 
      o.total, 
      pt.name AS paymentTypeName, 
      o.installments,
      u.customerName, 
      u.cpf, 
      u.cep, 
      u.address, 
      u.number, 
      u.neighborhood, 
      u.city, 
      u.state 
    FROM orders o
    LEFT JOIN users u ON o.userId = u.id
    LEFT JOIN payment_types pt ON o.paymentTypeId = pt.id
    ORDER BY o.createdAt DESC`
  );

  console.log("Resultados brutos do banco:", results);

  return results.map((row) => ({
    id: row.id.toString(),
    date: row.date,
    items: row.items ? JSON.parse(row.items) : [],
    total: row.total,
    paymentTypeName: row.paymentTypeName,
    installments: row.installments,
    customerName: row.customerName,
    cpf: row.cpf,
    cep: row.cep,
    address: row.address,
    number: row.number,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
  }));
};