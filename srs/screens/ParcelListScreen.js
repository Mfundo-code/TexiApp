import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../App';
import axios from 'axios';

const ParcelListScreen = ({ navigation }) => {
  const { authToken } = useContext(AuthContext);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]); // Track which parcels are expanded

  // Generate unique parcel code
  const generateParcelCode = (id, timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const idPart = id.toString().padStart(4, '0');
    return `PCK-${day}${month}${year}-${idPart}`;
  };

  // Fetch parcel data from backend
  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await axios.get(
          'https://www.findtexi.com/api/rides/history/',
          {
            headers: {
              Authorization: `Token ${authToken}`
            }
          }
        );

        // Filter and map parcel data
        const parcelData = response.data
          .filter(
            ride =>
              ride.ride_type === 'parcel' ||
              (ride.ride_type === 'offer' &&
                ride.matched_ride?.ride_type === 'parcel')
          )
          .map(ride => {
            const isSentParcel = ride.ride_type === 'parcel';
            const parcelCode = generateParcelCode(ride.id, ride.created_at);

            // Keep a single icon ("package-variant") for all statuses, regardless of open/closed
            const iconName = 'package-variant';
            // Color logic remains the same
            const color = ride.is_active
              ? ride.matched_ride
                ? '#ff9800' // In Transit
                : '#2196f3' // Pending
              : ride.matched_ride
              ? '#4caf50' // Delivered
              : '#f44336'; // Closed

            return {
              id: ride.id,
              parcelCode,
              pickup: ride.pickup_name,
              dropoff: isSentParcel
                ? ride.dropoff_name
                : ride.matched_ride?.dropoff_name || 'Unknown',
              created_at: ride.created_at,
              departure_time: ride.departure_time,
              status: ride.is_active
                ? ride.matched_ride
                  ? 'In Transit'
                  : 'Pending'
                : ride.matched_ride
                ? 'Delivered'
                : 'Closed',
              icon: iconName,
              color
            };
          });

        setParcels(parcelData);
      } catch (err) {
        setError('Failed to load parcel data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, [authToken]);

  // Format date for display
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = dateString => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Toggle expanded/collapsed state for a given parcel ID
  const toggleExpand = id => {
    setExpandedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Render parcel item
  const renderParcelItem = ({ item }) => {
    const isExpanded = expandedIds.includes(item.id);

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.parcelCard}>
          {/* HEADER: icon, code/date, and on the right side: status above time */}
          <View style={styles.parcelHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color + '22' }
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={item.color}
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.parcelCode}>{item.parcelCode}</Text>
              <Text style={styles.parcelDate}>{formatDate(item.created_at)}</Text>
            </View>

            {/* STATUS above TIME, stacked vertically */}
            <View style={styles.statusTimeContainer}>
              <Text style={[styles.parcelStatus, { color: item.color }]}>
                {item.status}
              </Text>
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons
                  name="clock-time-four-outline"
                  size={14}
                  color="#666"
                />
                <Text style={styles.timeText}>
                  {formatTime(item.departure_time)}
                </Text>
              </View>
            </View>
          </View>

          {/* If expanded, show pickup & dropoff */}
          {isExpanded && (
            <>
              <View style={styles.divider} />

              <View style={styles.parcelDetail}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color="#666"
                />
                <Text style={styles.detailValue} numberOfLines={1}>
                  {item.pickup}
                </Text>
              </View>

              <View style={styles.parcelDetail}>
                <MaterialCommunityIcons
                  name="flag-checkered"
                  size={16}
                  color="#666"
                />
                <Text style={styles.detailValue} numberOfLines={1}>
                  {item.dropoff}
                </Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#139beb" />
        <Text style={styles.loadingText}>Loading your parcels...</Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={50}
          color="#ff6b6b"
        />
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

  // Render empty state
  if (parcels.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={60}
          color="#cccccc"
        />
        <Text style={styles.emptyText}>No parcels yet</Text>
        <Text style={styles.emptySubText}>
          Your parcel history will appear here
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#139beb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Parcels</Text>
      </View>

      <FlatList
        data={parcels}
        renderItem={renderParcelItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#139beb'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff'
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#139beb',
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff'
  },
  emptyText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#777'
  },
  emptySubText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white'
  },
  backButton: {
    marginRight: 16
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#139beb'
  },
  listContent: {
    padding: 16
  },
  parcelCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  parcelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  infoContainer: {
    flex: 1
  },
  parcelCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  parcelDate: {
    fontSize: 12,
    color: '#777'
  },
  statusTimeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginLeft: 12
  },
  parcelStatus: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  timeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#444'
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12
  },
  parcelDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  detailValue: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
    flex: 1
  }
});

export default ParcelListScreen;