import { createNativeStackNavigator } from "@react-navigation/native-stack";


import AllSales from "../screens/AllSales";
import NewItem from "../screens/NewItem";
import Shop from "../screens/Shop";
import Home from "../screens/Home";


const Stack = createNativeStackNavigator();

export default function StackRoutes() {
    return (
        <Stack.Navigator screenOptions={{ title: '' }}>
            <Stack.Screen
                name="home"
                component={Home}

            />
            <Stack.Screen
                name="NewItem"
                component={NewItem}

            />
            <Stack.Screen
                name="Shop"
                component={Shop}

            />
            <Stack.Screen
                name="AllSales"
                component={AllSales}

            />

        </Stack.Navigator>
    )


}