import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as RNLocalize from "react-native-localize";
import { API_URL } from "../../config";

const COUNTRIES = [
  { name: "South Africa", code: "ZA", dial_code: "+27", flag: "🇿🇦" },
  { name: "Zambia", code: "ZM", dial_code: "+260", flag: "🇿🇲" },
  { name: "Nigeria", code: "NG", dial_code: "+234", flag: "🇳🇬" },
  { name: "Kenya", code: "KE", dial_code: "+254", flag: "🇰🇪" },
  { name: "Ghana", code: "GH", dial_code: "+233", flag: "🇬🇭" },
  { name: "United States", code: "US", dial_code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dial_code: "+44", flag: "🇬🇧" },
  { name: "India", code: "IN", dial_code: "+91", flag: "🇮🇳" },
  { name: "Swaziland", code: "SZ", dial_code: "+268", flag: "🇸🇿" },
  { name: "Botswana", code: "BW", dial_code: "+267", flag: "🇧🇼" },
];

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMode, setSelectedMode] = useState("");
  const [roleDropdownVisible, setRoleDropdownVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const detectCountry = () => {
      const deviceCountryCode = RNLocalize.getCountry() || "ZA";
      const country =
        COUNTRIES.find(c => c.code === deviceCountryCode) || COUNTRIES[0];
      setSelectedCountry(country);
    };

    detectCountry();
  }, []);

  const validateForm = () => {
    if (!username.trim()) return "Username is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email address";
    if (!selectedCountry || !phone) return "Phone number is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!selectedMode) return "Please select your role";
    return null;
  };

  const handleSignUp = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${selectedCountry.dial_code}${phone}`;

      const res = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          phone: fullPhone,
          password,
          mode: selectedMode,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        navigation.navigate("EmailConfirmation", { 
          email,
          username,
          mode: selectedMode,
        });
      } else {
        // Handle backend validation errors
        let errorMessage = "Registration failed";
        if (json.email) errorMessage = json.email[0];
        if (json.phone) errorMessage = json.phone[0];
        if (json.username) errorMessage = json.username[0];
        if (json.password) errorMessage = json.password[0];
        
        Alert.alert("Registration Error", errorMessage);
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRoleDropdown = () => {
    setRoleDropdownVisible(prev => !prev);
    if (countryPickerVisible) setCountryPickerVisible(false);
  };

  const pickRole = role => {
    setSelectedMode(role);
    setRoleDropdownVisible(false);
  };

  const toggleCountryPicker = () => {
    setCountryPickerVisible(prev => !prev);
    if (roleDropdownVisible) setRoleDropdownVisible(false);
  };

  const selectCountry = country => {
    setSelectedCountry(country);
    setCountryPickerVisible(false);
  };

  const searchCountries = text => {
    if (text) {
      const filtered = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(text.toLowerCase()) ||
        country.dial_code.includes(text)
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(COUNTRIES);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
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

      <View style={styles.phoneContainer}>
        <TouchableOpacity 
          style={styles.countrySelector}
          onPress={toggleCountryPicker}
        >
          <Text style={styles.countryText}>
            {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.dial_code}` : "Select"}
          </Text>
          <Ionicons
            name={countryPickerVisible ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#666" 
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
        
        <TextInput
          style={styles.phoneInput}
          placeholder="Phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
        />
      </View>

      {countryPickerVisible && (
        <View style={styles.countryPicker}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search country..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            onChangeText={searchCountries}
          />
          <ScrollView style={styles.countryList}>
            {filteredCountries.map(country => (
              <TouchableOpacity
                key={country.code}
                style={[
                  styles.countryItem,
                  selectedCountry?.code === country.code && styles.selectedCountry
                ]}
                onPress={() => selectCountry(country)}
              >
                <Text style={styles.countryItemText}>
                  {country.flag} {country.name} ({country.dial_code})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password (min 8 characters)"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(prev => !prev)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.input} 
        onPress={toggleRoleDropdown}
        activeOpacity={0.7}
      >
        <Text style={selectedMode ? styles.selectedText : styles.placeholderText}>
          {selectedMode 
            ? selectedMode === "passenger" 
              ? "👤 Passenger" 
              : "🚗 Driver" 
            : "Register as"}
        </Text>
        <Ionicons
          name={roleDropdownVisible ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>

      {roleDropdownVisible && (
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedMode === "driver" && styles.selectedRole,
            ]}
            onPress={() => pickRole("driver")}
          >
            <Text style={styles.roleText}>🚗 Driver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedMode === "passenger" && styles.selectedRole,
            ]}
            onPress={() => pickRole("passenger")}
          >
            <Text style={styles.roleText}>👤 Passenger</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.disabledButton]} 
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("SignIn")}
      >
        <Text style={styles.linkText}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: "#000",
    position: "relative",
  },
  placeholderText: {
    color: "#999",
    flex: 1,
  },
  selectedText: {
    color: "#000",
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    color: "#000",
    height: "100%",
  },
  eyeButton: {
    marginLeft: 8,
    padding: 4,
  },
  roleContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  roleButton: {
    width: 120,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  selectedRole: {
    backgroundColor: "#139beb",
  },
  roleText: {
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#99c2ff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  link: {
    marginTop: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
  phoneContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    minWidth: 80,
  },
  countryText: {
    color: "#000",
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#000",
  },
  countryPicker: {
    maxHeight: 200,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  countryList: {
    maxHeight: 150,
  },
  countryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedCountry: {
    backgroundColor: "#e6f7ff",
  },
  countryItemText: {
    fontSize: 16,
    color: "#333",
  },
  searchInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 12,
    color: "#000",
  },
});