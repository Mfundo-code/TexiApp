import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./styles";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const BaseComponents = ({ onProfilePress, onCommunityHubPress, onBookForLaterPress }) => {
    return (
        <View style={styles.BaseComponentsContainer}>
            <View style={styles.BaseIcons}>
                <View style={styles.iconContainer}>
                    <SimpleLineIcons name="home" size={40} color="#139beb" />
                    <Text style={styles.textStyle}>Home</Text>
                </View>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={onBookForLaterPress}
                >
                    <FontAwesome name="bus" size={40} color="#139beb" />
                    <Text style={styles.textStyle}>Book For Later</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={onCommunityHubPress}
                >
                    <FontAwesome name="users" size={40} color="#139beb" />
                    <Text style={styles.textStyle}>Community Hub</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconContainer} onPress={onProfilePress}>
                    <MaterialCommunityIcons name="account" size={40} color="#139beb" />
                    <Text style={styles.textStyle}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default BaseComponents;