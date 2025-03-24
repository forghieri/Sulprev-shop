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
  export type SaleItem = {
    id: string;
    name: string;
    price?: string;
    quantity: number;
    description: string;
    images: string[];
    targetScreen: string;
    category: string;
    planPrices?: { [key: string]: string };
  };
  
  export type Sale = {
    id: string;
    items: SaleItem[];
    total: number;
    date: string;
  };

  