/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
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
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
          owner
          __typename
        }
        receiver {
          id
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        ride {
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
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesBySenderId = /* GraphQL */ `
  query MessagesBySenderId(
    $senderId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesBySenderId(
      senderId: $senderId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
          owner
          __typename
        }
        receiver {
          id
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        ride {
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
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesByReceiverId = /* GraphQL */ `
  query MessagesByReceiverId(
    $receiverId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByReceiverId(
      receiverId: $receiverId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
          owner
          __typename
        }
        receiver {
          id
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        ride {
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
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messagesByRideId = /* GraphQL */ `
  query MessagesByRideId(
    $rideId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByRideId(
      rideId: $rideId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
          owner
          __typename
        }
        receiver {
          id
          username
          email
          createdAt
          updatedAt
          owner
          __typename
        }
        ride {
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
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getRide = /* GraphQL */ `
  query GetRide($id: ID!) {
    getRide(id: $id) {
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
export const listRides = /* GraphQL */ `
  query ListRides(
    $filter: ModelRideFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRides(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const ridesByMoodAndCreatedAt = /* GraphQL */ `
  query RidesByMoodAndCreatedAt(
    $mood: RideMood!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelRideFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ridesByMoodAndCreatedAt(
      mood: $mood
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const ridesByUserId = /* GraphQL */ `
  query RidesByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelRideFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ridesByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
