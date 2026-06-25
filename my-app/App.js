import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import BookingConfirmedScreen from "./screens/BookingConfirmedScreen";
import BookingDetailsScreen from "./screens/BookingDetailsScreen";
import ElevenSeaterScreen from "./screens/ElevenSeaterScreen";
import InnovaScreen from "./screens/InnovaScreen";
import LoginScreen from "./screens/LoginScreen";
import OwnerHomeScreen from "./screens/OwnerHomeScreen";
import SeventeenSeaterScreen from "./screens/SeventeenSeaterScreen";
import SplashScreen from "./screens/SplashScreen";
import TripDetails from "./screens/tripdetails";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    "Serpentine-Bold": require("./assets/Serpentine-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      console.log(
        "Global loaded fonts:",
        Font.getLoadedFonts ? Object.keys(Font.getLoadedFonts()) : "Unknown",
      );
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false, animation: "fade" }}
        />
        <Stack.Screen
          name="OwnerHomeScreen"
          component={OwnerHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TripDetails"
          component={TripDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InnovaScreen"
          component={InnovaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SeventeenSeaterScreen"
          component={SeventeenSeaterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ElevenSeaterScreen"
          component={ElevenSeaterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookingConfirmedScreen"
          component={BookingConfirmedScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookingDetails"
          component={BookingDetailsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
