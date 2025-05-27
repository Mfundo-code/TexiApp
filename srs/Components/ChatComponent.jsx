import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * A simple chat component displaying a placeholder message.
 * Styles are adapted from MessagesDrawer.js for consistency.
 */
const ChatComponent = ({ onClose }) => {
  return (
    <SafeAreaView style={styles.drawerContainer}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#139beb" />
        </TouchableOpacity>
        <Text style={styles.profileName}>Chat</Text>
        <View style={styles.rightSpacer} />
      </View>

      {/* Main chat placeholder */}
      <View style={styles.chatContainer}>
        <Text style={styles.chatText}>hey im chats</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    zIndex: 1000,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#139beb',
    textAlign: 'center',
  },
  rightSpacer: {
    width: 24,
  },
  chatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatText: {
    fontSize: 20,
    color: '#333',
  },
});

export default ChatComponent;
