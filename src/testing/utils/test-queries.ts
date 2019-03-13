import { gql } from "apollo-server-koa";

export const GET_USER = gql`
  {
    user {
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
