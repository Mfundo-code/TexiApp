import React, { useState, useEffect, useContext, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  Text, 
  Linking 
} from "react-native";
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
  const [eta, setETA] = useState("");
  const pollingCountRef = useRef(0);
  const MAX_POLL_ATTEMPTS = 3;
  const intervalRef = useRef(null);

  // Haversine distance helper
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const toRad = deg => (deg * Math.PI) / 180;
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
          const matched = {
            ...data.match,
            user: {
              id: data.match.user.id,
              name: data.match.user.name,
              phone: data.match.user.phone,
            },
          };
          setMatchingRide(matched);
          // calculate ETA for matched ride
          const rideEta = calculateETA(pickup, {
            latitude: data.match.pickup.lat,
            longitude: data.match.pickup.lng
          });
          setETA(rideEta);
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
      if (intervalRef.current) clearInterval(intervalRef.current);
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
      <HomeMap
        pickup={pickup}
        dropoff={{
          latitude: matchingRide.pickup.lat,
          longitude: matchingRide.pickup.lng,
          address: matchingRide.pickup.name
        }}
        drawRoute
        showButtons={false}
      />
    ) : (
      <HomeMap pickup={pickup} showButtons={false} />
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

      {/* ETA Display */}
      <View style={styles.etaContainer}>
        <Text style={styles.etaText}>Estimated drive: {eta}</Text>
      </View>

      <RideComponents
        onMessagePress={() => setMessageDrawerVisible(true)}
        onCallPress={handleCallPress}
        recipientName={matchingRide.user.name}
        // Add parcel-specific icon
        isParcel={rideType === 'parcel'}
      />

      {isMessageDrawerVisible && (
        <MessagesDrawer
          onClose={() => setMessageDrawerVisible(false)}
          recipient={{
            id: matchingRide.user.id,
            username: matchingRide.user.name,
            phone: matchingRide.user.phone
          }}
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
  etaContainer: {
    padding: 2,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
  },
  etaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#75797d',
  },
});

export default RideConfirmation;
