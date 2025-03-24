import { NavigationContainer } from "@react-navigation/native";
import DrawerRoutes from "./drawer.router";

export default function Routes() {
  return (
    <NavigationContainer>
      <DrawerRoutes />
    </NavigationContainer>
  );
}