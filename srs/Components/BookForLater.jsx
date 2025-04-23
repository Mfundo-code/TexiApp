import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, StyleSheet } from 'react-native';
import { API, Auth } from 'aws-amplify';
import { createRide } from '../../graphql/mutations';
import Geolocation from '@react-native-community/geolocation';
import dayjs from 'dayjs';
import axios from 'axios';

const BookForLater = ({ onClose }) => {
  const [fromText, setFromText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [departureTime, setDepartureTime] = useState(dayjs().format('YYYY-MM-DD HH:mm'));
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);

  const GOOGLE_PLACES_API_KEY = 'AIzaSyC6a16EquAV6hWaRw4ZAmK222WLmpfncU4';

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`
      );
      return response.data.results[0]?.formatted_address || 'Unknown Location';
    } catch (error) {
      console.error('Reverse Geocode Error:', error);
      return 'Unknown Location';
    }
  };

  const fetchPlaceCoordinates = async (placeId) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const { lat, lng } = response.data.result.geometry.location;
      return { latitude: lat, longitude: lng };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  useEffect(() => {
    const getCurrentLocation = async () => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocode(latitude, longitude);
          setCurrentLocation({ latitude, longitude });
          setFromText(address);
        },
        (error) => Alert.alert('Error', error.message),
        { enableHighAccuracy: false, timeout: 220000, maximumAge: 3000 }
      );
    };
    getCurrentLocation();
  }, []);

  const fetchPlaces = async (text, isFrom) => {
    if (text.length < 2) {
      isFrom ? setFromSuggestions([]) : setDestinationSuggestions([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_PLACES_API_KEY}&language=en`;
      const response = await axios.get(url);
      let suggestions = response.data.predictions;

      if (isFrom && currentLocation) {
        suggestions = [
          {
            description: 'Current Location',
            place_id: 'current',
            coords: currentLocation,
          },
          ...suggestions,
        ];
      }

      isFrom ? setFromSuggestions(suggestions) : setDestinationSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handleLocationSelect = async (item, isFrom) => {
    if (item.place_id === 'current') {
      if (isFrom) {
        setFromText(item.description);
        setCurrentLocation(item.coords);
      }
      return;
    }

    const coords = await fetchPlaceCoordinates(item.place_id);
    if (coords) {
      if (isFrom) {
        setFromText(item.description);
        setCurrentLocation(coords);
        setFromSuggestions([]);
      } else {
        setDestinationText(item.description);
        setDestinationCoords(coords);
        setDestinationSuggestions([]);
      }
    }
  };

  const handleConfirmRide = async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Please select driver or passenger');
      return;
    }
    if (!currentLocation || !destinationCoords || !departureTime) {
      Alert.alert('Error', 'Please select valid locations and set a departure time');
      return;
    }

    try {
      const user = await Auth.currentAuthenticatedUser();
      
      const rideInput = {
        mood: selectedMood.toUpperCase(),
        pickup: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          address: fromText,
        },
        dropoff: {
          latitude: destinationCoords.latitude,
          longitude: destinationCoords.longitude,
          address: destinationText,
        },
        departureTime: dayjs(departureTime).toISOString(),
        userId: user.attributes.sub,
        username: user.username,
        email: user.attributes.email,
      };

      await API.graphql({
        query: createRide,
        variables: { input: rideInput }
      });

      const successMessage = selectedMood === 'driver' 
        ? "Ride created! We'll connect you with passengers when it's time to go."
        : "Ride booked! Your driver will contact you when it's time to go.";

      Alert.alert('Success', successMessage, [
        { text: 'OK', onPress: onClose }
      ]);
      
    } catch (error) {
      console.error('Error creating ride:', error);
      Alert.alert('Error', 'Failed to save ride details. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Information</Text>

      <View style={styles.inputContainer}>
        <Text>From:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter pickup location"
          value={fromText}
          onChangeText={(text) => {
            setFromText(text);
            fetchPlaces(text, true);
          }}
        />
        {fromSuggestions.length > 0 && (
          <FlatList
            data={fromSuggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleLocationSelect(item, true)}>
                <Text style={styles.suggestionItem}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text>Destination:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter destination"
          value={destinationText}
          onChangeText={(text) => {
            setDestinationText(text);
            fetchPlaces(text, false);
          }}
        />
        {destinationSuggestions.length > 0 && (
          <FlatList
            data={destinationSuggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleLocationSelect(item, false)}>
                <Text style={styles.suggestionItem}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text>Departure Time:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DD HH:mm"
          value={departureTime}
          onChangeText={(text) => setDepartureTime(text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>You are:</Text>
        <View style={styles.moodContainer}>
          <TouchableOpacity 
            style={[
              styles.moodButton, 
              selectedMood === 'driver' && styles.selectedMood
            ]}
            onPress={() => setSelectedMood('driver')}
          >
            <Text style={styles.moodText}>🚗 Driver</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.moodButton, 
              selectedMood === 'passenger' && styles.selectedMood
            ]}
            onPress={() => setSelectedMood('passenger')}
          >
            <Text style={styles.moodText}>👤 Passenger</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleConfirmRide}>
        <Text style={styles.buttonText}>Confirm Ride</Text>
      </TouchableOpacity>

      <View style={styles.closeButtonContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    height: '88.5%',
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginVertical: 10,
  },
  textInput: {
    height: 40,
    color: '#5d5d5d',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  suggestionItem: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButtonContainer: {
    alignItems: 'center',
    backgroundColor: '#ededed',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 20, 
  },
  closeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  moodButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedMood: {
    backgroundColor: '#007AFF',
  },
  moodText: {
    fontWeight: 'bold',
  },
});

export default BookForLater;