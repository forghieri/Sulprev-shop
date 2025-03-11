import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../models/RootStackParamList";
import { Item } from "../models/Item";
import {
  loadProducts,
  addNewProduct,
  handleImageClick,
  handleMenuPress,
} from "../utils/homeUtils";
import { formatPrice } from "../utils/formatPrice";
import styles from "../styles/HomeStyles";
import newItemStyles from "../styles/NewItemStyles";
import { StackNavigationProp } from "@react-navigation/stack";

type HomeRouteProp = RouteProp<{ Home: { newItem?: Item; updatedProducts?: Item[] } }, "Home">;
type HomeNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const backIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

const menuIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="2" fill="black"/>
    <circle cx="12" cy="12" r="2" fill="black"/>
    <circle cx="12" cy="19" r="2" fill="black"/>
  </svg>
`;

const searchIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#FFFFFF"/>
  </svg>
`;

const cartIcon = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 18C5.9 18 5 18.9 5 20C5 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM17 18C15.9 18 15 18.9 15 20C15 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18ZM7.2 14H16.8C17.4 14 17.9 13.6 18 13L19.9 5.5C20 5 19.6 4.5 19.1 4.5H5.2L4.3 2H1V4H3L6.6 13.6L5.2 16.2C5 16.6 5.2 17 5.6 17H19V15H6.4L7.2 14Z" fill="#FFFFFF"/>
  </svg>
`;

const categories = ["Kits", "Caixões", "Coroa de Flores", "Todos"];

export default function Home() {
  const { width, height } = useWindowDimensions();
  const numColumns = width > height ? 3 : 2;
  const itemSize = width / numColumns - 20;
  const itemHeight = itemSize;

  const route = useRoute<HomeRouteProp>();
  const navigation = useNavigation<HomeNavigationProp>();
  const [products, setProducts] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  useEffect(() => {
    loadProducts(setProducts);
  }, []);

  useEffect(() => {
    if (route.params?.newItem) {
      addNewProduct(products, route.params.newItem, setProducts);
      navigation.setParams({ newItem: undefined });
    }
    if (route.params?.updatedProducts) {
      setProducts(route.params.updatedProducts);
      navigation.setParams({ updatedProducts: undefined });
    }
  }, [route.params?.newItem, route.params?.updatedProducts, navigation, products]);

  const handleImageClickWithItem = (item: Item) => {
    setSelectedItem(item);
    handleImageClick(item.images, setSelectedImages, setModalVisible);
  };

  const handleAddToCart = (item: Item) => {
    
    navigation.navigate("Shop", { selectedItem: item });
  };

  const filteredProducts = products.filter((item) => {
    const category = item.category || "Sem Categoria";
    return filterCategory === "Todos" || category === filterCategory;
  });

  const renderItem = ({ item }: { item: Item }) => (
    <View style={[styles.productCard, { width: itemSize, height: itemHeight }]}>
      <TouchableOpacity
        onPress={() => handleImageClickWithItem(item)}
        style={styles.imageContainer}
      >
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => handleMenuPress(item.id, products, setProducts, navigation)}
          >
            <SvgXml xml={menuIcon} width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#28A745", // Verde para o botão de carrinho
              borderRadius: 20,
              padding: 5,
              marginLeft: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => handleAddToCart(item)}
          >
            <SvgXml xml={cartIcon} width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const scrollWidth = width * 0.9;
  const isLandscape = width > height;

  const modalContentStyle = StyleSheet.flatten([
    styles.modalContent,
    {
      flexDirection: isLandscape ? "row" : "column",
    },
  ]);

  const imageScrollStyle = StyleSheet.flatten([
    styles.imageScroll,
    {
      width: isLandscape ? "60%" : "100%",
      height: isLandscape ? "100%" : "70%",
    },
  ]);

  const descriptionCardStyle = StyleSheet.flatten([
    styles.descriptionCard,
    {
      width: isLandscape ? "40%" : "100%",
      height: isLandscape ? "100%" : "30%",
    },
  ]);

  return (
    <View style={styles.container}>
      {/* Ícone de Lupa fixado no canto superior direito */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "#007BFF",
          borderRadius: 50,
          padding: 8,
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          zIndex: 1000,
        }}
        onPress={() => setShowFilterOptions(!showFilterOptions)}
      >
        <SvgXml xml={searchIcon} width={24} height={24} />
      </TouchableOpacity>

      {/* Opções de Filtro ao lado do ícone */}
      {showFilterOptions && (
        <View
          style={{
            position: "absolute",
            top: 50,
            right: 10,
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 2,
            zIndex: 1000,
          }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                newItemStyles.imagePickerButton,
                {
                  backgroundColor: filterCategory === category ? "#007BFF" : "#808080",
                  marginBottom: 5,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  minWidth: 100,
                },
              ]}
              onPress={() => {
                setFilterCategory(category);
                setShowFilterOptions(false);
              }}
            >
              <Text style={newItemStyles.imagePickerText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingTop: 60 }}
      />

      {/* Modal de Visualização */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={modalContentStyle}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={imageScrollStyle}
            >
              {selectedImages.map((image, index) => (
                <View
                  key={index}
                  style={{
                    width: isLandscape ? width * 0.9 * 0.6 : scrollWidth,
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.modalImage}
                  />
                </View>
              ))}
            </ScrollView>
            {selectedItem && (
              <ScrollView
                style={descriptionCardStyle}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.descriptionTitle}>{selectedItem.name}</Text>
                <Text style={styles.descriptionPrice}>{formatPrice(selectedItem.price)}</Text>
                <Text style={styles.descriptionText}>{selectedItem.description}</Text>
              </ScrollView>
            )}
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setModalVisible(false)}
          >
            <SvgXml xml={backIcon} width={24} height={24} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}