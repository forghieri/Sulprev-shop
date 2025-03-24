export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
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

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price?: string;
  planPrices?: { [key: string]: string };
  description: string;
  images: string[];
  targetScreen: string;
  category: string;
}

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