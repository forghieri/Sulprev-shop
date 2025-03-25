import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Item } from "../models/Item";
import { initDatabase } from "../database/init";
import { getParqueProducts, deleteParqueProduct } from "../database/itemRepository";
import ProductCard from "../components/ProductCard";
import styles from "../styles/ProductCardStyles";
import { ModelsRoutes } from "../routes/modelRoutes";
import { showItemAddedToast } from "../utils/toastUtils";

type ParqueNavigationProp = DrawerNavigationProp<ModelsRoutes, "Parque">;

const plans = ["Bronze", "Ouro", "Diamante", "Diamante Plus"];

export default function Parque() {
  const navigation = useNavigation<ParqueNavigationProp>();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(plans[0]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const db = await initDatabase();
        const loadedItems = await getParqueProducts(db);
        setItems(loadedItems);
        console.log("Itens carregados da tabela itensParque:", loadedItems);
      } catch (error) {
        console.error("Erro ao carregar itens em Parque:", error);
        setItems([]);
      }
    };
    loadItems();
  }, [isFocused]);

  const handleAddToCart = (item: Item) => {
    console.log(`Adicionando ao carrinho: ${item.name} com plano ${selectedPlan}`);
    navigation.navigate("Shop", { selectedItem: item, selectedPlan });
    showItemAddedToast();
  };

  const handleLongPress = (item: Item) => {
    Alert.alert(
      item.name,
      "Escolha uma opção:",
      [
        {
          text: "Informações",
          onPress: () =>
            Alert.alert(
              item.name,
              `Quantidade: ${item.quantity}\nPreço (${selectedPlan}): ${item.planPrices![selectedPlan as keyof typeof item.planPrices] || "Indisponível"}`
            ),
        },
        {
          text: "Editar",
          onPress: () => navigation.navigate("NewItem", { itemToEdit: item, id: item.id }),
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const db = await initDatabase();
              await deleteParqueProduct(db, item.id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
              Alert.alert("Sucesso", `${item.name} foi excluído.`);
            } catch (error) {
              console.error("Erro ao excluir item da tabela itensParque:", error);
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
      selectedPlan={selectedPlan}
      onLongPress={() => handleLongPress(item)}
      onAddToCart={() => handleAddToCart(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planos - Parque</Text>
      <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 15,
              borderRadius: 20,
              margin: 5,
              backgroundColor: selectedPlan === plan ? "#007BFF" : "#808080",
            }}
            onPress={() => setSelectedPlan(plan)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>{plan}</Text>
          </TouchableOpacity>
        ))}
      </View>
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