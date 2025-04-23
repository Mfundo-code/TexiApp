import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import HomeScreen from "../screens/HomeScreen";
import SearchResults from "../screens/SearchResults";
import RideConfirmation from "../screens/RideConfirmation";

const Stack = createStackNavigator();

const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: false // Hide headers for all screens
                }}
            >
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen} 
                />
                <Stack.Screen 
                    name="SearchResults" 
                    component={SearchResults} 
                />
                <Stack.Screen 
                    name="RideConfirmation" 
                    component={RideConfirmation} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;