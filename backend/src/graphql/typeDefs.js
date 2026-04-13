const gql = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Employee {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    department: String
    position: String
    profilePictureUrl: String
    createdAt: String
    updatedAt: String
  }

  input EmployeeInput {
    firstName: String!
    lastName: String!
    email: String!
    department: String
    position: String
    profilePictureUrl: String
  }

  input EmployeeFilter {
    department: String
    position: String
  }

  type Query {
    me: User
    employees(filter: EmployeeFilter): [Employee!]!
    employee(id: ID!): Employee
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
