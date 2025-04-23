import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import axios from "axios";

const GOOGLE_PLACES_API_KEY = "AIzaSyC6a16EquAV6hWaRw4ZAmK222WLmpfncU4";

const Eta = ({ rideMatchingPickup, searchPickup }) => {
  const [eta, setEta] = useState("");

  useEffect(() => {
    const fetchETA = async () => {
      try {
        const directionsResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${rideMatchingPickup.latitude},${rideMatchingPickup.longitude}&destination=${searchPickup.latitude},${searchPickup.longitude}&key=${GOOGLE_PLACES_API_KEY}`
        );
        let duration = "";
        if (
          directionsResponse.data?.routes?.length > 0 &&
          directionsResponse.data.routes[0]?.legs?.length > 0 &&
          directionsResponse.data.routes[0].legs[0].duration
        ) {
          duration = directionsResponse.data.routes[0].legs[0].duration.text;
        }
        setEta(duration);
      } catch (error) {
        console.error("Error fetching ETA:", error);
        setEta("Could not calculate ETA");
      }
    };

    if (rideMatchingPickup && searchPickup) {
      fetchETA();
    }
  }, [rideMatchingPickup, searchPickup]);

  return (
    <View>
      <Text style={styles.etaText}>
        Estimated Driving Time: {eta || "Calculating..."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  etaText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#686d70",
    textAlign: "center",
  },
});

export default Eta;
