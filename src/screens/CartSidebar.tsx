// src/screens/Carrinho.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../models/RootStackParamList";
import { Item } from "../models/Item";

type CarrinhoRouteProp = RouteProp<RootStackParamList, "Carrinho">;

export default function Carrinho() {
  const route = useRoute<CarrinhoRouteProp>();
  const { selectedItem } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Item Adicionado ao Carrinho</Text>
      <Text style={styles.detail}>Nome: {selectedItem.name}</Text>
      <Text style={styles.detail}>Preço: {selectedItem.price}</Text>
      <Text style={styles.detail}>Categoria: {selectedItem.category}</Text>
      <Text style={styles.detail}>Descrição: {selectedItem.description}</Text>
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
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
});