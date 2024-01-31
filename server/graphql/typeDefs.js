module.exports = `

scalar String

type Address {
  id: ID
  addressLine1: String
  city: String
  state: String
  zipPostalCode: String
}

enum UserType {
  ADMIN
  CLIENT
  CONSUMER
}

type User {
  id: ID
  firstName: String
  lastName: String
  emailAddress: String
  phoneNumber: String
  password: String
  isApproved: Boolean
  token: String
  tokenExpiration: String
  pinCode: String
  keyLocation: String
  address: Address
  userType: UserType
  lastLoginTime: String
}

type AuthTokens {
  refreshToken: String
}


input RegisterInput {
  firstName: String
  lastName: String
  emailAddress: String
  password: String
  confirmPassword: String
}

input LoginInput {
  emailAddress: String
  password: String
}

type Query {
  getUserById(id: ID!): User
  getUserByEmail(emailAddress: String): Boolean
  getUsers: [User]
}

type Mutation {
  login(loginInput: LoginInput): User
  register(registerInput: RegisterInput): User
  getRefreshToken(userType: String, firstName: String): AuthTokens
  logoutUser(id: ID!): User
}
`;
