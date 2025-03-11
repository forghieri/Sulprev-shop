// src/routes/modelRoutes.ts
import { Item } from "../models/Item";

export type ModelsRoutes = {
  Home: { newItem?: Item; updatedProducts?: Item[] };
  AllSales: undefined;
  Shop: { selectedItem?: Item };
  NewItem: undefined;
};