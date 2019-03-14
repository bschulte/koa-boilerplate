import { gql } from "apollo-server-koa";

export const CREATE_USER = gql`
  mutation createUser($newUserData: UserInput!) {
    createUser(newUserData: $newUserData)
  }
`;

export const LOGIN = gql`
  mutation login($userData: UserInput!) {
    login(userData: $userData)
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation changePassword($email: String!, $newPass: String!) {
    changePassword(email: $email, newPass: $newPass)
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser($userId: Float!) {
    deleteUser(userId: $userId)
  }
`;
