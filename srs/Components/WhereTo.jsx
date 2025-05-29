import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";

const WhereTo = (props) => {

  return (
    <View>
      <Pressable onPress={props.onPress} style={styles.inputBox}>
        <Text style={styles.inputText}>Where To?</Text>
        <Entypo name='location-pin' size={28} style={styles.icon} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    backgroundColor: '#e6f2fa', // Light gray background
    borderRadius: 10,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3, // Adds shadow for Android
  },
  inputText: {
    fontSize: 18,
    color: '#000',
    flex: 1, // Makes the text take available space
    fontWeight: 'bold'
  },
  icon: {
    color: '#333', // Dark gray for the icon
  },
});

export default WhereTo;
