import React, { useState, useEffect, useContext, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from "../../App";

const MessagesDrawer = ({ onClose, recipient }) => {
    const { authToken } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const scrollViewRef = useRef();

    const loadMessages = async () => {
        try {
            const { data } = await axios.get(
                `http://192.168.0.137:8000/api/messages/${recipient.id}/`,
                { headers: { Authorization: `Token ${authToken}` } }
            );
            setMessages(data);
        } catch (error) {
            console.error("Error loading messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;

        try {
            await axios.post(
                `http://192.168.0.137:8000/api/messages/${recipient.id}/`,
                { content: newMessage },
                { headers: { Authorization: `Token ${authToken}` } }
            );
            setNewMessage("");
            loadMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <SafeAreaView style={styles.drawerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#139beb" />
                </TouchableOpacity>
                
                <View style={styles.profileContainer}>
                    <MaterialCommunityIcons name="account-circle" size={32} color="#139beb" />
                    <Text style={styles.profileName}>{recipient.username}</Text>
                </View>
                
                <View style={styles.rightSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <ScrollView
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.map((message) => (
                        <View 
                            key={message.id} 
                            style={[
                                styles.messageBubble,
                                message.is_me ? styles.myMessage : styles.theirMessage
                            ]}
                        >
                            <Text style={message.is_me ? styles.myMessageText : styles.messageText}>
                                {message.content}
                            </Text>
                            <Text style={styles.messageTime}>
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            )}

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.messageInput}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    onSubmitEditing={handleSendMessage}
                />
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                    <Ionicons name="send" size={24} color="#139beb" />
                </TouchableOpacity>
            </KeyboardAvoidingView>
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
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#139beb',
        marginLeft: 10,
    },
    rightSpacer: {
        width: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    messagesContent: {
        paddingVertical: 15,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 15,
        marginBottom: 10,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#139beb',
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    myMessageText: {
        fontSize: 16,
        color: '#fff',
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        marginTop: 5,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
    },
    sendButton: {
        padding: 5,
    },
});

export default MessagesDrawer;