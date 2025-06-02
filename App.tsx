import React, {
  useState,
  useEffect,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { StatusBar, SafeAreaView, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RootNavigator from "./srs/navigation";

// 1. Define AuthContext interface
interface AuthContextType {
  isAuthenticated: boolean;
  authToken: string | null;
  username: string | null;
  mode: string | null;  // Added mode
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setAuthToken: Dispatch<SetStateAction<string | null>>;
  setUsername: Dispatch<SetStateAction<string | null>>;
  setMode: Dispatch<SetStateAction<string | null>>;  // Added setMode
}

// 2. Create context with default values (including all functions)
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  authToken: null,
  username: null,
  mode: null,  // Added default for mode
  setIsAuthenticated: () => {},
  setAuthToken: () => {},
  setUsername: () => {},
  setMode: () => {},  // Added default for setMode
});

interface AppProps {
  children?: ReactNode;
}

const App: React.FC<AppProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);  // Added state for mode
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 3. Check stored token and mode from AsyncStorage
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const storedUsername = await AsyncStorage.getItem("username");
        const storedMode = await AsyncStorage.getItem("mode");  // Retrieve mode
        if (token) {
          setAuthToken(token);
          setUsername(storedUsername);
          setMode(storedMode);  // Set mode
          setIsAuthenticated(true);
        } else {
          setAuthToken(null);
          setUsername(null);
          setMode(null);  // Clear mode
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthToken(null);
        setUsername(null);
        setMode(null);  // Clear mode on error
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authToken,
        username,
        mode,  // Provide mode
        setIsAuthenticated,
        setAuthToken,
        setUsername,
        setMode,  // Provide setMode
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </SafeAreaView>
    </AuthContext.Provider>
  );
};

export default App;
