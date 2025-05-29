import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const ParcelsScreen = ({}) => {
  const navigation = useNavigation();
  const [fromText, setFromText] = useState('');
  const [destinationText, setDestinationText] = useState('');
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

  const handleSendParcel = () => {
    if (!currentLocation || !destinationCoords) {
      Alert.alert('Error', 'Please select valid locations');
      return;
    }

    navigation.navigate('SearchResults', {
      pickup: {
        description: fromText,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      },
      dropoff: {
        description: destinationText,
        latitude: destinationCoords.latitude,
        longitude: destinationCoords.longitude
      },
      rideType: 'parcel'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send a Parcel</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pickup Location</Text>
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
        <Text style={styles.label}>Destination</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleSendParcel}>
        <Text style={styles.buttonText}>Find Driver</Text>
      </TouchableOpacity>
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
    height: '100%',
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
    textAlign: 'center'
  },
  inputContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
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


});

export default ParcelsScreen;