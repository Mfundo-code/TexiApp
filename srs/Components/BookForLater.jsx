import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import dayjs from 'dayjs';
import axios from 'axios';
import { AuthContext } from '../../App';

const BookForLater = ({ onClose }) => {
  const { authToken } = useContext(AuthContext);
  const [fromText, setFromText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [departureTime, setDepartureTime] = useState(dayjs().format('YYYY-MM-DD HH:mm'));
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [selectedRole, setSelectedRole] = useState('passenger');

  const GOOGLE_PLACES_API_KEY = 'AIzaSyC6a16EquAV6hWaRw4ZAmK222WLmpfncU4'; // Replace with your actual key

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
    const getCurrentLocation = () => {
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

      isFrom
        ? setFromSuggestions(suggestions)
        : setDestinationSuggestions(suggestions);
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
    if (!currentLocation || !destinationCoords || !departureTime) {
      Alert.alert('Error', 'Please select valid locations and set a departure time');
      return;
    }

    try {
      const rideType = selectedRole === 'driver' ? 'offer' : 'request';

      await axios.post(
        'http://192.168.0.137:8000/api/rides/', // Replace with your actual API endpoint
        {
          ride_type: rideType,
          pickup_name: fromText,
          pickup_lat: currentLocation.latitude,
          pickup_lng: currentLocation.longitude,
          dropoff_name: destinationText,
          dropoff_lat: destinationCoords.latitude,
          dropoff_lng: destinationCoords.longitude,
          departure_time: dayjs(departureTime).toISOString(),
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Success', 'Ride created successfully!', [
        { text: 'OK', onPress: onClose },
      ]);
    } catch (error) {
      console.error('Create Ride Error:', error);
      Alert.alert('Error', 'Failed to create ride');
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
          onChangeText={setDepartureTime}
        />
      </View>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'driver' && styles.selectedRole
          ]}
          onPress={() => setSelectedRole('driver')}
        >
          <Text style={styles.roleText}>🚗 Driver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'passenger' && styles.selectedRole
          ]}
          onPress={() => setSelectedRole('passenger')}
        >
          <Text style={styles.roleText}>👤 Passenger</Text>
        </TouchableOpacity>
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
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#139beb',
  },
  roleText: {
    fontWeight: 'bold',
    color: '#000',
  },
});

export default BookForLater;
