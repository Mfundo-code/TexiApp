// HomeScreen.js

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import HomeMap from "../../Components/HomeMap";
import WhereTo from "../../Components/WhereTo";
import BaseComponents from "../../Components";
import StatusComponent from "../../Components/StatusComponent";
import MoreComponent from "../../Components/MoreComponent"; // <-- adjust path as needed

const HomeScreen = ({ navigation }) => {
  const [isMoreDrawerVisible, setMoreDrawerVisible] = useState(false);
  const [bookLaterVisible, setBookLaterVisible] = useState(false);
  const [rideDetailsVisible, setRideDetailsVisible] = useState(false);

  const toggleDrawer = (drawerType) => {
    if (drawerType === "more") {
      setMoreDrawerVisible((prev) => !prev);
      // Reset other drawers
      setBookLaterVisible(false);
      setRideDetailsVisible(false);
    } else {
      setMoreDrawerVisible(false);
      setBookLaterVisible(drawerType === "bookLater");
      setRideDetailsVisible(drawerType === "rideDetails");
    }
  };

  return (
    <View style={styles.container}>
      <StatusComponent onMorePress={() => toggleDrawer("more")} />

      {/* MoreComponent with toggle visibility */}
      {isMoreDrawerVisible && (
        <MoreComponent
          visible={isMoreDrawerVisible}
          onClose={() => setMoreDrawerVisible(false)}
          onRidesListPress={() => navigation.navigate("RidesList")}
          onParcelListPress={() => navigation.navigate("ParcelList")}
        />
      )}

      <HomeMap navigation={navigation} showButtons={true} />

      <WhereTo onPress={() => navigation.navigate("RideDetailsScreen")} />

      <BaseComponents
        onCommunityHubPress={() => navigation.navigate("CommunityHub")}
        onBookForLaterPress={() => navigation.navigate("BookForLaterScreen")}
        onParcelsPress={() => navigation.navigate("Parcels")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

export default HomeScreen;
