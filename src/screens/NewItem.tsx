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
import { useNavigation, useRoute } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RouteProp } from "@react-navigation/native";
import { ModelsRoutes } from "../routes/modelRoutes";
import { Item } from "../models/Item";
import { pickImages } from "../utils/imageUtils";
import CurrencyInput from "react-native-currency-input";
import styles from "../styles/NewItemStyles";
import { initDatabase } from "../database/init";
import { 
  insertProduct, 
  insertParqueProduct, 
  insertPlanosProduct, 
  updateProduct, 
  updateParqueProduct, 
  updatePlanosProduct 
} from "../database/itemRepository";

type NewItemScreenNavigationProp = DrawerNavigationProp<ModelsRoutes, "NewItem">;
type NewItemScreenRouteProp = RouteProp<ModelsRoutes, "NewItem">;

const categories = ["Kits", "Caixões", "Coroa de Flores"];
const targetScreens = ["Parque", "Funeraria", "Planos"];
const parquePlans = ["Bronze", "Ouro", "Diamante", "Diamante Plus"];
const planosPlans = ["Standard", "Master", "Prime"];

export default function NewItem() {
  const navigation = useNavigation<NewItemScreenNavigationProp>();
  const route = useRoute<NewItemScreenRouteProp>();
  const { itemToEdit, id } = route.params || {};

  const [itemName, setItemName] = useState<string>(itemToEdit?.name || "");
  const [itemQuantity, setItemQuantity] = useState<string>(itemToEdit?.quantity?.toString() || "0");
  const [itemCategory, setItemCategory] = useState<string>(itemToEdit?.category || categories[0]);
  const [itemDescription, setItemDescription] = useState<string>(itemToEdit?.description || "");
  const [images, setImages] = useState<string[]>(itemToEdit?.images || []);
  const [targetScreen, setTargetScreen] = useState<string>(itemToEdit?.targetScreen || targetScreens[0]);
  const [priceValue, setPriceValue] = useState<number | null>(
    itemToEdit?.price ? parseFloat(itemToEdit.price.replace("R$ ", "").replace(".", "").replace(",", ".")) : null
  );
  const [planPrices, setPlanPrices] = useState<{
    Bronze?: number | null;
    Ouro?: number | null;
    Diamante?: number | null;
    "Diamante Plus"?: number | null;
    Standard?: number | null;
    Master?: number | null;
    Prime?: number | null;
  }>(
    itemToEdit?.planPrices
      ? {
          ...(itemToEdit.targetScreen === "Parque"
            ? {
                Bronze: parseFloat(itemToEdit.planPrices.Bronze?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
                Ouro: parseFloat(itemToEdit.planPrices.Ouro?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
                Diamante: parseFloat(itemToEdit.planPrices.Diamante?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
                "Diamante Plus": parseFloat(itemToEdit.planPrices["Diamante Plus"]?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
              }
            : itemToEdit.targetScreen === "Planos"
            ? {
                Standard: parseFloat(itemToEdit.planPrices.Standard?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
                Master: parseFloat(itemToEdit.planPrices.Master?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
                Prime: parseFloat(itemToEdit.planPrices.Prime?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
              }
            : {}),
        }
      : { Bronze: null, Ouro: null, Diamante: null, "Diamante Plus": null, Standard: null, Master: null, Prime: null }
  );
  const isEditing = !!itemToEdit && id !== undefined;

  useEffect(() => {
    if (itemToEdit) {
      console.log("Item recebido para edição:", itemToEdit);
      setItemName(itemToEdit.name || "");
      setItemQuantity(itemToEdit.quantity?.toString() || "0");
      setItemCategory(itemToEdit.category || categories[0]);
      setItemDescription(itemToEdit.description || "");
      setImages(itemToEdit.images || []);
      setTargetScreen(itemToEdit.targetScreen || targetScreens[0]);
      if (itemToEdit.targetScreen === "Parque" && itemToEdit.planPrices) {
        setPlanPrices({
          Bronze: parseFloat(itemToEdit.planPrices.Bronze?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
          Ouro: parseFloat(itemToEdit.planPrices.Ouro?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
          Diamante: parseFloat(itemToEdit.planPrices.Diamante?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
          "Diamante Plus": parseFloat(itemToEdit.planPrices["Diamante Plus"]?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
        });
      } else if (itemToEdit.targetScreen === "Planos" && itemToEdit.planPrices) {
        setPlanPrices({
          Standard: parseFloat(itemToEdit.planPrices.Standard?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
          Master: parseFloat(itemToEdit.planPrices.Master?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
          Prime: parseFloat(itemToEdit.planPrices.Prime?.replace("R$ ", "").replace(".", "").replace(",", ".")) || null,
        });
      } else if (itemToEdit.price) {
        setPriceValue(parseFloat(itemToEdit.price.replace("R$ ", "").replace(".", "").replace(",", ".")) || null);
      }
    }
  }, [itemToEdit]);

  const handlePickImages = async () => {
    try {
      const selectedImages = await pickImages();
      if (selectedImages) setImages(selectedImages);
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar imagens.");
    }
  };

  const handleSaveItem = async () => {
    if (!itemName.trim() || !itemCategory.trim() || !itemDescription.trim() || images.length === 0 || !targetScreen) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
      return;
    }

    const quantity = parseInt(itemQuantity) || 0;
    let updatedItem: Item;

    console.log("Dados antes da inserção/atualização:", {
      itemName,
      itemQuantity,
      itemCategory,
      itemDescription,
      images,
      targetScreen,
      priceValue,
      planPrices,
    });

    const db = await initDatabase();

    if (targetScreen === "Parque") {
      const relevantPlans = parquePlans;
      const filteredPlanPrices = Object.fromEntries(
        Object.entries(planPrices).filter(([key]) => relevantPlans.includes(key))
      );
      if (Object.values(filteredPlanPrices).some((price) => price === null || price < 0)) {
        Alert.alert("Erro", "Preencha todos os preços para os planos!");
        return;
      }
      const formattedPlanPrices = Object.fromEntries(
        relevantPlans.map((plan) => [
          plan,
          (filteredPlanPrices[plan] as number).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
          }),
        ])
      );
      updatedItem = {
        id: isEditing ? id : Date.now().toString(),
        name: itemName,
        quantity,
        category: itemCategory,
        description: itemDescription,
        images,
        targetScreen,
        planPrices: formattedPlanPrices,
      };
      try {
        if (isEditing) {
          console.log("Atualizando item em itensParque:", updatedItem);
          await updateParqueProduct(db, id, updatedItem);
        } else {
          console.log("Inserindo item em itensParque:", updatedItem);
          await insertParqueProduct(db, updatedItem);
        }
        navigation.navigate("Parque" as keyof ModelsRoutes);
      } catch (error) {
        console.error("Erro ao salvar item em itensParque:", error);
        Alert.alert("Erro", "Falha ao salvar o item.");
      }
    } else if (targetScreen === "Planos") {
      const relevantPlans = planosPlans;
      const filteredPlanPrices = Object.fromEntries(
        Object.entries(planPrices).filter(([key]) => relevantPlans.includes(key))
      );
      if (Object.values(filteredPlanPrices).some((price) => price === null || price < 0)) {
        Alert.alert("Erro", "Preencha todos os preços para os planos!");
        return;
      }
      const formattedPlanPrices = Object.fromEntries(
        relevantPlans.map((plan) => [
          plan,
          (filteredPlanPrices[plan] as number).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
          }),
        ])
      );
      updatedItem = {
        id: isEditing ? id : Date.now().toString(),
        name: itemName,
        quantity,
        category: itemCategory,
        description: itemDescription,
        images,
        targetScreen,
        planPrices: formattedPlanPrices,
      };
      try {
        if (isEditing) {
          console.log("Atualizando item em itensPlanos:", updatedItem);
          await updatePlanosProduct(db, id, updatedItem);
        } else {
          console.log("Inserindo item em itensPlanos:", updatedItem);
          await insertPlanosProduct(db, updatedItem);
        }
        navigation.navigate("Planos" as keyof ModelsRoutes);
      } catch (error) {
        console.error("Erro ao salvar item em itensPlanos:", error);
        Alert.alert("Erro", "Falha ao salvar o item.");
      }
    } else {
      if (priceValue === null || priceValue < 0) {
        Alert.alert("Erro", "Preencha o preço do item!");
        return;
      }
      const formattedPrice = priceValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      });
      updatedItem = {
        id: isEditing ? id : Date.now().toString(),
        name: itemName,
        quantity,
        category: itemCategory,
        description: itemDescription,
        images,
        targetScreen,
        price: formattedPrice,
      };
      try {
        if (isEditing) {
          console.log("Atualizando item em products:", updatedItem);
          await updateProduct(db, id, updatedItem);
        } else {
          console.log("Inserindo item em products:", updatedItem);
          await insertProduct(db, updatedItem);
        }
        navigation.navigate(targetScreen as keyof ModelsRoutes);
      } catch (error) {
        console.error("Erro ao salvar item em products:", error);
        Alert.alert("Erro", "Falha ao salvar o item.");
      }
    }

    if (!isEditing) {
      setItemName("");
      setItemQuantity("0");
      setItemCategory(categories[0]);
      setItemDescription("");
      setImages([]);
      setTargetScreen(targetScreens[0]);
      setPriceValue(null);
      setPlanPrices({ Bronze: null, Ouro: null, Diamante: null, "Diamante Plus": null, Standard: null, Master: null, Prime: null });
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

        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a quantidade"
          value={itemQuantity}
          onChangeText={setItemQuantity}
          keyboardType="numeric"
          placeholderTextColor="#aaa"
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

        <Text style={styles.label}>Tela de Destino</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
          {targetScreens.map((screen) => (
            <TouchableOpacity
              key={screen}
              style={[
                styles.imagePickerButton,
                {
                  backgroundColor: targetScreen === screen ? "#007BFF" : "#808080",
                  marginRight: 10,
                  marginBottom: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                },
              ]}
              onPress={() => setTargetScreen(screen)}
            >
              <Text style={styles.imagePickerText}>{screen}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {targetScreen === "Parque" ? (
          <>
            <Text style={styles.label}>Preços por Plano</Text>
            {parquePlans.map((plan) => (
              <View key={plan} style={{ marginBottom: 15 }}>
                <Text style={styles.label}>{plan}</Text>
                <CurrencyInput
                  style={styles.input}
                  value={planPrices[plan as keyof typeof planPrices]}
                  onChangeValue={(value) => setPlanPrices((prev) => ({ ...prev, [plan]: value }))}
                  prefix="R$ "
                  delimiter="."
                  separator=","
                  precision={2}
                  placeholder={`Preço para ${plan} (ex.: R$ 100,00)`}
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
              </View>
            ))}
          </>
        ) : targetScreen === "Planos" ? (
          <>
            <Text style={styles.label}>Preços por Plano</Text>
            {planosPlans.map((plan) => (
              <View key={plan} style={{ marginBottom: 15 }}>
                <Text style={styles.label}>{plan}</Text>
                <CurrencyInput
                  style={styles.input}
                  value={planPrices[plan as keyof typeof planPrices]}
                  onChangeValue={(value) => setPlanPrices((prev) => ({ ...prev, [plan]: value }))}
                  prefix="R$ "
                  delimiter="."
                  separator=","
                  precision={2}
                  placeholder={`Preço para ${plan} (ex.: R$ 100,00)`}
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.label}>Preço do Item</Text>
            <CurrencyInput
              style={styles.input}
              value={priceValue}
              onChangeValue={setPriceValue}
              prefix="R$ "
              delimiter="."
              separator=","
              precision={2}
              placeholder="Digite o preço (ex.: R$ 100,00)"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />
          </>
        )}

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