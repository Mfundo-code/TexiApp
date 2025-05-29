import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import HomeMap from "../../Components/HomeMap";
import WhereTo from "../../Components/WhereTo";
import ProfileDrawer from "../../Components/ProfileDrawer";
import BaseComponents from "../../Components";
import BookForLater from "../../Components/BookForLater";
import RideDetails from "../../Components/RideDetails";

const HomeScreen = ({ navigation }) => {
  const [isProfileDrawerVisible, setProfileDrawerVisible] = useState(false);
  const [isBookLaterVisible, setBookLaterVisible] = useState(false);
  const [isRideDetailsVisible, setRideDetailsVisible] = useState(false);

  const toggleDrawer = (drawerType) => {
    setProfileDrawerVisible(drawerType === 'profile');
    setBookLaterVisible(drawerType === 'bookLater');
    setRideDetailsVisible(drawerType === 'rideDetails');
  };

  return (
    <View style={styles.container}>
      <HomeMap 
        navigation={navigation} 
        showButtons={true} 
      />
      <WhereTo onPress={() => toggleDrawer('rideDetails')} />
      
      <BaseComponents
        onProfilePress={() => toggleDrawer('profile')}
        onCommunityHubPress={() => navigation.navigate('CommunityHub')}
        onBookForLaterPress={() => toggleDrawer('bookLater')}
        onParcelsPress={() => navigation.navigate('Parcels')}
      />

      {isRideDetailsVisible && <RideDetails onClose={() => toggleDrawer(null)} />}  
      {isProfileDrawerVisible && <ProfileDrawer onClose={() => toggleDrawer(null)} />}
      {isBookLaterVisible && <BookForLater onClose={() => toggleDrawer(null)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default HomeScreen;