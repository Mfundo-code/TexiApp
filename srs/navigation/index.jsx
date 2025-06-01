import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import SearchResults from "../screens/SearchResults";
import RideConfirmation from "../screens/RideConfirmation";
import SignInScreen from "../screens/SignInScreen/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen/SignUpScreen";
import { AuthContext } from "../../App";
import ChatsScreen from "../screens/ChatScreen/ChatsScreen";
import CommunityHubScreen from "../screens/HubScreen/CommunityHubScreen";
import ParcelsScreen from "../screens/ParcelsScreen/ParcelsScreen";
import RidesListScreen from "../screens/RidesListScreen";
import ParcelListScreen from "../screens/ParcelListScreen";
import RideDetailsScreen from "../screens/RideDetailsScreen";
import BookForLaterScreen from "../screens/BookForLaterScreen";
import MessageScreen from "../screens/MessageScreen";

const AppStack = createStackNavigator();
const AuthStack = createStackNavigator();

const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="Home" component={HomeScreen} />
    <AppStack.Screen name="SearchResults" component={SearchResults} />
    <AppStack.Screen name="Chats" component={ChatsScreen} />  
    <AppStack.Screen name="CommunityHub" component={CommunityHubScreen} />
    <AppStack.Screen name="RideConfirmation" component={RideConfirmation} />
    <AppStack.Screen name="Parcels" component={ParcelsScreen} />
    <AppStack.Screen name="RidesList" component={RidesListScreen} />
    <AppStack.Screen name="ParcelList" component={ParcelListScreen} />
    <AppStack.Screen name="RideDetailsScreen" component={RideDetailsScreen} />
    <AppStack.Screen name="BookForLaterScreen" component={BookForLaterScreen} />
    <AppStack.Screen name="MessageScreen" component={MessageScreen} />
  </AppStack.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;

