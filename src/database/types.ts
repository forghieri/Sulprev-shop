// src/database/types.ts
export interface ProductRow {
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