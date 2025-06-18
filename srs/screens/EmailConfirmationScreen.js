// src/screens/EmailConfirmationScreen.js (adjust path as needed)
import React, { useState, useEffect, useRef } from "react";
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
import { API_URL } from "../../config"; // Adjust this path if needed

const EmailConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  // State for each digit of the 6-digit code
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  // Timer in seconds (e.g., 600 seconds = 10 minutes)
  const [timer, setTimer] = useState(600);
  const [isLoading, setIsLoading] = useState(false);

  // Refs array for TextInput fields
  const inputRefs = useRef([]);

  // Ref to hold the interval ID so we can clear/restart as needed
  const intervalRef = useRef(null);

  // Start or restart the countdown interval
  const startTimer = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Set initial time if not already set (e.g., after resend)
    // We assume setTimer was called before startTimer when resetting.
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // On mount, start the timer
  useEffect(() => {
    startTimer();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // We intentionally run this effect only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle resend code
  const handleResend = async () => {
    // Only allow resend when timer has expired
    if (timer > 0) return;

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
        // Reset code inputs
        setCode(["", "", "", "", "", ""]);
        // Reset timer
        setTimer(600);
        // Restart timer interval
        startTimer();
        // Focus first input
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        Alert.alert("Error", json.error || "Failed to resend code");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submitting the full 6-digit code
  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6 || code.some((digit) => digit === "")) {
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

  // Handle change in a single digit input
  const handleCodeChange = (text, index) => {
    // Only allow numeric input
    const cleanText = text.replace(/[^0-9]/g, "");
    if (cleanText.length > 1) {
      // If pasted or inserted multiple digits, take only the first
      return;
    }
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    if (cleanText) {
      // Move to next input if exists
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
      // If last digit filled, auto-submit
      if (index === 5) {
        handleSubmit();
      }
    }
  };

  // Handle key press to manage backspace focus
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (
      nativeEvent.key === "Backspace" &&
      code[index] === "" &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      // Move focus to previous input
      inputRefs.current[index - 1].focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

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
            ref={(el) => (inputRefs.current[index] = el)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            returnKeyType="done"
          />
        ))}
      </View>

      <Text style={styles.timerText}>
        {timer > 0
          ? `Code expires in ${formatTime(timer)}`
          : "Code expired. You can resend."}
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
        <Text
          style={[
            styles.resendText,
            (timer > 0 || isLoading) && styles.disabledResend,
          ]}
        >
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
