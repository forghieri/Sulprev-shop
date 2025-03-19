import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

// Função para renderizar o ícone de checkmark
const renderCheckIcon = () => <MaterialIcons name="check" size={20} color="#fff" />;

export const showItemAddedToast = () => {
  console.log("Executando showItemAddedToast");
  // Verifica se Toast.show existe antes de chamar
  
    Toast.show({
      
      type: "success",
      text1: "Adicionado ao carrinho",
      position: "top",
      visibilityTime: 2000,
      topOffset: 50,
      text1Style: { fontSize: 24, color: "green" },
      renderLeadingIcon: renderCheckIcon,
    });
   
};