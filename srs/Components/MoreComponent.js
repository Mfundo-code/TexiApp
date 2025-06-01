import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "../../App";

const MoreComponent = ({ 
  visible, 
  onClose,
  onRidesListPress,
  onParcelListPress
}) => {
  const { setIsAuthenticated } = useContext(AuthContext);

  if (!visible) return null;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      setIsAuthenticated(false);
      onClose();
      Alert.alert("Logged Out", "You have been logged out successfully!");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert(
        "Logout Error",
        "There was an error logging out. Please try again."
      );
    }
  };

  return (
    <View style={styles.more}>
      <TouchableOpacity 
        style={styles.moreItem}
        onPress={() => {
          onRidesListPress();
          onClose();
        }}
      >
        <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#139beb" />
        <Text style={styles.moreText}>Rides List</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.moreItem}
        onPress={() => {
          onParcelListPress();
          onClose();
        }}
      >
        <MaterialCommunityIcons name="package-variant" size={20} color="#139beb" />
        <Text style={styles.moreText}>Parcel List</Text>
      </TouchableOpacity>

      {/* Added Logout Option */}
      <TouchableOpacity 
        style={styles.moreItem}
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#139beb" />
        <Text style={styles.moreText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  more: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  moreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  moreText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#139beb',
  },
});

export default MoreComponent;