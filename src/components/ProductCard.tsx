import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { Item } from "../models/Item";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/ProductCardStyles";

const backIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

const cartIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H5L5.4 5M7 13H17L19 5H5.4M7 13L5.4 5M7 13L6 17H18L17 13H7ZM8 21C8.55228 21 9 20.5523 9 20C9 19.4477 8.55228 19 8 19C7.44772 19 7 19.4477 7 20C7 20.5523 7.44772 21 8 21ZM17 21C17.5523 21 18 20.5523 18 20C18 19.4477 17.5523 19 17 19C16.4477 19 16 19.4477 16 20C16 20.5523 16.4477 21 17 21Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

interface ProductCardProps {
  item: Item;
  items?: Item[];
  currentIndex?: number;
  selectedPlan?: string;
  onLongPress: (item: Item) => void;
  onChangeItem?: (index: number) => void;
  onAddToCart?: (item: Item) => void; // Nova prop para chamar handleAddToCart da tela
}

type CartItem = Item & { quantity: number };

export default function ProductCard({
  item: initialItem,
  items,
  currentIndex,
  selectedPlan,
  onLongPress,
  onChangeItem,
  onAddToCart, // Adicionado
}: ProductCardProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 4 : 3;
  const itemSize = width / numColumns - 20;
  const itemHeight = itemSize * 1.4;
  const [modalVisible, setModalVisible] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [currentModalIndex, setCurrentModalIndex] = useState(currentIndex || 0);

  // Item atual no modal
  const currentModalItem = items && items.length > 0 ? items[currentModalIndex] : initialItem;

  const priceDisplay =
    currentModalItem.targetScreen === "Parque" && currentModalItem.planPrices && selectedPlan
      ? currentModalItem.planPrices[selectedPlan as keyof typeof currentModalItem.planPrices]
      : currentModalItem.price || "Preço indisponível";

  // Carregar as dimensões reais da imagem do item atual no modal
  useEffect(() => {
    Image.getSize(currentModalItem.images[0], (imgWidth, imgHeight) => {
      setImageDimensions({ width: imgWidth, height: imgHeight });
    }, (error) => {
      console.error("Erro ao carregar dimensões da imagem:", error);
      setImageDimensions({ width: 300, height: 300 }); // Fallback
    });
  }, [currentModalItem.images[0]]);

  // Calcular o tamanho do modal e da imagem/descrição com logs
  const maxModalWidth = width * 0.9;
  const maxModalHeight = height * 0.9;
  let imageWidth = maxModalWidth;
  let imageHeight = maxModalHeight;
  let modalWidth = maxModalWidth;
  let modalHeight = maxModalHeight;

  if (imageDimensions) {
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    if (isLandscape) {
      imageWidth = Math.min(maxModalWidth * 0.5, imageDimensions.width);
      imageHeight = imageWidth / aspectRatio;
      modalWidth = imageWidth * 2;
      modalHeight = Math.min(maxModalHeight, imageHeight);
    } else {
      imageWidth = Math.min(maxModalWidth, imageDimensions.width);
      imageHeight = imageWidth / aspectRatio;
      modalWidth = imageWidth;
      modalHeight = Math.min(maxModalHeight, imageHeight * 2);
    }
  }

  console.log(`Modal Size - Width: ${modalWidth}px, Height: ${modalHeight}px`);
  console.log(`Image Size - Width: ${imageWidth}px, Height: ${imageHeight}px`);
  console.log(`Screen Size - Width: ${width}px, Height: ${height}px, Landscape: ${isLandscape}`);

  const modalContentStyle = StyleSheet.flatten([
    modalStyles.modalContent,
    {
      flexDirection: isLandscape ? "row" : "column",
      width: modalWidth,
      height: modalHeight,
    },
  ]);
  const imageScrollStyle = StyleSheet.flatten([
    modalStyles.imageScroll,
    {
      width: isLandscape ? imageWidth : imageWidth,
      height: isLandscape ? imageHeight : imageHeight,
    },
  ]);
  const descriptionCardStyle = StyleSheet.flatten([
    modalStyles.descriptionCard,
    {
      width: isLandscape ? imageWidth : imageWidth,
      height: isLandscape ? imageHeight : imageHeight,
    },
  ]);

  // Função para adicionar ao carrinho
  const addToCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      let cartItems: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
  
      const newItem: CartItem = { ...currentModalItem, quantity: 1 };
      const existingItemIndex = cartItems.findIndex((item) => item.id === newItem.id);
  
      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += 1;
      } else {
        cartItems.push(newItem);
      }
  
      await AsyncStorage.setItem("cart", JSON.stringify(cartItems));
      console.log("Item adicionado ao carrinho:", newItem);
      console.log("Carrinho atualizado:", cartItems);
  
      // Chama a prop onAddToCart, se fornecida
      if (onAddToCart) {
        onAddToCart(currentModalItem); 
      }
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.productCard, { width: itemSize, height: itemHeight }]}
        onPress={() => setModalVisible(true)}
        onLongPress={() => onLongPress(initialItem)}
        activeOpacity={0.8}
      >
        <View style={[styles.imageContainer, { height: itemSize * 0.8, paddingTop: 10 }]}>
          <Image
            source={{ uri: initialItem.images[0] }}
            style={[styles.productImage, { height: "100%", width: "100%" }]}
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
              {initialItem.name}
            </Text>
            <Text style={styles.productPrice}>{priceDisplay}</Text>
          </View>
          <TouchableOpacity style={modalStyles.cartButton} onPress={addToCart}>
            <SvgXml xml={cartIcon} width={24} height={24} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Modal de Visualização */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalWrapper}>
            <View style={[modalContentStyle, { width: modalWidth }]}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={imageScrollStyle}
                contentContainerStyle={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
                snapToInterval={imageWidth}
              >
                {currentModalItem.images.map((image, imgIndex) => (
                  <View
                    key={imgIndex}
                    style={{
                      width: imageWidth,
                      height: imageHeight,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: image }}
                      style={[
                        modalStyles.modalImage,
                        imageDimensions && {
                          width: imageWidth,
                          height: imageDimensions.height * (imageWidth / imageDimensions.width),
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
              <ScrollView style={descriptionCardStyle} showsVerticalScrollIndicator={true}>
                <Text style={modalStyles.descriptionTitle}>{currentModalItem.name}</Text>
                <Text style={modalStyles.descriptionPrice}>{priceDisplay}</Text>
                <Text style={modalStyles.descriptionText}>
                  {currentModalItem.description || "Sem descrição disponível"}
                </Text>
              </ScrollView>
            </View>
            <TouchableOpacity
              style={modalStyles.backButton}
              onPress={() => setModalVisible(false)}
            >
              <SvgXml xml={backIcon} width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Estilos do modal
const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    position: "relative",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  imageScroll: {
    // Removido alignItems e justifyContent do style
  },
  modalImage: {
    // Dimensões definidas dinamicamente no componente
  },
  descriptionCard: {
    padding: 10,
    backgroundColor: "#fff",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  descriptionPrice: {
    fontSize: 16,
    color: "#007BFF",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  cartButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 40,
    height: 30,
    borderRadius: 2,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#32CD32",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});