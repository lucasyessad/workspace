import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "./src/screens/DashboardScreen";
import ModuleScreen from "./src/screens/ModuleScreen";
import { RootStackParamList } from "./src/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0B0F1A",
    card: "#111827",
    text: "#E5E7EB",
    border: "rgba(255,255,255,0.08)",
    primary: "#818CF8",
  },
};

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0B0F1A" },
          headerTintColor: "#E5E7EB",
          headerTitleStyle: { fontWeight: "600", fontSize: 16 },
          headerShadowVisible: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Module"
          component={ModuleScreen}
          options={({ route }) => ({
            title: `Module ${String(route.params.id).padStart(2, "0")}`,
            headerBackTitle: "Retour",
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
