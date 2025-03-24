import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { initDatabase } from "../database/init";
import { getAllOrders } from "../database/itemRepository";
import { formatPrice } from "../utils/formatPrice";
import { Sale, SaleItem } from "../database/types";

export default function AllSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<"today" | "7days" | "30days" | "all">("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const navigation = useNavigation();

  const loadSales = () => {
    try {
      console.log("Carregando vendas...");
      const database = initDatabase();
      const orders = getAllOrders(database);
      console.log("Vendas carregadas:", orders);
      setSales(orders);
      console.log("Estado sales atualizado com:", orders);
    } catch (error) {
      console.error("Erro ao carregar vendas do banco:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log("useFocusEffect disparado");
      loadSales();
    }, [])
  );

  const filterSales = useMemo(() => {
    const now = new Date();
    console.log("Filtrando vendas com filtro:", filter);
    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      const diffInDays = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
      console.log(`Venda ${sale.id}: Data=${sale.date}, Diferença=${diffInDays} dias`);

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
    console.log("Vendas filtradas:", filtered);
    return filtered;
  }, [sales, filter]);

  const renderSaleItem = ({ item }: { item: Sale }) => {
    console.log("Renderizando venda:", item);
    return (
      <TouchableOpacity
        style={styles.saleCard}
        onPress={() => {
          setSelectedSale(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.saleDate}>
          {new Date(item.date).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {item.items.map((saleItem, index) => {
          console.log("Renderizando item da venda:", saleItem);
          const displayPrice =
            saleItem.price ||
            (saleItem.planPrices ? Object.values(saleItem.planPrices)[0] : "Não disponível");
          return (
            <View key={`${saleItem.id}-${index}`} style={styles.itemContainer}>
              <View style={styles.nameContainer}>
                <Text style={styles.quantityBox}>{saleItem.quantity}x</Text>
                <Text style={styles.saleItemName}>{saleItem.name}</Text>
              </View>
              <Text style={styles.saleItemPrice}>{formatPrice(displayPrice)}</Text>
            </View>
          );
        })}
        <Text style={styles.saleTotal}>
          Total: R$ {item.total.toFixed(2).replace(".", ",")}
        </Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    console.log("Componente AllSales renderizado");
  });

  console.log("Estado sales antes da renderização:", sales);
  console.log("FilteredSales antes da renderização:", filterSales);

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
      {filterSales.length > 0 ? (
        <FlatList
          data={filterSales}
          keyExtractor={(item) => item.id}
          renderItem={renderSaleItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.empty}>Nenhuma venda registrada para este período.</Text>
      )}

      {/* Modal para exibir detalhes do cliente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Detalhes da Venda</Text>
              {selectedSale && (
                <>
                  <Text style={styles.modalSectionTitle}>Informações do Cliente</Text>
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>Nome:</Text> {selectedSale.customerName}
                  </Text>
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>CPF:</Text> {selectedSale.cpf}
                  </Text>
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>CEP:</Text> {selectedSale.cep}
                  </Text>
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>Endereço:</Text> {selectedSale.address}, {selectedSale.number}
                  </Text>
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>Bairro:</Text> {selectedSale.neighborhood}
                  </Text>
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>Cidade:</Text> {selectedSale.city} - {selectedSale.state}
                  </Text>
                  <Text style={styles.modalSectionTitle}>Resumo da Venda</Text>
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>Data:</Text>{" "}
                    {new Date(selectedSale.date).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>Forma de Pagamento:</Text> {selectedSale.paymentTypeName}
                  </Text>
                  {selectedSale.installments && (
                    <Text style={styles.modalDetail}>
                      <Text style={styles.labelBold}>Parcelas:</Text> {selectedSale.installments}x
                    </Text>
                  )}
                  <Text style={styles.modalDetail}>
                    <Text style={styles.labelBold}>Total:</Text> R$ {selectedSale.total.toFixed(2).replace(".", ",")}
                  </Text>
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#D81B60",
    backgroundColor: "#E3F2FD",
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 5,
    textAlign: "center",
    minWidth: 30,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#007BFF",
    marginTop: 10,
    marginBottom: 10,
  },
  modalDetail: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  labelBold: {
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 15,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});