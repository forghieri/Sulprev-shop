import React, { useCallback, useMemo, useRef, useEffect } from "react";
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
import { useCart } from "../utils/CartContext";

type ShopRouteProp = RouteProp<ModelsRoutes, "Shop">;
type ShopNavigationProp = DrawerNavigationProp<ModelsRoutes, "Shop">;

type CartItem = Item & { quantity: number; selectedPlan?: string };

const { width } = Dimensions.get("window");
const ITEM_WIDTH = Math.min(width * 0.9, 400);

const trashIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 11V17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 11V17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

const CartItemComponent = React.memo(({ item, onRemove, onIncrease, onDecrease }: {
  item: CartItem;
  onRemove: (id: string, selectedPlan?: string) => void;
  onIncrease: (id: string, selectedPlan?: string) => void;
  onDecrease: (id: string, selectedPlan?: string) => void;
}) => {
  console.log(`Renderizando item no carrinho: ${item.name}`);
  if (!item || !item.id) return <Text>Item inválido</Text>;

  const itemPrice = item.selectedPlan && item.planPrices && ["Parque", "Planos"].includes(item.targetScreen)
    ? item.planPrices[item.selectedPlan as keyof typeof item.planPrices] || "Preço indisponível"
    : item.price || "Preço indisponível";
  
  const parsePriceToNumber = (price: string): number => {
    const cleanedPrice = price.replace(/R\$\s*/g, "").replace(/\s/g, "").trim();
    const parsed = parseFloat(
      cleanedPrice.includes(".") && cleanedPrice.includes(",")
        ? cleanedPrice.replace(/\./g, "").replace(",", ".")
        : cleanedPrice.replace(",", ".")
    );
    return isNaN(parsed) ? 0 : parsed;
  };

  const subtotalValue = parsePriceToNumber(itemPrice) * item.quantity;
  const formattedSubtotal = formatPrice(subtotalValue);

  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.images[0] || "" }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <View style={styles.headerContainer}>
          <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
          <TouchableOpacity
            style={styles.trashButton}
            onPress={() =>
              Alert.alert(
                "Remover",
                `Deseja remover ${item.name} (${item.selectedPlan || "Sem plano"}) do carrinho?`,
                [
                  { text: "Cancelar" },
                  { text: "Sim", onPress: () => onRemove(item.id, item.selectedPlan) },
                ]
              )
            }
          >
            <SvgXml xml={trashIcon} width={24} height={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemPrice}>
          Und. ({item.selectedPlan || "Padrão"}): {itemPrice}
        </Text>
        <Text style={styles.itemSubtotal}>Subtotal: {formattedSubtotal}</Text>
        <Text style={styles.itemTag}>Origem: {item.targetScreen || "Desconhecida"}</Text>
        {item.selectedPlan && (
          <Text style={styles.itemTag}>Plano: {item.selectedPlan}</Text>
        )}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onDecrease(item.id, item.selectedPlan)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onIncrease(item.id, item.selectedPlan)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
         prevProps.item.quantity === nextProps.item.quantity &&
         prevProps.item.selectedPlan === nextProps.item.selectedPlan;
});

export default function Shop() {
  const route = useRoute<ShopRouteProp>();
  const navigation = useNavigation<ShopNavigationProp>();
  const { cartItems, setCartItems, loadCartItems } = useCart();
  const hasLoadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        console.log("Tela já foi carregada anteriormente, ignorando");
        return;
      }
      console.log("Tela focada: carregando carrinho e verificando pedidos pendentes");
      hasLoadedRef.current = true;

      loadCartItems()
        .then(() => console.log("loadCartItems concluído"))
        .catch((err) => console.error("Erro em loadCartItems:", err));

      const pendingOrdersCheck = initPendingOrdersCheck();
      if (pendingOrdersCheck && typeof pendingOrdersCheck.then === "function") {
        pendingOrdersCheck
          .then(() => console.log("initPendingOrdersCheck concluído"))
          .catch((err) => console.error("Erro em initPendingOrdersCheck:", err));
      } else {
        console.log("initPendingOrdersCheck não é assíncrono, executado diretamente");
      }

      return () => {
        console.log("Tela desfocada");
      };
    }, [loadCartItems])
  );

  useEffect(() => {
    console.log("cartItems mudou:", JSON.stringify(cartItems));
  }, [cartItems]);

  React.useEffect(() => {
    const { selectedItem, selectedPlan } = route.params || {};
    if (!selectedItem || !selectedPlan) return;

    console.log(`Adicionando novo item: ${selectedItem.name}`);
    const newItem: CartItem = { ...selectedItem, quantity: 1, selectedPlan };
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id && item.selectedPlan === newItem.selectedPlan
      );
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch((error) =>
          console.error("Erro ao salvar carrinho:", error)
        );
        return updatedItems;
      }
      const updatedItems = [...prevItems, newItem];
      AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch((error) =>
        console.error("Erro ao salvar carrinho:", error)
      );
      return updatedItems;
    });
    navigation.setParams({ selectedItem: undefined, selectedPlan: undefined });
  }, [route.params?.selectedItem, route.params?.selectedPlan, navigation, setCartItems]);

  const parsePriceToNumber = (price: string | number | undefined): number => {
    if (!price) return 0;
    if (typeof price === "number") return isNaN(price) ? 0 : price;
    const cleanedPrice = price.replace(/R\$\s*/g, "").replace(/\s/g, "").trim();
    const parsed = parseFloat(
      cleanedPrice.includes(".") && cleanedPrice.includes(",")
        ? cleanedPrice.replace(/\./g, "").replace(",", ".")
        : cleanedPrice.replace(",", ".")
    );
    return isNaN(parsed) ? 0 : parsed;
  };

  const getItemPrice = (item: CartItem): string => {
    if (item.selectedPlan && item.planPrices && ["Parque", "Planos"].includes(item.targetScreen)) {
      return item.planPrices[item.selectedPlan as keyof typeof item.planPrices] || "Preço indisponível";
    }
    return item.price || "Preço indisponível";
  };

  const calculateTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = parsePriceToNumber(getItemPrice(item));
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const increaseQuantity = (itemId: string, selectedPlan?: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId && item.selectedPlan === selectedPlan
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch((error) =>
        console.error("Erro ao salvar carrinho:", error)
      );
      return updatedItems;
    });
  };

  const decreaseQuantity = (itemId: string, selectedPlan?: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId && item.selectedPlan === selectedPlan && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      AsyncStorage.setItem("cart", JSON.stringify(updatedItems)).catch((error) =>
        console.error("Erro ao salvar carrinho:", error)
      );
      return updatedItems;
    });
  };

  const removeItem = (itemId: string, selectedPlan?: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (item) => !(item.id === itemId && item.selectedPlan === selectedPlan)
      );
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
    navigation.navigate("Checkout", { cartItems, total: calculateTotal });
  };

  const formattedTotal = formatPrice(calculateTotal);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrinho</Text>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => `${item.id}-${item.selectedPlan || "no-plan"}`}
            renderItem={({ item }) => (
              <CartItemComponent
                item={item}
                onRemove={removeItem}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: {formattedTotal}</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
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
    textAlign: "center",
  },
  cartItem: {
    flexDirection: "row",
    width: "100%",
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
    position: "relative", // Necessário para o posicionamento absoluto do quantityContainer
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    flexDirection: "column",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
    numberOfLines: 2,
    ellipsizeMode: "tail",
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