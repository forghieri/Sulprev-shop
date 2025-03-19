import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import Routes from "./src/routes";
import Toast from "react-native-toast-message"; // Importação padrão

export default function App() {
  useEffect(() => {
    const unlockOrientation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    unlockOrientation();
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <>
      <View style={styles.container}>
        <Routes />
      </View>
      <Toast /> 
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});