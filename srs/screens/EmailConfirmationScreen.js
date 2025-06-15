import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const API_URL = "http://192.168.0.137:8000/api";

const EmailConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(600);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleResend = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/resend-code/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const json = await res.json();
      if (res.ok) {
        Alert.alert("Success", "New verification code sent to your email");
        setTimer(600);
      } else {
        Alert.alert("Error", json.error || "Failed to resend code");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Error", "Please enter a 6-digit code");
      return;
    }
    
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/confirm-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });
      
      const json = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Email verified successfully!");
        navigation.navigate("SignIn");
      } else {
        Alert.alert("Error", json.error || "Verification failed");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCodeChange = (value, index) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (value && index < 5) {
      refs[index + 1]?.focus();
    }
    
    if (index === 5 && value) {
      handleSubmit();
    }
  };
  
  const refs = [];
  for (let i = 0; i < 6; i++) {
    refs[i] = React.createRef();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {email}
      </Text>
      
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (refs[index] = ref)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
      
      <Text style={styles.timerText}>
        {timer > 0 ? `Code expires in ${formatTime(timer)}` : "Code expired"}
      </Text>
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Verifying..." : "Verify Email"}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={handleResend}
        disabled={timer > 0 || isLoading}
      >
        <Text style={[
          styles.resendText,
          (timer > 0 || isLoading) && styles.disabledResend
        ]}>
          Resend Code
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 5,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  timerText: {
    textAlign: "center",
    marginBottom: 20,
    color: "#e74c3c",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#b0c4de",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  resendText: {
    textAlign: "center",
    color: "#007AFF",
    fontSize: 16,
  },
  disabledResend: {
    color: "#ccc",
  },
});

export default EmailConfirmationScreen;