import React, { useState, useEffect, useContext, useRef } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, Text, Linking } from "react-native";
import HomeMap from "../../Components/HomeMap";
import RideComponents from "../../Components/RideComponents";
import MessagesDrawer from "../../Components/MessagesDrawer";
import axios from "axios";
import { AuthContext } from "../../../App";


const RideConfirmation = ({ route, navigation }) => {
  const { authToken } = useContext(AuthContext);
  const { pickup, dropoff, rideType } = route.params;
  const [isMessageDrawerVisible, setMessageDrawerVisible] = useState(false);
  const [matchingRide, setMatchingRide] = useState(null);

  const pollingCountRef = useRef(0);
  const MAX_POLL_ATTEMPTS = 5;
  const intervalRef = useRef(null);

  useEffect(() => {
    let rideId;

    const checkForMatch = async () => {
      pollingCountRef.current += 1;

      try {
        const { data } = await axios.get(
          `http://192.168.0.137:8000/api/rides/${rideId}/matches/`,
          { headers: { Authorization: `Token ${authToken}` } }
        );

        if (data.match) {
          clearInterval(intervalRef.current);
          setMatchingRide({
            ...data.match,
            pickup: {
              latitude: data.match.pickup.lat,
              longitude: data.match.pickup.lng,
              address: data.match.pickup.name,
            },
            user: {
              name: data.match.user.name,
              phone: data.match.user.phone,
            },
          });
        } else if (pollingCountRef.current >= MAX_POLL_ATTEMPTS) {
          clearInterval(intervalRef.current);
          Alert.alert("Timeout", "No matches found. Please try again.");
          navigation.goBack();
        }
      } catch (pollError) {
        console.error("Error checking matches:", pollError);
        clearInterval(intervalRef.current);
        Alert.alert("Error", "Failed to find matches. Please try again.");
        navigation.goBack();
      }
    };

    const createAndStartPolling = async () => {
      try {
        const createResponse = await axios.post(
          "http://192.168.0.137:8000/api/rides/",
          {
            ride_type: rideType === "driver" ? "offer" : "request",
            pickup_name: pickup.address,
            pickup_lat: pickup.latitude,
            pickup_lng: pickup.longitude,
            dropoff_name: dropoff.address,
            dropoff_lat: dropoff.latitude,
            dropoff_lng: dropoff.longitude,
          },
          {
            headers: {
              Authorization: `Token ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        rideId = createResponse.data.id;
        intervalRef.current = setInterval(checkForMatch, 5000);
      } catch (error) {
        console.error("Ride creation error:", error);
        Alert.alert("Error", "Failed to create ride");
        navigation.goBack();
      }
    };

    createAndStartPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [authToken, pickup, dropoff, rideType, navigation]);

  const handleCallPress = () => {
    if (matchingRide?.user?.phone) {
      Linking.openURL(`tel:${matchingRide.user.phone}`);
    } else {
      Alert.alert("Error", "Phone number not available");
    }
  };

  const renderMap = () =>
    matchingRide ? (
      <HomeMap pickup={pickup} dropoff={matchingRide.pickup} drawRoute />
    ) : (
      <HomeMap pickup={pickup} />
    );

  if (!matchingRide) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.loader} />
        <Text style={styles.loadingText}>
          {pollingCountRef.current === 0
            ? "Creating ride..."
            : `Searching for matches (${pollingCountRef.current})...`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderMap()}

      <RideComponents
        onMessagePress={() => setMessageDrawerVisible(true)}
        onCallPress={handleCallPress}
        recipientName={matchingRide.user.name}
      />

      {isMessageDrawerVisible && (
        <MessagesDrawer
          onClose={() => setMessageDrawerVisible(false)}
          recipientName={matchingRide.user.name}
          phoneNumber={matchingRide.user.phone}
          rideId={matchingRide.id}
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
  loader: {
    marginTop: 50,
  },
  loadingText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});

export default RideConfirmation;