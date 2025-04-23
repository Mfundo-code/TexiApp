import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { API, Auth } from "aws-amplify";
import { createRide } from "../../graphql/mutations";
import HomeMap from "../../Components/HomeMap";
import RideComponents from "../../Components/RideComponents";
import MessagesDrawer from "../../Components/MessagesDrawer";
import Eta from "../../Components/Eta";

const RideConfirmation = ({ route, navigation }) => {
    const { 
        rideMatchingPickup, 
        searchPickup, 
        mood,
        recipientName,
        recipientId,
        matchedRideId 
    } = route.params;
    
    const [isMessageDrawerVisible, setMessageDrawerVisible] = useState(false);

    const handleCreateRide = async () => {
        try {
            const user = await Auth.currentAuthenticatedUser();
            const rideInput = {
                mood,
                pickup: {
                    latitude: rideMatchingPickup.latitude,
                    longitude: rideMatchingPickup.longitude,
                    address: rideMatchingPickup.address || "Pickup address",
                },
                userId: user.attributes.sub,
                username: user.username,
                email: user.attributes.email,
            };

            await API.graphql({
                query: createRide,
                variables: { input: rideInput }
            });

            navigation.navigate("RideMatching", {
                rideMatchingPickup,
                searchPickup,
                mood,
            });
        } catch (error) {
            console.error("Error creating ride:", error);
        }
    };

    const toggleMessageDrawer = () => {
        setMessageDrawerVisible(!isMessageDrawerVisible);
    };

    return (
        <View style={styles.container}>
            <HomeMap />
            <Eta rideMatchingPickup={rideMatchingPickup} searchPickup={searchPickup} />
            <RideComponents
                onMessagePress={toggleMessageDrawer}
                onCallPress={handleCreateRide}
                recipientName={recipientName}
            />

            {isMessageDrawerVisible && (
                <MessagesDrawer 
                    onClose={toggleMessageDrawer}
                    recipientName={recipientName}
                    recipientId={recipientId}
                    rideId={matchedRideId}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

export default RideConfirmation;
