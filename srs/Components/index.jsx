import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const BaseComponents = ({ 
  onProfilePress, 
  onCommunityHubPress, 
  onBookForLaterPress,
  onParcelsPress,  // New prop for parcels action
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconContainer} onPress={() => {}}>
            <SimpleLineIcons name="home" size={20} color="#139beb" />
            <Text style={styles.text}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onBookForLaterPress}
          >
            <FontAwesome name="bus" size={20} color="#139beb" />
            <Text style={styles.text}>Book For Later</Text>
          </TouchableOpacity>
          
          {/* Parcels Icon */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onParcelsPress}
          >
            <MaterialCommunityIcons 
              name="package-variant-closed" 
              size={20} 
              color="#139beb" 
            />
            <Text style={styles.text}>Parcels</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onCommunityHubPress}
          >
            <FontAwesome name="users" size={20} color="#139beb" />
            <Text style={styles.text}>Community</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f7fafc',
  },
  container: {
    borderTopWidth: 1,
    borderTopColor: '#d1e8ff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#139beb',
    marginTop: 4,
    marginBottom: 6,
    textAlign: 'center',
  },
});

export default BaseComponents;
