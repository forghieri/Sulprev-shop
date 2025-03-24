import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Defina a tipagem para o item do carrinho
type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: string;
  description: string;
  images: string[];
  targetScreen: string;
  category: string;
};

// Defina a tipagem para o valor do contexto
interface CartContextType {
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  loadCartItems: () => Promise<void>;
  clearCart: () => Promise<void>;
}

// Crie o contexto com um valor padrão (pode ser undefined inicialmente)
const CartContext = createContext<CartContextType | undefined>(undefined);

// Props para o CartProvider
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCartItems = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart) {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      setCartItems([]);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.setItem("cart", JSON.stringify([]));
    console.log("Carrinho zerado.");
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, loadCartItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para usar o contexto com verificação de segurança
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}