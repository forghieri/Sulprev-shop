// src/models/RootStackParamList.ts
import { Item } from "./Item";

export type RootStackParamList = {
  Home: { newItem?: Item; updatedProducts?: Item[] };
  NewItem: { itemToEdit?: Item; index?: number } | undefined;
  Carrinho: { selectedItem: Item }; // Nova rota para o carrinho
};