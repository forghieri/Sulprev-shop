export interface Item {
  
  id: string;
  name: string;
  quantity: number;
  category: string;
  description: string;
  images: string[];
  targetScreen: string;
  price?: string;
  planPrices?: {
    Bronze: string;
    Ouro: string;
    Diamante: string;
    "Diamante Plus": string;
  };
}