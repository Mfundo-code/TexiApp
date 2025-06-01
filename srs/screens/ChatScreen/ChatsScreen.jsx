// ChatsScreen.js

import React, { useState, useEffect, useContext } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Linking
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../../../App';

const ChatsScreen = ({ navigation }) => {
    const { authToken } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchChats = async () => {
        try {
            const { data } = await axios.get('http://192.168.0.137:8000/api/chats/', {
                headers: { Authorization: `Token ${authToken}` }
            });
            setChats(data);
        } catch (error) {
            console.error("Error loading chats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleChatSelect = (chat) => {
        navigation.navigate('MessageScreen', {
            recipient: {
                id: chat.id,
                username: chat.other_user.username,
                phone: chat.other_user.phone
            }
        });
    };

    const handleCall = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    // Add badge to chat items
    const renderChatItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.chatItem}
            onPress={() => handleChatSelect(item)}
        >
            <View style={styles.avatarContainer}>
                <MaterialCommunityIcons 
                    name="account-circle" 
                    size={60} 
                    color="#139beb" 
                />
                {/* Badge for unread messages */}
                {item.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread_count}</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.chatContent}>
                <Text style={item.unread_count > 0 ? styles.usernameUnread : styles.username}>
                    {item.other_user.username}
                </Text>
                <Text style={styles.messagePreview} numberOfLines={1}>
                    {item.latest_message.content}
                </Text>
            </View>
            
            <View style={styles.rightContainer}>
                <Text style={styles.time}>
                    {new Date(item.latest_message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
                <TouchableOpacity 
                    style={styles.callButton}
                    onPress={() => handleCall(item.other_user.phone)}
                >
                    <Ionicons name="call" size={24} color="#139beb" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
                name="message-text-outline" 
                size={80} 
                color="#e0e0e0" 
            />
            <Text style={styles.emptyTitle}>No messages yet</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.screenContainer}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#139beb" />
                </TouchableOpacity>
                <Text style={styles.title}>Chats</Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : (
                <FlatList
                    data={chats}
                    renderItem={renderChatItem}
                    keyExtractor={item => `chat-${item.id}`}
                    contentContainerStyle={chats.length === 0 ? styles.emptyList : styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#139beb',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 34,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatarContainer: {
        marginRight: 15,
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    messagePreview: {
        fontSize: 14,
        color: '#666',
    },
    rightContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    time: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
    },
    callButton: {
        padding: 8,
        backgroundColor: '#e8f5fe',
        borderRadius: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyList: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666',
        marginVertical: 15,
        textAlign: 'center',
    },
    // New styles for unread badge and bold username
    unreadBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    usernameUnread: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
});

export default ChatsScreen;
