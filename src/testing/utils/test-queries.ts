import { gql } from "apollo-server-koa";

export const GET_USER = gql`
  {
    user {
      id
      email
      createdAt
      updatedAt
      access {
        isAdmin
      }
      config {
        configValueOne
      }
    }
  }
`;

export const GET_USERS = gql`
  {
    users {
      id
      email
      createdAt
      updatedAt
      access {
        isAdmin
      }
      config {
        configValueOne
      }
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  {
    notifications {
      status
      uuid
      createdAt
      updatedAt
      content {
        title
        html
      }
    }
  }
`;

export const GET_NOTIFICATION = gql`
  query notification($uuid: String!) {
    notification(uuid: $uuid) {
      status
      uuid
      createdAt
      updatedAt
      content {
        title
        html
      }
    }
  }
`;
