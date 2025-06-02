// SignUpScreen.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

const API_URL = "http://192.168.0.137:8000/api";

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMode, setSelectedMode] = useState("passenger"); // Add this

  const handleSignUp = async () => {
    try {
      const res = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          phone,
          password,
          mode: selectedMode, // Add this
        }),
      });

      const json = await res.json();
      if (res.ok) {
        // store username and mode locally if needed
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("mode", selectedMode); // Optionally store mode
        
        Alert.alert("Success", json.message || "Account created");
        navigation.navigate("SignIn");
      } else {
        const errs = Object.values(json).flat().join("\n");
        Alert.alert("Registration failed", errs);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Password field with eye toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Add mode selection */}
      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedMode === "passenger" && styles.selectedRole,
          ]}
          onPress={() => setSelectedMode("passenger")}
        >
          <Text style={styles.roleText}>👤 Passenger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedMode === "driver" && styles.selectedRole,
          ]}
          onPress={() => setSelectedMode("driver")}
        >
          <Text style={styles.roleText}>🚗 Driver</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("SignIn")}
      >
        <Text style={styles.linkText}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: "#000",
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 16,
  },
  passwordInput: {
    paddingRight: 44, // space for eye icon
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 13,
    padding: 8,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#139beb",
  },
  roleText: {
    fontWeight: "bold",
  },
  button: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  link: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
