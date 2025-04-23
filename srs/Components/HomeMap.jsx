import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';

const GOOGLE_MAPS_API_KEY = 'AIzaSyC6a16EquAV6hWaRw4ZAmK222WLmpfncU4';

const HomeMap = ({ pickup, dropoff, drawRoute = false }) => {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

  // Fetch the user's current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location: ', error);
        Alert.alert(
          'Location Error',
          'Unable to fetch your current location. Please verify your location settings.'
        );
      },
      { enableHighAccuracy: false, timeout: 255000, maximumAge: 10000 }
    );
  };

  // Fetch the route between pickup and dropoff if drawRoute is true
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
          origin: {
            location: {
              latLng: { latitude: origin.latitude, longitude: origin.longitude },
            },
          },
          destination: {
            location: {
              latLng: { latitude: destination.latitude, longitude: destination.longitude },
            },
          },
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

      if (!response.data.routes || response.data.routes.length === 0) {
        Alert.alert('No Routes Found', 'Could not find a route between the locations.');
        return;
      }

      const encodedPolyline = response.data.routes[0].polyline.encodedPolyline;
      setCoordinates(decodePolyline(encodedPolyline));
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Route Error', 'There was an error fetching the route. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  // Adjust the map view to fit the markers and route
  useEffect(() => {
    if (mapRef.current) {
      const allCoords = [];
      if (currentLocation) allCoords.push(currentLocation);
      if (pickup) allCoords.push(pickup);
      if (dropoff) allCoords.push(dropoff);
      if (coordinates.length > 0) allCoords.push(...coordinates);

      if (allCoords.length > 0) {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [currentLocation, pickup, dropoff, coordinates]);

  const handleRecenter = () => {
    if (mapRef.current) {
      const allCoords = [];
      if (currentLocation) allCoords.push(currentLocation);
      if (pickup) allCoords.push(pickup);
      if (dropoff) allCoords.push(dropoff);
      if (coordinates.length > 0) allCoords.push(...coordinates);

      if (allCoords.length > 0) {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  };

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
            {currentLocation && <Marker coordinate={currentLocation} title="Your Location" />}
            {pickup && <Marker coordinate={pickup} title="Pickup Location" />}
            {dropoff && <Marker coordinate={dropoff} title="Dropoff Location" />}
            {drawRoute && coordinates.length > 0 && (
              <Polyline coordinates={coordinates} strokeWidth={4} strokeColor="blue" />
            )}
          </MapView>
          <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
            <Text style={styles.buttonText}>Recenter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 665,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeMap;
