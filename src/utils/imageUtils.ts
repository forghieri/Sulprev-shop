// src/utils/imageUtils.ts
import * as ImagePicker from "expo-image-picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../models/RootStackParamList";
import { Item } from "../models/Item";

let FileSystem: any;
try {
  FileSystem = require("expo-file-system");
} catch (error) {
  console.warn("expo-file-system not available. Are you running a bare React Native project?", error);
}

const getImagesDir = (): string => {
  if (!FileSystem || !FileSystem.documentDirectory) {
    console.error("FileSystem or documentDirectory is undefined!");
    throw new Error("FileSystem module is not available.");
  }
  const dir = `${FileSystem.documentDirectory}product_images/`;
  console.log("Images directory:", dir);
  return dir;
};

const imagesDir = getImagesDir();

const ensureDirExists = async (): Promise<void> => {
  if (!FileSystem) {
    console.warn("Skipping directory creation due to missing FileSystem module.");
    return;
  }
  try {
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!dirInfo.exists) {
      console.log("Creating directory:", imagesDir);
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }
  } catch (error) {
    console.error("Error ensuring directory exists:", error);
    throw error;
  }
};

export const pickImages = async (): Promise<string[] | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permissão negada para acessar a galeria.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images", // Usando string literal "image" em vez de MediaTypeOptions
    allowsMultipleSelection: true,
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }

  await ensureDirExists();

  const savedImages = await Promise.all(
    result.assets.map(async (asset, index) => {
      const filename = `image_${Date.now()}_${index}.jpg`;
      const newPath = `${imagesDir}${filename}`;

      try {
        if (FileSystem) {
          await FileSystem.copyAsync({
            from: asset.uri,
            to: newPath,
          });
          console.log("Image copied to:", newPath);
        } else {
          console.warn("FileSystem unavailable, using original URI:", asset.uri);
          return asset.uri;
        }
        return newPath;
      } catch (error) {
        console.error("Erro ao copiar imagem:", error);
        return asset.uri;
      }
    })
  );

  return savedImages;
};

export const addItemToStorage = (
  newItem: Item,
  navigation: StackNavigationProp<RootStackParamList, "NewItem">
): void => {
  navigation.navigate("Home", { newItem });
};