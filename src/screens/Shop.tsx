// src/screens/Shop.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ModelsRoutes } from "../routes/modelRoutes";
import { Item } from "../models/Item";
import { formatPrice } from "../utils/formatPrice";

type ShopRouteProp = RouteProp<ModelsRoutes, "Shop">;
type ShopNavigationProp = DrawerNavigationProp<ModelsRoutes, "Shop">;

type CartItem = Item & { quantity: number };

export default function Shop() {
  const route = useRoute<ShopRouteProp>();
  const navigation = useNavigation<ShopNavigationProp>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {

    if (route.params?.selectedItem) {
      const newItem = { ...route.params.selectedItem, quantity: 1 };
      setCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.id === newItem.id
        );
        if (existingItemIndex >= 0) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += 1;
          return updatedItems;
        } else {
          return [...prevItems, newItem];
        }
      });
      navigation.setParams({ selectedItem: undefined });
    }
  }, [route.params?.selectedItem, navigation]);

  const parsePriceToNumber = (price: string): number => {
    const cleanedPrice = price
      .replace("R$ ", "")
      .replace(".", "")
      .replace(",", ".");
    return parseFloat(cleanedPrice) || 0;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parsePriceToNumber(item.price);
      return total + price * item.quantity;
    }, 0);
  };

  const increaseQuantity = (itemId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex((item) => item.id === itemId);
      if (itemIndex >= 0) {
        updatedItems[itemIndex].quantity += 1;
      }
      return updatedItems;
    });
  };

  const decreaseQuantity = (itemId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex((item) => item.id === itemId);
      if (itemIndex >= 0) {
        if (updatedItems[itemIndex].quantity > 1) {
          updatedItems[itemIndex].quantity -= 1;
        } else {
          updatedItems.splice(itemIndex, 1);
        }
      }
      return updatedItems;
    });
  };

  // Salva a venda no AsyncStorage
  const saveSale = async () => {
    const sale = {
      id: Date.now().toString(), // ID único baseado em timestamp
      items: cartItems,
      total: calculateTotal(),
      date: new Date().toISOString(), // Data da venda
    };
    try {
      const existingSales = await AsyncStorage.getItem("sales");
      const sales = existingSales ? JSON.parse(existingSales) : [];
      sales.push(sale);
      await AsyncStorage.setItem("sales", JSON.stringify(sales));

    } catch (error) {
      console.error("Erro ao salvar venda:", error);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Carrinho Vazio", "Adicione itens ao carrinho antes de finalizar.");
      return;
    }
    Alert.alert(
      "Confirmar Compra",
      `Total: R$ ${calculateTotal().toFixed(2).replace(".", ",")}\nDeseja finalizar a compra?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          onPress: async () => {
            await saveSale(); // Salva a venda antes de limpar
            setCartItems([]); // Limpa o carrinho
            Alert.alert("Compra Finalizada", "Sua compra foi concluída com sucesso!");
            navigation.navigate("AllSales"); // Navega para a tela de vendas
          },
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.decreaseButton}
          onPress={() => decreaseQuantity(item.id)}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}x</Text>
        <TouchableOpacity
          style={styles.increaseButton}
          onPress={() => increaseQuantity(item.id)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrinho</Text>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: R$ {calculateTotal().toFixed(2).replace(".", ",")}
            </Text>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.empty}>Nenhum item no carrinho ainda.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    color: "#666",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  decreaseButton: {
    backgroundColor: "#FF0000",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  increaseButton: {
    backgroundColor: "#28A745",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 20,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  totalContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  empty: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});