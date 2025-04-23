import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { API, Auth } from "aws-amplify";
import {
  createPost,
  createComment,
} from "../graphql/mutations";
import {
  listPosts,
  listComments,
} from "../graphql/queries";

const CommunityHubDrawer = ({ onClose }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postData = await API.graphql({
        query: listPosts,
        variables: { limit: 50 },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });

      const sortedPosts = postData.data.listPosts.items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts");
    }
  };

  const fetchComments = async (postId) => {
    try {
      const commentData = await API.graphql({
        query: listComments,
        variables: {
          filter: { postId: { eq: postId } },
        },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });

      return commentData.data.listComments.items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const user = await Auth.currentAuthenticatedUser();
      const newPost = {
        content: newPostContent,
        userId: user.attributes.sub,
      };

      await API.graphql({
        query: createPost,
        variables: { input: newPost },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });

      setNewPostContent("");
      await fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post");
    }
  };

  const handleAddComment = async (postId, content) => {
    if (!content.trim()) return;

    try {
      const user = await Auth.currentAuthenticatedUser();
      const newComment = {
        content,
        postId,
        userId: user.attributes.sub,
      };

      await API.graphql({
        query: createComment,
        variables: { input: newComment },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });

      const updatedPosts = await Promise.all(
        posts.map(async (post) => {
          if (post.id === postId) {
            const comments = await fetchComments(postId);
            return { ...post, comments };
          }
          return post;
        })
      );

      setPosts(updatedPosts);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const toggleComments = async (postId) => {
    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        if (post.id === postId) {
          const comments = post.comments
            ? []
            : await fetchComments(postId);
          return {
            ...post,
            comments,
            showComments: !post.showComments,
          };
        }
        return post;
      })
    );

    setPosts(updatedPosts);
  };

  return (
    <View style={styles.drawerContainer}>
      <Text style={styles.header}>Community Hub</Text>

      {/* New Post Creation */}
      <View style={styles.newPostContainer}>
        <TextInput
          style={styles.newPostInput}
          placeholder="What's on your mind?"
          value={newPostContent}
          onChangeText={setNewPostContent}
          multiline
        />
        <TouchableOpacity
          style={styles.postButton}
          onPress={handleCreatePost}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <Text style={styles.postUser}>
              {item.user?.username || "Community Member"}
            </Text>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postTime}>
              {new Date(item.createdAt).toLocaleDateString()} at{" "}
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>

            {/* Comments Section */}
            <TouchableOpacity
              style={styles.commentToggle}
              onPress={() => toggleComments(item.id)}
            >
              <Text style={styles.commentToggleText}>
                {item.showComments ? "Hide Comments" : "View Comments"}
              </Text>
            </TouchableOpacity>

            {item.showComments && (
              <>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  value={commentInputs[item.id] || ""}
                  onChangeText={(text) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [item.id]: text,
                    }))
                  }
                  onSubmitEditing={(e) =>
                    handleAddComment(item.id, e.nativeEvent.text)
                  }
                />

                {item.comments?.map((comment) => (
                  <View
                    key={comment.id}
                    style={styles.commentContainer}
                  >
                    <Text style={styles.commentUser}>
                      {comment.user?.username || "Member"}:
                    </Text>
                    <Text style={styles.commentText}>
                      {comment.content}
                    </Text>
                    <Text style={styles.commentTime}>
                      {new Date(comment.createdAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        onPress={onClose}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: "88%",
    backgroundColor: "#f0f2f5",
    padding: 15,
    zIndex: 1000,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 15,
    color: "#007AFF",
  },
  newPostContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
  },
  newPostInput: {
    minHeight: 80,
    fontSize: 16,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  postContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postUser: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  postContent: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
  },
  postTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  commentToggle: {
    marginBottom: 10,
  },
  commentToggleText: {
    color: "#4267B2",
    fontWeight: "500",
  },
  commentInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccd0d5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: "#f5f6f7",
    marginBottom: 10,
  },
  commentContainer: {
    marginLeft: 10,
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#ccd0d5",
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 5,
  },
  commentTime: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});

export default CommunityHubDrawer;
