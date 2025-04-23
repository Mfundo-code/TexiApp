import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
// Remove direct Auth import and use useAuthenticator hook for signOut.
import { useAuthenticator } from "@aws-amplify/ui-react-native";

const ProfileDrawer = ({ onClose }) => {
  const [showLoginSecurity, setShowLoginSecurity] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Get signOut function from the Authenticator context.
  const { signOut } = useAuthenticator();

  const fetchPaymentHistory = () => {
    const payments = [];
    setPaymentHistory(payments);
    setShowPaymentHistory(true);
  };

  const handleLogout = async () => {
    try {
      // Use the signOut function from the Authenticator provider.
      await signOut();
      Alert.alert("Logout", "You have been logged out successfully!");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert(
        "Logout Error",
        "There was an error logging out. Please try again."
      );
    }
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Redirect to change password screen.");
  };

  const handleDeleteAccount = () => {
    Alert.alert("Account Deleted", "Your account has been deleted.");
    setShowDeleteConfirmation(false);
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userContact}>+123 456 7890</Text>
      </View>

      <View style={styles.drawerItemsContainer}>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={fetchPaymentHistory}
        >
          <Text style={styles.drawerItemText}>Payment History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => setShowLoginSecurity(true)}
        >
          <Text style={styles.drawerItemText}>Login and Security</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => setShowDeleteConfirmation(true)}
        >
          <Text style={styles.drawerItemText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPaymentHistory} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Payment History</Text>
            {paymentHistory.length === 0 ? (
              <Text style={styles.modalText}>
                You've not made any payments yet.
              </Text>
            ) : (
              <ScrollView>
                {paymentHistory.map((payment) => (
                  <View key={payment.id} style={styles.paymentItem}>
                    <Text style={styles.paymentDate}>{payment.date}</Text>
                    <Text style={styles.paymentAmount}>{payment.amount}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPaymentHistory(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showLoginSecurity} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.modalOption}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChangePassword}>
              <Text style={styles.modalOption}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLoginSecurity(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteConfirmation} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account?
            </Text>
            <TouchableOpacity onPress={handleDeleteAccount}>
              <Text style={styles.modalOption}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDeleteConfirmation(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "88%",
    backgroundColor: "#ffffff",
    padding: 20,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeButton: {
    alignSelf: "flex-start",
    padding: 10,
    backgroundColor: "#139beb",
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  userInfoContainer: {
    marginTop: 20,
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  userContact: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  drawerItemsContainer: {
    marginTop: 10,
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  drawerItemText: {
    fontSize: 18,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  modalOption: {
    fontSize: 18,
    color: "#139beb",
    marginVertical: 10,
  },
  modalCloseButton: {
    backgroundColor: "#139beb",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  modalCloseButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  paymentDate: {
    fontSize: 16,
    color: "#333",
  },
  paymentAmount: {
    fontSize: 16,
    color: "#139beb",
  },
});

export default ProfileDrawer;