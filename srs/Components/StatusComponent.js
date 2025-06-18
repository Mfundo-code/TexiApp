import React, { useState, useEffect, useContext } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../../App';
import { API_URL } from '../config'; // ← import API_URL

const StatusComponent = ({ 
  onMorePress = () => {},
  isPressable = true  // New prop to conditionally render the dots button
}) => {
  const { authToken, username } = useContext(AuthContext);
  const [activeRideCount, setActiveRideCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const displayName = username ? username.slice(0, 6) : '';

  // Fetch active rides from backend
  useEffect(() => {
    const fetchActiveRides = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/rides/history/`,      // ← use API_URL
          {
            headers: { Authorization: `Token ${authToken}` }
          }
        );
        
        // Count active rides
        const activeRides = response.data.filter(
          ride => ride.is_active && !ride.matched_ride
        );
        setActiveRideCount(activeRides.length);
      } catch (err) {
        setError('Failed to load ride data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchActiveRides();
    }
  }, [authToken]);

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.profileBlock}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={35} 
              color="#139beb" 
            />
            <Text style={styles.name}>{displayName}</Text>
          </View>

          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#139beb" />
          </View>

          {isPressable && (
            <TouchableOpacity onPress={onMorePress} style={styles.dotsButton}>
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color="#139beb"
              />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <View style={styles.profileBlock}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={35} 
              color="#139beb" 
            />
            <Text style={styles.name}>{displayName}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.errorText}>Error loading</Text>
          </View>

          {isPressable && (
            <TouchableOpacity onPress={onMorePress} style={styles.dotsButton}>
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color="#139beb"
              />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Render normal state
  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* Profile */}
        <View style={styles.profileBlock}>
          <MaterialCommunityIcons 
            name="account-circle" 
            size={35} 
            color="#139beb" 
          />
          <Text style={styles.name}>{displayName}</Text>
        </View>

        {/* Active rides status */}
        <View style={styles.statusContainer}>
          {activeRideCount === 0 ? (
            <Text style={styles.text}>You have no active rides</Text>
          ) : (
            <Text style={styles.text}>
              You have {activeRideCount} active {activeRideCount === 1 ? 'ride' : 'rides'}
            </Text>
          )}
        </View>

        {/* Conditionally render 3-dot button */}
        {isPressable && (
          <TouchableOpacity onPress={onMorePress} style={styles.dotsButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="#139beb"
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#d1e8ff',
    backgroundColor: '#f2f9ff',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  profileBlock: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 20,
  },
  name: {
    marginTop: 2,
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#139beb',
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#139beb',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(19,155,235,0.3)',
    paddingBottom: 1,
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,107,107,0.3)',
    paddingBottom: 1,
  },
  dotsButton: {
    padding: 8.6,
  },
});

export default StatusComponent;
