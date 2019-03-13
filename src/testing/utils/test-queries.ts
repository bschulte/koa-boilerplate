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
