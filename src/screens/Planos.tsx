import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Item } from "../models/Item";
import { initDatabase } from "../database/init";
import { getProductsByTargetScreen, deleteProduct } from "../database/itemRepository";
import ProductCard from "../components/ProductCard";
import styles from "../styles/ProductCardStyles";
import { ModelsRoutes } from "../routes/modelRoutes";
import { showItemAddedToast } from "../utils/toastUtils";

export default function Planos() {
  const [items, setItems] = useState<Item[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const db = await initDatabase();
        const loadedItems = await getProductsByTargetScreen(db, "Planos");
        setItems(loadedItems);
        console.log("Itens carregados para Planos:", loadedItems);
      } catch (error) {
        console.error("Erro ao carregar itens em Planos:", error);
        setItems([]);
      }
    };
    loadItems();
  }, [isFocused]);

  const handleAddToCart = (item: Item) => {
    console.log("Adicionando ao carrinho:", item.name);
    showItemAddedToast(); // Apenas exibe o toast, sem navegação
  };

  const handleLongPress = (item: Item) => {
    Alert.alert(
      item.name,
      "Escolha uma opção:",
      [
        {
          text: "Informações",
          onPress: () =>
            Alert.alert(item.name, `Quantidade: ${item.quantity}\nPreço: ${item.price || "Indisponível"}`),
        },
        {
          text: "Editar",
          onPress: () => navigation.navigate("NewItem" as keyof ModelsRoutes, { itemToEdit: item, id: item.id }),
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const db = await initDatabase();
              await deleteProduct(db, item.id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
              Alert.alert("Sucesso", `${item.name} foi excluído.`);
            } catch (error) {
              console.error("Erro ao excluir item:", error);
              Alert.alert("Erro", "Falha ao excluir o item.");
            }
          },
        },
        { text: "Cancelar", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <ProductCard
      item={item}
      onLongPress={handleLongPress}
      onAddToCart={handleAddToCart}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planos</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        numColumns={4}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum item encontrado.</Text>}
      />
    </View>
  );
}