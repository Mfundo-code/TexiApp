import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import { listRides } from '../graphql/queries';

const RideMatching = ({ route, navigation }) => {
    const { mood, pickup, dropoff } = route.params;
    const [bestMatch, setBestMatch] = useState(null);

    const targetMood = mood === 'DRIVER' ? 'PASSENGER' : 'DRIVER';

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        // Same distance calculation as before
    };

    useEffect(() => {
        const fetchAndMatchRides = async () => {
            try {
                const rideData = await API.graphql({
                    query: listRides,
                    variables: { filter: { mood: { eq: targetMood } } }
                });

                const availableRides = rideData.data.listRides.items;
                let matchedRide = null;

                // Same matching logic as before

                if (matchedRide) {
                    setBestMatch(matchedRide);
                    navigation.navigate('RideConfirmation', {
                        matchedRideId: matchedRide.id,
                        recipientId: matchedRide.userId,
                        recipientName: matchedRide.username,
                        rideMatchingPickup: pickup,
                        searchPickup: dropoff,
                        mood,
                    });
                }
            } catch (error) {
                console.error("Error fetching and matching rides:", error);
            }
        };

        fetchAndMatchRides();
    }, [targetMood, navigation, pickup, dropoff]);

    return null;
};

export default RideMatching;