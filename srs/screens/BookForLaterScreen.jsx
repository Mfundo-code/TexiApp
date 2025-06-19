// BookForLaterScreen.js
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
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../../App';
import dayjs from 'dayjs'; // Import dayjs

const BookForLaterScreen = () => {
  const navigation = useNavigation();
  const { authToken, mode } = useContext(AuthContext);

  const [fromText, setFromText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  // Initialize with current date/time using dayjs
  const [departureTime, setDepartureTime] = useState(dayjs().format('YYYY-MM-DD HH:mm'));
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

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
        setFromSuggestions([]);
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

    // Validate date format (YYYY-MM-DD HH:mm)
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dateRegex.test(departureTime)) {
      Alert.alert('Error', 'Please use format: YYYY-MM-DD HH:mm');
      return;
    }

    // Validate if departure time is in the future
    const selectedTime = dayjs(departureTime, 'YYYY-MM-DD HH:mm');
    if (selectedTime.isBefore(dayjs())) {
      Alert.alert('Error', 'Departure time must be in the future');
      return;
    }

    try {
      // Determine ride type based on user mode
      const rideType = mode === 'driver' ? 'offer' : 'request';
      
      // Convert to ISO string format
      const isoTime = selectedTime.toISOString();
      
      await axios.post(
        'https://www.findtexi.com/api/rides/',
        {
          ride_type: rideType,
          pickup_name: fromText,
          pickup_lat: currentLocation.latitude,
          pickup_lng: currentLocation.longitude,
          dropoff_name: destinationText,
          dropoff_lat: destinationCoords.latitude,
          dropoff_lng: destinationCoords.longitude,
          departure_time: isoTime,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Success', 'Ride created successfully!', [
        { text: 'OK', onPress: handleClose },
      ]);
    } catch (error) {
      console.error('Create Ride Error:', error);
      Alert.alert('Error', 'Failed to create ride');
    }
  };

  const handleClose = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#139beb" />
        </TouchableOpacity>
        <Text style={styles.title}>Book For Later</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text>From:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter pickup location"
            placeholderTextColor="gray"
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
                  <View style={styles.suggestionRow}>
                    <MaterialIcons
                      name="place"
                      size={20}
                      color="#5d5d5d"
                      style={styles.pinIcon}
                    />
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </View>
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
            placeholderTextColor="gray"
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
                  <View style={styles.suggestionRow}>
                    <MaterialIcons
                      name="place"
                      size={20}
                      color="#5d5d5d"
                      style={styles.pinIcon}
                    />
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text>Departure Time (YYYY-MM-DD HH:mm):</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Example: 2023-12-31 14:30"
            placeholderTextColor="gray"
            value={departureTime}
            onChangeText={setDepartureTime}
          />
        </View>

        <Text style={styles.modeText}>
          You're creating a ride as a {mode === 'driver' ? '🚗 Driver' : '👤 Passenger'}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleConfirmRide}>
          <Text style={styles.buttonText}>Confirm Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#139beb',
  },
  spacer: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginVertical: 10,
  },
  textInput: {
    height: 40,
    color: '#5d5d5d',
    fontSize: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  pinIcon: {
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#5d5d5d',
  },
  modeText: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5d5d5d',
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
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#ededed',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  closeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  hintText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
});

export default BookForLaterScreen;
