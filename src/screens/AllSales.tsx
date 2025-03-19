// src/screens/AllSales.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { formatPrice } from "../utils/formatPrice";

type SaleItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
};

type Sale = {
  id: string;
  items: SaleItem[];
  total: number;
  date: string;
};

export default function AllSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<"today" | "7days" | "30days" | "all">("all");
  const navigation = useNavigation();

  const loadSales = async () => {
    try {
      const savedSales = await AsyncStorage.getItem("sales");
      if (savedSales) {
        const parsedSales: Sale[] = JSON.parse(savedSales);
        parsedSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSales(parsedSales);
      }
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadSales();
    }, [])
  );

  const filterSales = () => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      const diffInDays = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);

      switch (filter) {
        case "today":
          return saleDate.toDateString() === now.toDateString();
        case "7days":
          return diffInDays <= 7;
        case "30days":
          return diffInDays <= 30;
        case "all":
        default:
          return true;
      }
    });
  };

  const renderSaleItem = ({ item }: { item: Sale }) => (
    <View style={styles.saleCard}>
      <Text style={styles.saleDate}>
        {new Date(item.date).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      {item.items.map((saleItem) => (
        <View key={saleItem.id} style={styles.itemContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.quantityBox}>{saleItem.quantity}x</Text>
            <Text style={styles.saleItemName}>{saleItem.name}</Text>
          </View>
          <Text style={styles.saleItemPrice}>{formatPrice(saleItem.price)}</Text>
        </View>
      ))}
      <Text style={styles.saleTotal}>
        Total: R$ {item.total.toFixed(2).replace(".", ",")}
      </Text>
    </View>
  );

  const filteredSales = filterSales();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todas as Vendas</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "today" && styles.activeFilterButton,
          ]}
          onPress={() => setFilter("today")}
        >
          <Text style={styles.filterText}>Hoje</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "7days" && styles.activeFilterButton,
          ]}
          onPress={() => setFilter("7days")}
        >
          <Text style={styles.filterText}>7 Dias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "30days" && styles.activeFilterButton,
          ]}
          onPress={() => setFilter("30days")}
        >
          <Text style={styles.filterText}>30 Dias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.activeFilterButton,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text style={styles.filterText}>Tudo</Text>
        </TouchableOpacity>
      </View>
      {filteredSales.length > 0 ? (
        <FlatList
          data={filteredSales}
          keyExtractor={(item) => item.id}
          renderItem={renderSaleItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.empty}>Nenhuma venda registrada para este período.</Text>
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
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: "#808080",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  activeFilterButton: {
    backgroundColor: "#007BFF",
  },
  filterText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  saleCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saleDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    textAlign: "right",
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityBox: {
    fontSize: 18, // Tamanho maior
    fontWeight: "bold",
    color: "#D81B60", // Rosa escuro para destacar
    backgroundColor: "#E3F2FD", // Azul claro (#E3F2FD)
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 5,
    textAlign: "center",
    minWidth: 30, // Garante um tamanho quadrado mínimo
  },
  saleItemName: {
    fontSize: 16,
    color: "#333",
    textAlign: "left",
  },
  saleItemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textAlign: "right",
  },
  saleTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "right",
    marginTop: 10,
  },
  empty: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});