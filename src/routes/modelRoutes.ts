import { Item } from "../models/Item";

export type ModelsRoutes = {
  Home: { newItem?: Item; updatedProducts?: Item[] };
  AllSales: undefined;
  Shop: { selectedItem?: Item };
  NewItem: undefined;
  Funeraria: undefined;
  Planos: undefined;
  Parque: undefined;
  Checkout: { cartItems: Item[]; total: number }; // Já está correto
};