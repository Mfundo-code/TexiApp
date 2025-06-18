import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../App';
import axios from 'axios';
import { API_URL } from "../../config";

const RidesListScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRides, setExpandedRides] = useState({});
  const { authToken } = useContext(AuthContext);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/rides/history/`,          // ← use API_URL here
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );
        setRides(response.data);
      } catch (err) {
        setError('Failed to load rides data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [authToken]);

  const toggleExpand = (rideId) => {
    setExpandedRides((prev) => ({
      ...prev,
      [rideId]: !prev[rideId],
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#139beb" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (rides.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <MaterialCommunityIcons name="car-off" size={60} color="#cccccc" />
        <Text style={styles.emptyText}>No rides yet</Text>
        <Text style={styles.emptySubText}>
          Your ride history will appear here
        </Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRideItem = ({ item }) => {
    const isExpanded = !!expandedRides[item.id];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={styles.rideCard}>
          <View style={styles.rideHeader}>
            <MaterialCommunityIcons
              name={item.ride_type === 'parcel' ? 'package-variant' : 'car'}
              size={24}
              color="#139beb"
            />
            <Text style={styles.rideDate}>
              {formatDate(item.departure_time)}
            </Text>
            <Text
              style={[
                styles.rideStatus,
                item.is_active
                  ? styles.active
                  : item.matched_ride
                  ? styles.completed
                  : styles.cancelled,
              ]}
            >
              {item.is_active ? 'Active' : 'Closed'}
            </Text>
          </View>

          <View style={styles.rideDetailRow}>
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={16}
              color="#666"
            />
            <Text style={styles.rideTime}>{formatTime(item.departure_time)}</Text>
          </View>

          {isExpanded && (
            <>
              <View style={styles.rideDetailRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color="#666"
                />
                <Text style={styles.locationText}>
                  {item.pickup_name}
                </Text>
              </View>

              <View style={styles.rideDetailRow}>
                <MaterialCommunityIcons
                  name="flag-checkered"
                  size={16}
                  color="#666"
                />
                <Text style={styles.locationText}>
                  {item.dropoff_name}
                </Text>
              </View>

              <View style={styles.rideFooter}>
                <Text style={styles.rideType}>
                  {item.ride_type_display}
                </Text>
                {item.matched_ride && (
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() =>
                      navigation.navigate('RideDetails', { rideId: item.id })
                    }
                  >
                    <Text style={styles.detailsButtonText}>Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#139beb"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>

      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#139beb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#139beb',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#777',
  },
  emptySubText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#139beb',
  },
  listContent: {
    padding: 16,
  },
  rideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideDate: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  rideStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  active: {
    backgroundColor: '#e6f7ff',
    color: '#139beb',
  },
  completed: {
    backgroundColor: '#e8f5e9',
    color: '#4caf50',
  },
  cancelled: {
    backgroundColor: '#ffebee',
    color: '#f44336',
  },
  rideDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  rideTime: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  rideFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  detailsButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#e6f7ff',
    borderRadius: 15,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#139beb',
  },
});

export default RidesListScreen;
