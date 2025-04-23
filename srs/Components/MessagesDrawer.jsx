import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API, Auth } from "aws-amplify";
import { createMessage, listMessages } from "../../graphql/mutations";

const MessagesDrawer = ({ onClose, recipientName, recipientId, rideId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollViewRef = useRef();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const messagesData = await API.graphql({
                    query: listMessages,
                    variables: { filter: { rideId: { eq: rideId } } }
                });
                setMessages(messagesData.data.listMessages.items);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        
        if (rideId) fetchMessages();
    }, [rideId]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;
        
        try {
            const user = await Auth.currentAuthenticatedUser();
            
            const messageData = {
                text: newMessage,
                senderId: user.attributes.sub,
                receiverId: recipientId,
                rideId: rideId
            };

            const result = await API.graphql({
                query: createMessage,
                variables: { input: messageData }
            });

            setMessages(prev => [...prev, result.data.createMessage]);
            setNewMessage("");
            
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
                    <Text style={styles.profileName}>{recipientName}</Text>
                </View>
                
                <View style={styles.rightSpacer} />
            </View>

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
                            message.senderId === recipientId ? styles.theirMessage : styles.myMessage
                        ]}
                    >
                        <Text style={message.senderId === recipientId ? styles.messageText : styles.myMessageText}>
                            {message.text}
                        </Text>
                        <Text style={styles.messageTime}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                ))}
            </ScrollView>

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
        width: 24, // Same as back button width for balance
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