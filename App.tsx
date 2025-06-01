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
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setAuthToken: Dispatch<SetStateAction<string | null>>;
  setUsername: Dispatch<SetStateAction<string | null>>;
}

// 2. Create context with default values (including all functions)
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  authToken: null,
  username: null,
  setIsAuthenticated: () => {},
  setAuthToken: () => {},
  setUsername: () => {},  // <-- added missing default
});

interface AppProps {
  children?: ReactNode;
}

const App: React.FC<AppProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 3. Check stored token from AsyncStorage
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const storedUsername = await AsyncStorage.getItem("username");
        if (token) {
          setAuthToken(token);
          setUsername(storedUsername);
          setIsAuthenticated(true);
        } else {
          setAuthToken(null);
          setUsername(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthToken(null);
        setUsername(null);
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
        setIsAuthenticated,
        setAuthToken,   // <-- comma added
        setUsername     // <-- now correctly included
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
