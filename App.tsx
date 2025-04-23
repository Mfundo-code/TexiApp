import React from "react";
import { StatusBar } from "react-native";
import RootNavigator from "./srs/navigation"; // Verify your path (srs vs src)
import { Amplify } from "aws-amplify";
import config from "./src/aws-exports";
import { Authenticator } from '@aws-amplify/ui-react-native';

// Configure Amplify
Amplify.configure(config);

const App = () => {
  return (
    <Authenticator.Provider>
      <Authenticator>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </Authenticator>
    </Authenticator.Provider>
  );
};

export default App;