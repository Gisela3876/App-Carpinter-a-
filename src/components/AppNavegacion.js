// src/navigation/AppNavigation.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen";
import ProjectForm from "./ProjectForm"; 
import ProjectList from "./ProjectList"; 
import ProjectUpdate from "./ProjectUpdate"; 
import GraficosScreen from "./GraficosScreen";

const Stack = createStackNavigator();

export default function AppNavigacion() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "App Carpinteria - Proyectos" }}
        />
        <Stack.Screen
          name="ProjectList"
          component={ProjectList}
          options={{ title: "Lista de proyectos" }}
        />
        <Stack.Screen
          name="ProjectForm"
          component={ProjectForm}
          options={{ title: "Crear proyecto" }}
        />
        <Stack.Screen
          name="ProjectUpdate"
          component={ProjectUpdate}
          options={{ title: "Actualizar proyecto" }}
        />
        <Stack.Screen
          name="GraficosScreen"
          component={GraficosScreen}
          options={{ title: "Estadísticas" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}