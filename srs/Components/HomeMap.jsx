import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  Easing
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { AuthContext } from '../../App';

const GOOGLE_MAPS_API_KEY = 'AIzaSyC6a16EquAV6hWaRw4ZAmK222WLmpfncU4';
const { width } = Dimensions.get('window');

const HomeMap = ({
  navigation,
  pickup,
  dropoff,
  drawRoute = false,
  showButtons = false
}) => {
  const { authToken } = useContext(AuthContext);

  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [textWidth, setTextWidth] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const mapRef = useRef(null);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Get user location
  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLoading(false);
      },
      error => {
        console.error('Error getting location: ', error);
        Alert.alert(
          'Location Error',
          'Unable to fetch your current location. Please verify your location settings.'
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 255000, maximumAge: 10000 }
    );
  }, []);

  // Draw route when pickup/dropoff change
  useEffect(() => {
    if (drawRoute && pickup && dropoff) {
      fetchRoute(pickup, dropoff);
    }
  }, [pickup, dropoff, drawRoute]);

  const fetchRoute = async (origin, destination) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: { location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } } },
          destination: { location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } } },
          travelMode: 'DRIVE',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
          },
        }
      );

      if (!response.data.routes?.length) {
        Alert.alert('No Routes Found', 'Could not find a route between the locations.');
        setLoading(false);
        return;
      }

      const encoded = response.data.routes[0].polyline.encodedPolyline;
      setCoordinates(decodePolyline(encoded));
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Route Error', 'There was an error fetching the route. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const decodePolyline = encoded => {
    const points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  // Fit map to all points
  useEffect(() => {
    if (mapRef.current) {
      const allCoords = [
        ...(currentLocation ? [currentLocation] : []),
        ...(pickup ? [pickup] : []),
        ...(dropoff ? [dropoff] : []),
        ...coordinates,
      ];
      if (allCoords.length) {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [currentLocation, pickup, dropoff, coordinates]);

  const handleMessages = () => {
    navigation.navigate('Chats');
  };

  // Marquee text animation
  useEffect(() => {
    if (textWidth > 0) {
      const duration = (textWidth / 30) * 1000;
      Animated.loop(
        Animated.timing(scrollAnim, {
          toValue: -textWidth,
          duration,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    }
  }, [textWidth]);

  // Fixed unread count fetching
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get('https://www.findtexi.com/api/messages/unread-count/', {
        headers: { Authorization: `Token ${authToken}` }
      });
      setUnreadCount(response.data.unread_count || 0);  // Ensure 0 if null
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);  // Reset on error
    }
  }, [authToken]);

  useEffect(() => {
    if (showButtons) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);  // Reset when not showing buttons
    }
  }, [showButtons, fetchUnreadCount]);

  // Reset unread count on unmount
  useEffect(() => {
    return () => setUnreadCount(0);
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation?.latitude || 0,
              longitude: currentLocation?.longitude || 0,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {currentLocation && <Marker coordinate={currentLocation} title="Your Location" pinColor="blue" />}
            {pickup && <Marker coordinate={pickup} title="Pickup Location" />}
            {dropoff && <Marker coordinate={dropoff} title="Dropoff Location" />}
            {drawRoute && coordinates.length > 0 && <Polyline coordinates={coordinates} strokeWidth={4} strokeColor="blue" />}
          </MapView>

          {showButtons && (
            <>
              <View style={styles.marqueeContainer}>
                <Animated.View style={{ transform: [{ translateX: scrollAnim }] }}>
                  <Text
                    style={styles.marqueeText}
                    onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
                  >
                    FindTexi is a reliable and secure platform. Your safety is our top priority
                  </Text>
                </Animated.View>
              </View>

              <TouchableOpacity style={styles.messagesButton} onPress={handleMessages}>
                <Icon name="message-text" size={24} color="#2196F3" />
                {unreadCount > 0 ? (
                  <View style={styles.messageBadge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 605,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marqueeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 80,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  marqueeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#292c2e',
    whiteSpace: 'nowrap',
    paddingHorizontal: 10,
  },
  messagesButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  messageBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeMap;