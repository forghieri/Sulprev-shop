// src/utils/homeUtils.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { Dispatch, SetStateAction } from "react";
import { Item } from "../models/Item";

export const loadProducts = async (setProducts: Dispatch<SetStateAction<Item[]>>): Promise<void> => {
  try {
    const storedProducts = await AsyncStorage.getItem("products");
    if (storedProducts) {
      const parsedProducts: Item[] = JSON.parse(storedProducts).map((item: Item) => ({
        ...item,
        category: item.category || "Sem Categoria",
      }));
      setProducts(parsedProducts);
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
};

export const addNewProduct = async (
  products: Item[],
  newItem: Item,
  setProducts: Dispatch<SetStateAction<Item[]>>
): Promise<void> => {
  try {
    const updatedProducts = [...products, newItem];
    setProducts(updatedProducts);
    await AsyncStorage.setItem("products", JSON.stringify(updatedProducts));
  } catch (error) {
    console.error("Erro ao salvar produtos:", error);
  }
};

export const updateProduct = async (
  products: Item[],
  id: string, // Alterado para usar id em vez de index
  updatedItem: Item,
  setProducts: Dispatch<SetStateAction<Item[]>>
): Promise<void> => {
  try {
    const updatedProducts = products.map((item) =>
      item.id === id ? updatedItem : item
    );
    setProducts(updatedProducts);
    await AsyncStorage.setItem("products", JSON.stringify(updatedProducts));
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
  }
};

export const removeProduct = async (
  products: Item[],
  id: string, // Alterado para usar id em vez de index
  setProducts: Dispatch<SetStateAction<Item[]>>
): Promise<void> => {
  try {
    const updatedProducts = products.filter((item) => item.id !== id);
    setProducts(updatedProducts);
    await AsyncStorage.setItem("products", JSON.stringify(updatedProducts));
  } catch (error) {
    console.error("Erro ao remover produto:", error);
  }
};

export const handleImageClick = (
  images: string[],
  setSelectedImages: Dispatch<SetStateAction<string[]>>,
  setModalVisible: Dispatch<SetStateAction<boolean>>
): void => {
  setSelectedImages(images);
  setModalVisible(true);
};

export const handleMenuPress = (
  id: string, // Alterado para usar id em vez de index
  products: Item[],
  setProducts: Dispatch<SetStateAction<Item[]>>,
  navigation: any
): void => {
  Alert.alert(
    "Opções",
    "Escolha uma ação para este item",
    [
      {
        text: "Editar",
        onPress: () => {
          const itemToEdit = products.find((item) => item.id === id);
          if (itemToEdit) {
            console.log("Navigating to NewItem with:", { itemToEdit, id }); // Log para depuração
            navigation.navigate("NewItem", { itemToEdit, id });
          } else {
            console.error("Item não encontrado para o id:", id);
          }
        },
      },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => removeProduct(products, id, setProducts),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ],
    { cancelable: true }
  );
};