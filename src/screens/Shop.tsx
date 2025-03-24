import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { RouteProp, useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ModelsRoutes } from "../routes/modelRoutes";
import { Item } from "../models/Item";
import { formatPrice } from "../utils/formatPrice";
import { sendOrder, initPendingOrdersCheck } from "../utils/sendOrder";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useCart } from "../utils/CartContext"; // Importe o hook do contexto

type ShopRouteProp = RouteProp<ModelsRoutes, "Shop">;
type ShopNavigationProp = DrawerNavigationProp<ModelsRoutes, "Shop">;

type CartItem = Item & { quantity: number };

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.8;

const trashIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 11V17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 11V17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

export default function Shop() {
  const route = useRoute<ShopRouteProp>();
  const navigation = useNavigation<ShopNavigationProp>();
  const { cartItems, setCartItems, loadCartItems } = useCart(); // Use o contexto
  const [selectedPlan] = React.useState<string>("Bronze");

  useFocusEffect(
    useCallback(() => {
      loadCartItems();
      initPendingOrdersCheck();
    }, [loadCartItems])
  );

  React.useEffect(() => {
    if (route.params?.selectedItem) {
      console.log("Item recebido no Shop via params:", route.params.selectedItem);
      const newItem = { ...route.params.selectedItem, quantity: 1 };
      setCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);
        let updatedItems = [...prevItems];
        if (existingItemIndex >= 0) {
          updatedItems[existingItemIndex].quantity += 1;
        } else {
          updatedItems = [...prevItems, newItem];
        }
        AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch((error) =>
          console.error("Erro ao salvar carrinho:", error)
        );
        return updatedItems;
      });
      navigation.setParams({ selectedItem: undefined });
    }
  }, [route.params?.selectedItem, navigation, setCartItems]);

  const parsePriceToNumber = (price: string | number | undefined): number => {
    if (!price) return 0;
    if (typeof price === "number") return isNaN(price) ? 0 : price;
    const cleanedPrice = price
      .replace(/R\$\s*/g, "")
      .replace(/\s/g, "")
      .trim();
    const parsed = parseFloat(
      cleanedPrice.includes(".") && cleanedPrice.includes(",")
        ? cleanedPrice.replace(/\./g, "").replace(",", ".")
        : cleanedPrice.replace(",", ".")
    );
    return isNaN(parsed) ? 0 : parsed;
  };

  const getItemPrice = (item: CartItem): string => {
    if (item.targetScreen === "Parque" && item.planPrices && selectedPlan) {
      const planPrice = item.planPrices[selectedPlan as keyof typeof item.planPrices];
      console.log(`Preço do plano ${selectedPlan} para ${item.name}:`, planPrice);
      return planPrice || "Preço indisponível";
    }
    console.log(`Preço padrão para ${item.name}:`, item.price);
    return item.price || "Preço indisponível";
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = parsePriceToNumber(getItemPrice(item));
      const subtotal = price * item.quantity;
      return sum + subtotal;
    }, 0);
    console.log("Total calculado:", total);
    return total;
  };

  const increaseQuantity = (itemId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );
      AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch((error) =>
        console.error("Erro ao salvar carrinho:", error)
      );
      return updatedItems;
    });
  };

  const decreaseQuantity = (itemId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      );
      AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch((error) =>
        console.error("Erro ao salvar carrinho:", error)
      );
      return updatedItems;
    });
  };

  const removeItem = (itemId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== itemId);
      AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch((error) =>
        console.error("Erro ao salvar carrinho:", error)
      );
      return updatedItems;
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Carrinho Vazio", "Adicione itens ao carrinho antes de finalizar.");
      return;
    }
    const total = calculateTotal();
    console.log("Navegando para Checkout com:", { cartItems, total });
    navigation.navigate("Checkout", { cartItems, total }); // Removido clearCart
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    console.log("Renderizando item no carrinho:", item);
    if (!item || !item.id) {
      console.warn("Item inválido encontrado:", item);
      return <Text>Item inválido</Text>;
    }

    const itemPrice = getItemPrice(item);
    const subtotalValue = parsePriceToNumber(itemPrice) * item.quantity;
    const formattedSubtotal = formatPrice(subtotalValue);

    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.images[0] || "" }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <View style={styles.headerContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.trashButton}
              onPress={() =>
                Alert.alert(
                  "Remover",
                  `Deseja remover ${item.name} do carrinho?`,
                  [
                    { text: "Cancelar" },
                    { text: "Sim", onPress: () => removeItem(item.id) },
                  ]
                )
              }
            >
              <SvgXml xml={trashIcon} width={24} height={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemPrice}>Und.{itemPrice}</Text>
          <Text style={styles.itemSubtotal}>Subtotal: {formattedSubtotal}</Text>
          <Text style={styles.itemTag}>Origem: {item.targetScreen || "Desconhecida"}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => decreaseQuantity(item.id)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => increaseQuantity(item.id)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const total = calculateTotal();
  const formattedTotal = formatPrice(total);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrinho</Text>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={renderCartItem}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: {formattedTotal}</Text>
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

// Estilos permanecem os mesmos
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
    textAlign: "center",
  },
  cartItem: {
    flexDirection: "row",
    width: ITEM_WIDTH,
    alignSelf: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  itemSubtotal: {
    fontSize: 14,
    color: "#28A745",
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemTag: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  quantityButton: {
    width: 25,
    height: 25,
    backgroundColor: "#007BFF",
    borderRadius: 12.5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 5,
  },
  trashButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
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