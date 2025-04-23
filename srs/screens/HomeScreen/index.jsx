import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import HomeMap from "../../Components/HomeMap";
import WhereTo from "../../Components/WhereTo";
import ProfileDrawer from "../../Components/ProfileDrawer";
import CommunityHubDrawer from "../../Components/CommunityHubDrawer";
import BookForLater from "../../Components/BookForLater";
import BaseComponents from "../../Components";
import RideDetails from "../../Components/RideDetails";

const HomeScreen = () => {
  const [isProfileDrawerVisible, setProfileDrawerVisible] = useState(false);
  const [isCommunityHubDrawerVisible, setCommunityHubDrawerVisible] = useState(false);
  const [isBookLaterVisible, setBookLaterVisible] = useState(false);
  const [isRideDetailsVisible, setRideDetailsVisible] = useState(false);

  const toggleDrawer = (drawerType) => {
    setProfileDrawerVisible(drawerType === 'profile');
    setCommunityHubDrawerVisible(drawerType === 'community');
    setBookLaterVisible(drawerType === 'bookLater');
    setRideDetailsVisible(drawerType === 'rideDetails');
  };

  return (
    <View style={styles.container}>
      <HomeMap/>
      <WhereTo onPress={() => toggleDrawer('rideDetails')} />
      <BaseComponents
        onProfilePress={() => toggleDrawer('profile')}
        onCommunityHubPress={() => toggleDrawer('community')}
        onBookForLaterPress={() => toggleDrawer('bookLater')}
      />

      {isRideDetailsVisible && <RideDetails onClose={() => toggleDrawer(null)} />}  
      {isProfileDrawerVisible && <ProfileDrawer onClose={() => toggleDrawer(null)} />}
      {isCommunityHubDrawerVisible && <CommunityHubDrawer onClose={() => toggleDrawer(null)} />}
      {isBookLaterVisible && <BookForLater onClose={() => toggleDrawer(null)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
});

export default HomeScreen;
