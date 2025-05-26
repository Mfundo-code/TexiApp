import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";

const RideComponents = ({ onMessagePress, onCallPress, recipientName }) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.rideIcons}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="account" size={40} color="#139beb" />
                        <Text style={styles.iconText}>{recipientName}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconContainer} onPress={onMessagePress}>
                        <AntDesign name="message1" size={40} color="#139beb" />
                        <Text style={styles.iconText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconContainer} onPress={onCallPress}>
                        <AntDesign name="phone" size={40} color="#139beb" />
                        <Text style={styles.iconText}>Call</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
  container: {
    // Ensures the component occupies the bottom area under the map
    width: "100%",
    position: "absolute",
    bottom: 0,
    padding: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 15,
    shadowColor: "#000", // Creates an elevated card feel
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  rideIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: "#f0f9ff", // Consistent light blue background for icons
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000", // Subtle shadow to elevate the icon containers
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "600",
    color: "#139beb",
    textAlign: "center",
  },
});

export default RideComponents;
