// src/screens/NewItem.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RouteProp } from "@react-navigation/native";
import { ModelsRoutes } from "../routes/modelRoutes";
import { Item } from "../models/Item";
import { pickImages, addItemToStorage } from "../utils/imageUtils";
import { updateProduct } from "../utils/homeUtils";
import CurrencyInput from "react-native-currency-input"; // Importando o CurrencyInput
import styles from "../styles/NewItemStyles";

type NewItemScreenNavigationProp = DrawerNavigationProp<ModelsRoutes, "NewItem">;
type NewItemScreenRouteProp = RouteProp<ModelsRoutes, "NewItem">;

const categories = ["Kits", "Caixões", "Coroa de Flores"];

export default function NewItem() {
  const navigation = useNavigation<NewItemScreenNavigationProp>();
  const route = useRoute<NewItemScreenRouteProp>();
  const { itemToEdit, id } = route.params || {};

  const [itemName, setItemName] = useState<string>(itemToEdit?.name || "");
  const [priceValue, setPriceValue] = useState<number | null>(
    itemToEdit?.price
      ? parseFloat(itemToEdit.price.replace("R$ ", "").replace(".", "").replace(",", "."))
      : null
  ); // Valor numérico para o CurrencyInput
  const [itemCategory, setItemCategory] = useState<string>(itemToEdit?.category || categories[0]);
  const [itemDescription, setItemDescription] = useState<string>(itemToEdit?.description || "");
  const [images, setImages] = useState<string[]>(itemToEdit?.images || []);

  const isEditing = !!itemToEdit && id !== undefined;

  useEffect(() => {
    if (itemToEdit) {
      setItemName(itemToEdit.name || "");
      const rawPrice = itemToEdit.price.replace("R$ ", "").replace(".", "").replace(",", ".");
      setPriceValue(parseFloat(rawPrice) || null);
      setItemCategory(itemToEdit.category || categories[0]);
      setItemDescription(itemToEdit.description || "");
      setImages(itemToEdit.images || []);
    }
  }, [itemToEdit]);

  const handlePickImages = async () => {
    try {
      const selectedImages = await pickImages();
      if (selectedImages) {
        setImages(selectedImages);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar imagens. Tente novamente.");
    }
  };

  const handleSaveItem = async () => {
    if (
      !itemName.trim() ||
      priceValue === null ||
      !itemCategory.trim() ||
      !itemDescription.trim() ||
      images.length === 0
    ) {
      Alert.alert("Erro", "Preencha todos os campos e adicione pelo menos uma imagem!");
      return;
    }

    // Formata o preço para o formato "R$ X.XXX,XX" ao salvar
    const formattedPrice = priceValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

    const updatedItem: Item = {
      id: isEditing ? id : Date.now().toString(),
      name: itemName,
      price: formattedPrice,
      category: itemCategory,
      description: itemDescription,
      images,
    };

    if (isEditing) {
      const products = await AsyncStorage.getItem("products");
      if (products) {
        const parsedProducts: Item[] = JSON.parse(products);
        await updateProduct(parsedProducts, updatedItem.id, updatedItem, (updatedProducts) => {
          navigation.navigate("Home", { updatedProducts });
        });
      }
    } else {
      addItemToStorage(updatedItem, navigation);
    }

    if (!isEditing) {
      setItemName("");
      setPriceValue(null);
      setItemCategory(categories[0]);
      setItemDescription("");
      setImages([]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nome do Item</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do item"
          value={itemName}
          onChangeText={setItemName}
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Preço do Item</Text>
        <CurrencyInput
          style={styles.input}
          value={priceValue}
          onChangeValue={setPriceValue}
          prefix="R$ "
          delimiter="."
          separator=","
          precision={2} // Define o número de casas decimais (ajustável)
          placeholder="Digite o preço (ex.: R$ 100,00)"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.imagePickerButton,
                {
                  backgroundColor: itemCategory === category ? "#007BFF" : "#808080",
                  marginRight: 10,
                  marginBottom: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                },
              ]}
              onPress={() => setItemCategory(category)}
            >
              <Text style={styles.imagePickerText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Descrição do Item</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Digite a descrição do item"
          value={itemDescription}
          onChangeText={setItemDescription}
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImages}>
          <Text style={styles.imagePickerText}>Selecionar Imagens</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <ScrollView horizontal style={styles.imagePreviewContainer}>
            {images.map((img) => (
              <Image key={img} source={{ uri: img }} style={styles.previewImage} />
            ))}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleSaveItem}>
          <Text style={styles.addButtonText}>{isEditing ? "Salvar" : "Adicionar Item"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}