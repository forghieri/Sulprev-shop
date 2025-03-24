import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import Routes from "./src/routes";
import Toast from "react-native-toast-message";
import { CartProvider } from "./src/utils/CartContext"; // Ajustado para .tsx

export default function App() {
  useEffect(() => {
    const unlockOrientation = async () => {
      try {
        await ScreenOrientation.unlockAsync();
        console.log("Orientação desbloqueada com sucesso.");
      } catch (error) {
        console.error("Erro ao desbloquear orientação:", error);
      }
    };
    unlockOrientation();

    // Cleanup opcional
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT)
        .catch((error) => console.error("Erro ao restaurar orientação padrão:", error));
    };
  }, []);

  return (
    <CartProvider>
      <View style={styles.container}>
        <Routes />
      </View>
      <Toast />
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});