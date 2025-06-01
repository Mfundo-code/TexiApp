// WhereTo.js

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";

const WhereTo = ({ onPress }) => {
  return (
    <View>
      <Pressable 
        onPress={onPress} 
        style={styles.inputBox}
      >
        <Text style={styles.inputText}>Where To?</Text>
        <Entypo name="location-pin" size={28} style={styles.icon} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    backgroundColor: "#e6f2fa",
    borderRadius: 10,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  inputText: {
    fontSize: 18,
    color: "#000",
    flex: 1,
    fontWeight: "bold",
  },
  icon: {
    color: "#333",
  },
});

export default WhereTo;
