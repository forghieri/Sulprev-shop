import { createNativeStackNavigator } from "@react-navigation/native-stack";


import AllSales from "../screens/AllSales";
import NewItem from "../screens/NewItem";
import Shop from "../screens/Shop";
import Home from "../screens/Home";
import Funeraria from "../screens/Funeraria";
import Planos from "../screens/Planos";
import Parque from "../screens/Parque";
import Checkout from "../screens/Checkout";


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
            <Stack.Screen
                name="Planos"
                component={Planos}

            />
            <Stack.Screen
                name="Parque"
                component={Parque}

            />
            <Stack.Screen
                name="Funeraria"
                component={Funeraria}

            />
            <Stack.Screen
                name="Checkout"
                component={Checkout}

            />


        </Stack.Navigator>
    )


}