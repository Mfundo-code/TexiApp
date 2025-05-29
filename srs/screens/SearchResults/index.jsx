import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import HomeMap from "../../Components/HomeMap";
import axios from "axios";

const SearchResults = (props) => {
  const { pickup, dropoff, rideType } = props.route.params;
  const { navigation } = props;
  const [validatedPickup, setValidatedPickup] = useState(null);
  const [validatedDropoff, setValidatedDropoff] = useState(null);
  const [eta, setETA] = useState("");
  const [loading, setLoading] = useState(true);

  const GOOGLE_PLACES_API_KEY = "AIzaSyC6a16EquAV6hWaRw4ZAmK222WLmpfncU4";

  const validateLocation = async (location) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${GOOGLE_PLACES_API_KEY}`
      );
      return response.data.results[0]?.formatted_address || null;
    } catch (error) {
      console.error("Validation Error:", error);
      return null;
    }
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateETAUsingHaversine = (pickup, dropoff) => {
    const distanceKm = haversineDistance(
      pickup.latitude,
      pickup.longitude,
      dropoff.latitude,
      dropoff.longitude
    );
    const averageSpeedKmh = 40;
    const timeInHours = distanceKm / averageSpeedKmh;
    const timeInMinutes = Math.round(timeInHours * 60);
    if (timeInMinutes < 60) {
      return `${timeInMinutes} mins`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      return minutes === 0 ? `${hours} hours` : `${hours} hours ${minutes} mins`;
    }
  };

  useEffect(() => {
    const validateAndCalculate = async () => {
      setLoading(true);

      const pickupAddress = await validateLocation(pickup);
      const dropoffAddress = await validateLocation(dropoff);

      if (!pickupAddress || !dropoffAddress) {
        Alert.alert("Error", "Failed to validate locations. Please try again.");
        setLoading(false);
        return;
      }

      const pickupWithAddress = { ...pickup, address: pickupAddress };
      const dropoffWithAddress = { ...dropoff, address: dropoffAddress };

      setValidatedPickup(pickupWithAddress);
      setValidatedDropoff(dropoffWithAddress);

      try {
        const directionsResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.latitude},${pickup.longitude}&destination=${dropoff.latitude},${dropoff.longitude}&key=${GOOGLE_PLACES_API_KEY}`
        );
        let duration = "";
        if (
          directionsResponse.data?.routes?.length > 0 &&
          directionsResponse.data.routes[0]?.legs?.length > 0 &&
          directionsResponse.data.routes[0].legs[0].duration
        ) {
          duration = directionsResponse.data.routes[0].legs[0].duration.text;
        }
        if (!duration) {
          duration = calculateETAUsingHaversine(pickup, dropoff);
        }
        setETA(duration);
      } catch (error) {
        console.error("ETA calculation error:", error);
        const fallbackETA = calculateETAUsingHaversine(pickup, dropoff);
        setETA(fallbackETA);
      }

      setLoading(false);
    };

    validateAndCalculate();
  }, [pickup, dropoff]);

  const handleConfirmRide = () => {
    if (!validatedPickup || !validatedDropoff) {
      Alert.alert("Error", "Locations are not validated yet.");
      return;
    }
    navigation.navigate("RideConfirmation", {
      pickup: validatedPickup,
      dropoff: validatedDropoff,
      rideType: rideType
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Validating locations...</Text>
          </View>
        ) : (
          <HomeMap 
            pickup={validatedPickup} 
            dropoff={validatedDropoff} 
            drawRoute={true} 
            showButtons={false}
          />
        )}
      </View>

      <View style={styles.resultsContainer}>
        {!loading && validatedPickup && validatedDropoff && (
          <>
            <Text style={styles.etaText}>Estimated drive: {eta}</Text>
            <Pressable style={styles.pressable} onPress={handleConfirmRide}>
              <Text style={styles.pressableText}>
                {rideType === 'parcel' ? 'Confirm Parcel Delivery' : 'Confirm Route'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 7,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#75797d",
  },
  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  etaText: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: "center",
    color: "#75797d",
  },
  pressable: {
    backgroundColor: "#007bff",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  pressableText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SearchResults;
