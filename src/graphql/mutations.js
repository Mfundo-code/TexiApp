/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
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
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
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
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createRide = /* GraphQL */ `
  mutation CreateRide(
    $input: CreateRideInput!
    $condition: ModelRideConditionInput
  ) {
    createRide(input: $input, condition: $condition) {
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
export const updateRide = /* GraphQL */ `
  mutation UpdateRide(
    $input: UpdateRideInput!
    $condition: ModelRideConditionInput
  ) {
    updateRide(input: $input, condition: $condition) {
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
export const deleteRide = /* GraphQL */ `
  mutation DeleteRide(
    $input: DeleteRideInput!
    $condition: ModelRideConditionInput
  ) {
    deleteRide(input: $input, condition: $condition) {
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
