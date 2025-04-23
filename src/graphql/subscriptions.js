/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onCreateMessage(filter: $filter, owner: $owner) {
      id
      text
      senderId
      receiverId
      rideId
      createdAt
      updatedAt
      sender {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      receiver {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      ride {
        id
        mood
        pickup {
          latitude
          longitude
          address
          __typename
        }
        dropoff {
          latitude
          longitude
          address
          __typename
        }
        userId
        user {
          id
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        username
        email
        createdAt
        updatedAt
        messages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onUpdateMessage(filter: $filter, owner: $owner) {
      id
      text
      senderId
      receiverId
      rideId
      createdAt
      updatedAt
      sender {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      receiver {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      ride {
        id
        mood
        pickup {
          latitude
          longitude
          address
          __typename
        }
        dropoff {
          latitude
          longitude
          address
          __typename
        }
        userId
        user {
          id
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        username
        email
        createdAt
        updatedAt
        messages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onDeleteMessage(filter: $filter, owner: $owner) {
      id
      text
      senderId
      receiverId
      rideId
      createdAt
      updatedAt
      sender {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      receiver {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      ride {
        id
        mood
        pickup {
          latitude
          longitude
          address
          __typename
        }
        dropoff {
          latitude
          longitude
          address
          __typename
        }
        userId
        user {
          id
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        username
        email
        createdAt
        updatedAt
        messages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onCreateUser(filter: $filter, owner: $owner) {
      id
      username
      email
      createdAt
      updatedAt
      rides {
        items {
          id
          mood
          userId
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      sentMessages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      receivedMessages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onUpdateUser(filter: $filter, owner: $owner) {
      id
      username
      email
      createdAt
      updatedAt
      rides {
        items {
          id
          mood
          userId
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      sentMessages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      receivedMessages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onDeleteUser(filter: $filter, owner: $owner) {
      id
      username
      email
      createdAt
      updatedAt
      rides {
        items {
          id
          mood
          userId
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      sentMessages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      receivedMessages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onCreateRide = /* GraphQL */ `
  subscription OnCreateRide(
    $filter: ModelSubscriptionRideFilterInput
    $owner: String
  ) {
    onCreateRide(filter: $filter, owner: $owner) {
      id
      mood
      pickup {
        latitude
        longitude
        address
        __typename
      }
      dropoff {
        latitude
        longitude
        address
        __typename
      }
      userId
      user {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      username
      email
      createdAt
      updatedAt
      messages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onUpdateRide = /* GraphQL */ `
  subscription OnUpdateRide(
    $filter: ModelSubscriptionRideFilterInput
    $owner: String
  ) {
    onUpdateRide(filter: $filter, owner: $owner) {
      id
      mood
      pickup {
        latitude
        longitude
        address
        __typename
      }
      dropoff {
        latitude
        longitude
        address
        __typename
      }
      userId
      user {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      username
      email
      createdAt
      updatedAt
      messages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
export const onDeleteRide = /* GraphQL */ `
  subscription OnDeleteRide(
    $filter: ModelSubscriptionRideFilterInput
    $owner: String
  ) {
    onDeleteRide(filter: $filter, owner: $owner) {
      id
      mood
      pickup {
        latitude
        longitude
        address
        __typename
      }
      dropoff {
        latitude
        longitude
        address
        __typename
      }
      userId
      user {
        id
        username
        email
        createdAt
        updatedAt
        rides {
          nextToken
          __typename
        }
        sentMessages {
          nextToken
          __typename
        }
        receivedMessages {
          nextToken
          __typename
        }
        owner
        __typename
      }
      username
      email
      createdAt
      updatedAt
      messages {
        items {
          id
          text
          senderId
          receiverId
          rideId
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      owner
      __typename
    }
  }
`;
