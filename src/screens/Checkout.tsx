import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";
import { initializeDatabase } from "../database/itemSchema";
import { saveOrder } from "../database/itemRepository";
import { ModelsRoutes } from "../routes/modelRoutes";
import { useCart } from "../utils/CartContext";

type CheckoutRouteProp = {
  params: {
    cartItems: CartItem[];
    total: number;
  };
};

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price?: string;
  description: string;
  images: string[];
  targetScreen: string;
  category: string;
  planPrices?: { [key: string]: string };
};

const DATABASE_NAME = "app_database_v3.db";

export default function Checkout() {
  const navigation = useNavigation();
  const route = useRoute<CheckoutRouteProp>();
  const { cartItems, total } = route.params;
  const { clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  const formatCpf = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join(match[1] && match[2] ? "." : "")
        .replace(/(\d{3})(\d{3})$/, "$1-$2");
    }
    return text;
  };

  const formatCep = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,5})(\d{0,3})$/);
    if (match) {
      return [match[1], match[2]].filter(Boolean).join(match[1] ? "-" : "");
    }
    return text;
  };

  const fetchCepData = async (cepValue: string) => {
    const cleanedCep = cepValue.replace(/\D/g, "");
    if (cleanedCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setAddress(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      } else {
        Alert.alert("Erro", "CEP não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      Alert.alert("Erro", "Falha ao buscar dados do CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    console.log("Renderizando item no carrinho:", item);

    let priceValue = 0;
    if (item.price) {
      priceValue = parseFloat(item.price.replace("R$ ", "").replace(".", "").replace(",", "."));
    } else if (item.planPrices && Object.keys(item.planPrices).length > 0) {
      const firstPlan = Object.values(item.planPrices)[0];
      priceValue = parseFloat(firstPlan.replace("R$ ", "").replace(".", "").replace(",", "."));
    }
    const itemTotal = isNaN(priceValue) ? 0 : priceValue * item.quantity;

    return (
      <View style={styles.cartItem}>
        <Text style={styles.itemText}>{item.name}</Text>
        <Text style={styles.itemDetail}>Quantidade: {item.quantity}</Text>
        <Text style={styles.itemDetail}>
          Preço unitário: {item.price || (item.planPrices ? Object.values(item.planPrices)[0] : "Não disponível")}
        </Text>
        <Text style={styles.itemDetail}>Preço total: R$ {itemTotal.toFixed(2)}</Text>
      </View>
    );
  };

  const handleFinishOrder = () => {
    const cleanedCpf = cpf.replace(/\D/g, "");
    if (!customerName || !cleanedCpf || !cep || !address || !number || !city || !state) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }
    if (cleanedCpf.length !== 11) {
      Alert.alert("Erro", "O CPF deve conter 11 dígitos.");
      return;
    }

    try {
      console.log("Abrindo banco de dados para Checkout...");
      const database = SQLite.openDatabaseSync(DATABASE_NAME);
      if (!database) {
        throw new Error("Falha ao abrir o banco de dados: objeto nulo retornado.");
      }
      console.log("Banco de dados aberto com sucesso.");

      console.log("Inicializando tabelas para Checkout...");
      initializeDatabase(database);
      console.log("Tabelas inicializadas com sucesso.");

      console.log("Salvando pedido...");
      saveOrder(
        database,
        customerName,
        cleanedCpf,
        cep,
        address,
        number,
        neighborhood || "Não informado",
        city,
        state,
        cartItems,
        total
      );
      console.log("Pedido salvo com sucesso.");

      console.log("Limpando carrinho...");
      clearCart();

      Alert.alert("Sucesso", "Pedido salvo com sucesso!", [
        { text: "OK", onPress: () => navigation.navigate("Shop" as never) },
      ]);
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      Alert.alert("Erro", `Falha ao salvar o pedido: ${(error as Error).message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Finalizar Pedido</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo do Carrinho</Text>
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
        <Text style={styles.totalText}>Total: R$ {total.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações do Cliente</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={customerName}
          onChangeText={setCustomerName}
        />
        <TextInput
          style={styles.input}
          placeholder="CPF (somente números)"
          value={cpf}
          onChangeText={(text) => setCpf(formatCpf(text))}
          keyboardType="numeric"
          maxLength={14}
        />
        <View style={styles.cepContainer}>
          <TextInput
            style={[styles.input, styles.cepInput]}
            placeholder="CEP"
            value={cep}
            onChangeText={(text) => {
              const formattedCep = formatCep(text);
              setCep(formattedCep);
              fetchCepData(formattedCep);
            }}
            keyboardType="numeric"
            maxLength={9}
          />
          {loadingCep && <ActivityIndicator size="small" color="#007BFF" style={styles.cepLoader} />}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Endereço"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Número"
          value={number}
          onChangeText={setNumber}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Bairro"
          value={neighborhood}
          onChangeText={setNeighborhood}
        />
        <TextInput
          style={styles.input}
          placeholder="Cidade"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={styles.input}
          placeholder="Estado (ex: SC)"
          value={state}
          onChangeText={setState}
          maxLength={2}
        />
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={handleFinishOrder}>
        <Text style={styles.finishButtonText}>Finalizar Pedido</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#007BFF",
    marginBottom: 10,
  },
  cartItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  itemDetail: {
    fontSize: 14,
    color: "#666",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28A745",
    textAlign: "right",
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  cepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cepInput: {
    flex: 1,
  },
  cepLoader: {
    marginLeft: 10,
  },
  finishButton: {
    backgroundColor: "#007BFF",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});