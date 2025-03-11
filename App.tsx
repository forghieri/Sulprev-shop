import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import Routes from "./src/routes";

export default function App() {

  

  useEffect(() => {
    // Desbloqueia a rotação da tela
    const unlockOrientation = async () => {
      await ScreenOrientation.unlockAsync();  // Permite rotação livre entre modos retrato e paisagem
    };

    unlockOrientation();

    return () => {
      // Ao sair do componente, desbloqueia novamente
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Routes />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",  // Garantindo que a tela ocupe 100% da largura
    height: "100%", // Garantindo que a tela ocupe 100% da altura
  },
});
