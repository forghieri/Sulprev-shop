// src/screens/Home.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  Text,
  Alert,
  TextInput,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { ModelsRoutes } from "../routes/modelRoutes";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import styles from "../styles/HomeStyles";

type HomeRouteProp = RouteProp<ModelsRoutes, "Home">;
type HomeNavigationProp = DrawerNavigationProp<ModelsRoutes, "Home">;

const placeholderImage = "https://via.placeholder.com/150";

// Dados iniciais para os cartões de navegação
const initialNavigationCards = [
  { id: "1", title: "Funerária", screen: "Funeraria", imageUri: placeholderImage },
  { id: "2", title: "Parque", screen: "Parque", imageUri: placeholderImage },
  { id: "3", title: "Planos", screen: "Planos", imageUri: placeholderImage },
];

// Chaves para armazenar dados no AsyncStorage
const STORAGE_KEY_IMAGES = "@HomeCardImages";
const STORAGE_KEY_TITLES = "@HomeCardTitles";

export default function Home() {
  const { width, height } = useWindowDimensions();
  const numColumns = width > height ? 3 : 2;
  const itemSize = width / numColumns - 40; // Reduzido para cartões menores (ajuste conforme necessário)

  const route = useRoute<HomeRouteProp>();
  const navigation = useNavigation<HomeNavigationProp>();
  const [cards, setCards] = useState(initialNavigationCards);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  // Carregar imagens e títulos salvos ao iniciar o app
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedImages = await AsyncStorage.getItem(STORAGE_KEY_IMAGES);
        const savedTitles = await AsyncStorage.getItem(STORAGE_KEY_TITLES);
        let updatedCards = [...initialNavigationCards];

        if (savedImages) {
          const parsedImages = JSON.parse(savedImages);
          updatedCards = updatedCards.map((card) => ({
            ...card,
            imageUri: parsedImages[card.id] || card.imageUri,
          }));
          console.log("Imagens carregadas do AsyncStorage:", parsedImages);
        }

        if (savedTitles) {
          const parsedTitles = JSON.parse(savedTitles);
          updatedCards = updatedCards.map((card) => ({
            ...card,
            title: parsedTitles[card.id] || card.title,
          }));
          console.log("Títulos carregados do AsyncStorage:", parsedTitles);
        }

        setCards(updatedCards);
      } catch (error) {
        console.error("Erro ao carregar dados do AsyncStorage:", error);
      }
    };
    loadSavedData();
  }, []);

  // Salvar imagens no AsyncStorage
  const saveImagesToStorage = async (updatedCards: typeof initialNavigationCards) => {
    try {
      const imageMap = updatedCards.reduce((acc, card) => {
        acc[card.id] = card.imageUri;
        return acc;
      }, {} as { [key: string]: string });
      await AsyncStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(imageMap));
      console.log("Imagens salvas no AsyncStorage:", imageMap);
    } catch (error) {
      console.error("Erro ao salvar imagens no AsyncStorage:", error);
    }
  };

  // Salvar títulos no AsyncStorage
  const saveTitlesToStorage = async (updatedCards: typeof initialNavigationCards) => {
    try {
      const titleMap = updatedCards.reduce((acc, card) => {
        acc[card.id] = card.title;
        return acc;
      }, {} as { [key: string]: string });
      await AsyncStorage.setItem(STORAGE_KEY_TITLES, JSON.stringify(titleMap));
      console.log("Títulos salvos no AsyncStorage:", titleMap);
    } catch (error) {
      console.error("Erro ao salvar títulos no AsyncStorage:", error);
    }
  };

  const handleNavigationClick = (screen: keyof ModelsRoutes) => {
    console.log("Navegando para:", screen);
    navigation.navigate(screen);
  };

  const handleLongPress = (cardId: string) => {
    console.log("Long press detectado no card:", cardId);
    const card = cards.find((c) => c.id === cardId);
    setSelectedCardId(cardId);
    setNewTitle(card ? card.title : ""); // Preenche o input com o título atual
    setModalVisible(true);
  };

  const handleImagePick = async () => {
    if (!selectedCardId) return;

    console.log("Solicitando permissão e abrindo galeria para o card:", selectedCardId);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de permissão para acessar a galeria.");
      setModalVisible(false);
      setSelectedCardId(null);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const fileName = result.assets[0].fileName || `image_${Date.now()}.jpg`;
      const destDir = `${FileSystem.documentDirectory}home_images/`;
      const destPath = `${destDir}id_img_home_${selectedCardId}_${fileName}`;

      try {
        await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
        await FileSystem.moveAsync({ from: uri, to: destPath });
        console.log(`Imagem salva em: ${destPath}`);

        const updatedCards = cards.map((item) =>
          item.id === selectedCardId ? { ...item, imageUri: destPath } : item
        );
        setCards(updatedCards);
        await saveImagesToStorage(updatedCards);
      } catch (error) {
        Alert.alert("Erro", "Falha ao salvar a imagem.");
        console.error("Erro ao manipular arquivo:", error);
      }
    }
    setModalVisible(false);
    setSelectedCardId(null);
  };

  const handleTitleChange = async () => {
    if (!selectedCardId || !newTitle.trim()) {
      Alert.alert("Erro", "Digite um título válido.");
      return;
    }

    const updatedCards = cards.map((item) =>
      item.id === selectedCardId ? { ...item, title: newTitle.trim() } : item
    );
    setCards(updatedCards);
    await saveTitlesToStorage(updatedCards);
    setModalVisible(false);
    setSelectedCardId(null);
    setNewTitle("");
  };

  const renderNavigationCard = ({ item }: { item: { id: string; title: string; screen: keyof ModelsRoutes; imageUri: string } }) => (
    <View style={localStyles.cardContainer}>
      <TouchableOpacity
        onPress={() => handleNavigationClick(item.screen)}
        onLongPress={() => handleLongPress(item.id)}
        style={[styles.productCard, { width: itemSize, height: itemSize }]} // Tamanho reduzido
      >
        <Image
          source={{ uri: item.imageUri }}
          style={[styles.productImage, { width: "100%", height: "100%" }]}
        />
      </TouchableOpacity>
      <Text style={localStyles.cardTitleBelow}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`nav-${numColumns}`}
        renderItem={renderNavigationCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 60 }}
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={localStyles.modal}
      >
        <View style={localStyles.modalContent}>
          <TextInput
            style={localStyles.titleInput}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Digite o novo título"
          />
          <TouchableOpacity
            style={localStyles.modalButton}
            onPress={handleTitleChange}
          >
            <Text style={localStyles.modalButtonText}>Salvar Título</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={localStyles.modalButton}
            onPress={handleImagePick}
          >
            <Text style={localStyles.modalButtonText}>Editar Imagem</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={localStyles.modalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={localStyles.modalButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitleBelow: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginTop: 5,
  },
  modal: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "50%",
  },
  modalButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  titleInput: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
});