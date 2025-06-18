import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../../../App';
import { API_URL } from '../../src/config'; // ← import API_URL

const CommunityHubScreen = ({ navigation }) => {
  const { authToken } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/community/posts/`,    // ← use API_URL
        { headers: { Authorization: `Token ${authToken}` } }
      );
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async () => {
    if (!newPost.trim()) return;

    try {
      await axios.post(
        `${API_URL}/community/posts/`,    // ← use API_URL
        { content: newPost },
        { headers: { Authorization: `Token ${authToken}` } }
      );
      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleCall = (phone) => {
    phone 
      ? Linking.openURL(`tel:${phone}`)
      : Alert.alert("No phone number available");
  };

  const handleMessage = (user) => {
    navigation.navigate('MessageScreen', { 
      recipient: {
        id: user.id,
        username: user.username,
        phone: user.phone,
      }
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const renderPostItem = ({ item }) => {
    const userId = item.user?.id || item.user_id || item.id;

    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <MaterialCommunityIcons
            name="account-circle"
            size={40}
            color="#139beb"
          />
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.postTime}>
              {formatDateTime(item.created_at)}
            </Text>
          </View>
        </View>

        <View style={styles.postContentContainer}>
          <Text style={styles.postContent}>{item.content}</Text>
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCall(item.phone)}
          >
            <MaterialIcons name="call" size={20} color="#666" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          {userId && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMessage({
                id: userId,
                username: item.username,
                phone: item.phone,
              })}
            >
              <MaterialIcons name="message" size={20} color="#666" />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#139beb" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Community Hub</Text>
        
        <TouchableOpacity onPress={() => setShowCreatePost(prev => !prev)}>
          <MaterialIcons name={showCreatePost ? "close" : "add"} size={28} color="#139beb" />
        </TouchableOpacity>
      </View>

      {/* Create Post Section */}
      {showCreatePost && (
        <View style={styles.createPostContainer}>
          <TextInput
            style={styles.postInput}
            placeholder="Share your ride with the community..."
            placeholderTextColor="#888"
            multiline
            value={newPost}
            onChangeText={setNewPost}
          />
          <TouchableOpacity 
            style={styles.postButton} 
            onPress={createPost}
            disabled={!newPost.trim()}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Posts List */}
      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#139beb',
  },
  createPostContainer: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postInput: {
    minHeight: 80,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 10,
  },
  postButton: {
    backgroundColor: '#139beb',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  postContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    color: '#666',
    fontSize: 12,
  },
  postContentContainer: {
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginTop: 30,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
});

export default CommunityHubScreen;
