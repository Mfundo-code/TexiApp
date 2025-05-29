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
  Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../../../App';
import MessagesDrawer from "../../Components/MessagesDrawer";

const CommunityHubScreen = ({ navigation }) => {
  const { authToken } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [isMessageDrawerVisible, setMessageDrawerVisible] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('http://192.168.0.137:8000/api/community/posts/', {
        headers: { Authorization: `Token ${authToken}` }
      });
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
        'http://192.168.0.137:8000/api/community/posts/',
        { content: newPost },
        { headers: { Authorization: `Token ${authToken}` } }
      );
      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const createComment = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      await axios.post(
        `http://192.168.0.137:8000/api/community/posts/${postId}/comments/`,
        { content },
        { headers: { Authorization: `Token ${authToken}` } }
      );
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = (user) => {
    if (user?.id) {
      setActiveRecipient(user);
      setMessageDrawerVisible(true);
    } else {
      console.error("Invalid user object - missing ID:", user);
      Alert.alert("Error", "Cannot message this user - missing user ID");
    }
  };

  const toggleComments = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, showComments: !post.showComments } : post
    ));
  };

  const renderItem = ({ item }) => {
    const userId = item.user?.id || item.user_id || item.id;

    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <MaterialCommunityIcons name="account-circle" size={40} color="#139beb" />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.postTime}>
              {new Date(item.created_at).toLocaleDateString()} at{' '}
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => toggleComments(item.id)}
          >
            <MaterialIcons name="comment" size={20} color="#666" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCall(item.phone)}
          >
            <MaterialIcons name="call" size={20} color="#666" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          {userId ? (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleMessage({
                id: userId,
                username: item.username,
                phone: item.phone
              })}
            >
              <MaterialIcons name="message" size={20} color="#666" />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {item.comments && item.comments.length > 0 && (
          <View style={styles.commentsContainer}>
            {item.comments.map(comment => (
              <View key={comment.id} style={styles.comment}>
                <Text style={styles.commentUser}>{comment.username}:</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            ))}
          </View>
        )}

        {item.showComments && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentInputs[item.id] || ''}
              onChangeText={text => setCommentInputs(prev => ({ ...prev, [item.id]: text }))}
              onSubmitEditing={() => createComment(item.id)}
            />
            <TouchableOpacity 
              style={styles.commentButton}
              onPress={() => createComment(item.id)}
            >
              <MaterialIcons name="send" size={24} color="#139beb" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#139beb" />
        </TouchableOpacity>
        <Text style={styles.title}>Community Hub</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.createPostContainer}>
        <TextInput
          style={styles.postInput}
          placeholder="What's on your mind?"
          multiline
          value={newPost}
          onChangeText={setNewPost}
        />
        <TouchableOpacity style={styles.postButton} onPress={createPost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {isMessageDrawerVisible && activeRecipient?.id && (
        <MessagesDrawer
          onClose={() => setMessageDrawerVisible(false)}
          recipient={activeRecipient}
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
  },
  postButton: {
    backgroundColor: '#139beb',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    marginBottom: 15,
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
  userInfo: {
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
  },
  commentsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  commentText: {
    flex: 1,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    padding: 10,
    paddingLeft: 15,
  },
  commentButton: {
    marginLeft: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CommunityHubScreen;
