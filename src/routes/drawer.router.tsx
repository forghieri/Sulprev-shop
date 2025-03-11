// src/routes/drawer.router.tsx
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import { ModelsRoutes } from "./modelRoutes"; // Importação correta do tipo

import AllSales from "../screens/AllSales";
import Shop from "../screens/Shop";
import NewItem from "../screens/NewItem";
import Home from "../screens/Home";

const Drawer = createDrawerNavigator<ModelsRoutes>();

export default function DrawerRoutes() {
  return (
    <Drawer.Navigator screenOptions={{ title: "" }}>
      {/* Tela Home */}
      <Drawer.Screen
        name="Home"
        component={Home}
        options={({ navigation }) => ({
          drawerIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
          drawerLabel: "Início",
          headerRight: () => (
            <Feather
              name="shopping-cart"
              size={24}
              color="green"
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate("Shop", { selectedItem: undefined })}
            />
          ),
        })}
      />

      {/* Tela AllSales */}
      <Drawer.Screen
        name="AllSales"
        component={AllSales}
        options={({ navigation }) => ({
          drawerIcon: ({ color, size }) => (
            <Feather name="list" color={color} size={size} />
          ),
          drawerLabel: "Todas as vendas",
          headerRight: () => (
            <Feather
              name="shopping-cart"
              size={24}
              color="black"
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate("Shop", { selectedItem: undefined })}
            />
          ),
        })}
      />

      {/* Tela NewItem */}
      <Drawer.Screen
        name="NewItem"
        component={NewItem}
        options={({ navigation }) => ({
          drawerIcon: ({ color, size }) => (
            <Feather name="plus" color={color} size={size} />
          ),
          drawerLabel: "Adicionar item",
          headerRight: () => (
            <Feather
              name="shopping-cart"
              size={24}
              color="black"
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate("Shop", { selectedItem: undefined })}
            />
          ),
        })}
      />

      {/* Tela Shop */}
      <Drawer.Screen
        name="Shop"
        component={Shop}
        options={{
          drawerIcon: ({ color, size }) => (
            <Feather name="shopping-cart" color={color} size={size} />
          ),
          drawerLabel: "Carrinho",
        }}
      />
    </Drawer.Navigator>
  );
}