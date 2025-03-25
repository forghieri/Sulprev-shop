// types.ts
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
  price?: string; // Usado para itens da tabela 'products'
  planPrices?: { [key: string]: string }; // Usado para itens de 'itensParque' e 'itensPlanos'
  description: string;
  images: string[];
  targetScreen: string;
  category: string;
  selectedPlan?: string; // Adicionado para suportar o plano selecionado no carrinho
}

export interface ProductRow {
  id_product: number;
  name: string;
  quantity: number;
  price: string | null;
  description: string;
  image: string; // String JSON contendo array de URLs de imagens
  targetScreen: string;
  planPrices: string | null; // String JSON contendo preços por plano, se aplicável
  category: string;
}

export interface ParqueProductRow {
  id_product: number;
  name: string;
  quantity: number;
  description: string;
  image: string; // String JSON contendo array de URLs de imagens
  targetScreen: string;
  category: string;
  valorBronze: string | null;
  valorOuro: string | null;
  valorDiamante: string | null;
  valorDiamantePlus: string | null;
}

export interface PlanosProductRow {
  id_product: number;
  name: string;
  quantity: number;
  description: string;
  image: string; // String JSON contendo array de URLs de imagens
  targetScreen: string;
  category: string;
  valorStandard: string | null;
  valorMaster: string | null;
  valorPrime: string | null;
}