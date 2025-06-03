import React, { useState, useRef, useEffect, useContext } from "react";
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Linking,
  TouchableOpacity 
} from "react-native";
import HomeMap from "../../Components/HomeMap";
import RideComponents from "../../Components/RideComponents";
import axios from "axios";
import { AuthContext } from "../../../App";
import Icon from 'react-native-vector-icons/FontAwesome';

const RideConfirmation = ({ route, navigation }) => {
  const { authToken } = useContext(AuthContext);
  const { pickup, dropoff, rideType } = route.params;

  const [matchingRide, setMatchingRide] = useState(null);
  const [eta, setETA] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [rideSaved, setRideSaved] = useState(false);

  const pollingCountRef = useRef(0);
  const MAX_POLL_ATTEMPTS = 2;
  const intervalRef = useRef(null);
  const currentRideIdRef = useRef(null);

  // Haversine distance helper
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateETA = (start, end) => {
    const distanceKm = haversineDistance(
      start.latitude, start.longitude,
      end.latitude, end.longitude
    );
    const averageSpeedKmh = 40;
    const timeH = distanceKm / averageSpeedKmh;
    const timeMin = Math.round(timeH * 60);
    if (timeMin < 60) return `${timeMin} mins`;
    const hr = Math.floor(timeMin / 60);
    const min = timeMin % 60;
    return min === 0 ? `${hr} hours` : `${hr} hours ${min} mins`;
  };

  const deleteRide = async (rideId) => {
    try {
      await axios.delete(
        `http://192.168.0.137:8000/api/rides/${rideId}/`,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      return true;
    } catch (error) {
      console.error("Error deleting ride:", error);
      return false;
    }
  };

  const checkForMatch = async (rideId) => {
    pollingCountRef.current += 1;

    try {
      const { data } = await axios.get(
        `http://192.168.0.137:8000/api/rides/${rideId}/matches/`,
        { headers: { Authorization: `Token ${authToken}` } }
      );

      if (data.match) {
        // Stop polling immediately
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        const matched = {
          ...data.match,
          user: {
            id: data.match.user.id,
            name: data.match.user.name,
            phone: data.match.user.phone,
          },
        };

        const rideEta = calculateETA(pickup, {
          latitude: matched.pickup.lat,
          longitude: matched.pickup.lng,
        });
        setETA(rideEta);
        setMatchingRide(matched);
        setIsLoading(false);

      } else if (pollingCountRef.current >= MAX_POLL_ATTEMPTS) {
        // No match found within max attempts → ride is auto-saved
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRideSaved(true);
        setIsLoading(false);

        // No more Alert here, because the UI already shows saved state
      }
    } catch (pollError) {
      console.error("Error checking matches:", pollError);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      Alert.alert("Error", "Failed to find matches. Please try again.");
    }
  };

  const createAndStartPolling = async () => {
    try {
      // If somehow an existing interval exists, clear it
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setIsLoading(true);
      pollingCountRef.current = 0;

      const createResponse = await axios.post(
        "http://192.168.0.137:8000/api/rides/",
        {
          ride_type: rideType,
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

      const rideId = createResponse.data.id;
      currentRideIdRef.current = rideId;

      // Poll every 5 seconds
      intervalRef.current = setInterval(() => checkForMatch(rideId), 5000);
    } catch (error) {
      console.error("Ride creation error:", error);
      Alert.alert("Error", "Failed to create ride");
    }
  };

  const handleCallPress = () => {
    if (matchingRide?.user?.phone) {
      Linking.openURL(`tel:${matchingRide.user.phone}`);
    } else {
      Alert.alert("Error", "Phone number not available");
    }
  };

  const handleMessagePress = () => {
    if (matchingRide && matchingRide.user) {
      navigation.navigate("MessageScreen", {
        recipient: {
          id: matchingRide.user.id,
          username: matchingRide.user.name,
          phone: matchingRide.user.phone,
        },
      });
    }
  };

  const handleDone = () => {
    // Simply navigate home—no further accept/confirm step
    navigation.navigate("Home");
  };

  useEffect(() => {
    createAndStartPolling();

    return () => {
      // On unmount, just clear polling interval; do NOT delete the ride
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
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

  if (rideSaved) {
    // Ride was auto-saved after polling attempts
    return (
      <View style={styles.savedContainer}>
        <Icon name="check-circle" size={60} color="#4CAF50" />
        <Text style={styles.savedTitle}>Ride Saved Successfully!</Text>
        <Text style={styles.savedText}>
          {rideType === "request" || rideType === "parcel"
            ? "A driver will contact you when available."
            : "A passenger will contact you when available."}
        </Text>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Icon name="check" size={24} color="#fff" />
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // At this point, matchingRide is non-null (a match was found)
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <HomeMap
          pickup={pickup}
          dropoff={{
            latitude: matchingRide.pickup.lat,
            longitude: matchingRide.pickup.lng,
            address: matchingRide.pickup.name,
          }}
          drawRoute
          showButtons={false}
        />

        <View style={styles.etaContainer}>
          <Text style={styles.etaText}>Estimated drive: {eta}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.doneButton]} onPress={handleDone}>
            <Icon name="check" size={24} color="#fff" />
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <RideComponents
          onMessagePress={handleMessagePress}
          onCallPress={handleCallPress}
          recipientName={matchingRide.user.name}
          isParcel={rideType === "parcel"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  savedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  savedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  savedText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
    paddingHorizontal: 20,
  },
  doneButton: {
    flexDirection: "row",
    backgroundColor: "#139beb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "97%",
  },
  doneButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
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
  etaContainer: {
    padding: 6,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
  },
  etaText: {
    fontSize: 18,
    color: "#75797d",
  },
  contentContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 2,
    backgroundColor: "#f0f8ff",
    marginBottom: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginHorizontal: 5,
    marginTop: 1,
  },
});

export default RideConfirmation;
