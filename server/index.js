require('dotenv').config();
// const connectDB = require('./config/db');
const typeDefs = require('./graphql/typeDefs.js');
const resolvers = require('./graphql/resolvers');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { applyMiddleware } = require('graphql-middleware');
const { shield, rule, allow } = require('graphql-shield');
const jwt = require('jsonwebtoken');
const colors = require('colors');
const path = require('path');
const express = require('express');
const http = require('http');
const { InMemoryLRUCache } = require('@apollo/utils.keyvaluecache');
const cors = require('cors');
const { json } = require('body-parser');
const {
  ApolloServer
} = require('@apollo/server');
const { expressMiddleware, } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');

const app = express();
app.use(express.json());
app.use(cors());

// connectDB();

const httpServer = http.createServer(app);

// const isAdmin = rule()(async (_, __, ctx) => {
//   if (!ctx.auth) throw new ApolloError('not_authorized', 'NOT AUTHORIZED');
//   else return ctx.auth.user_type === 'ADMIN';
// });

const schema = makeExecutableSchema({ typeDefs, resolvers });

const createContext = ({ req, res }) => {
  const { headers } = req;
  let auth = null;

  const token = headers?.authorization?.split(' ')[1];

  if (token) {
    const user = jwt.verify(token, 'secret_password');
    if (user) auth = user;
  } else auth = null;

  return { auth };
};

const permissions = shield(
  {
    Query: {

    },
    Mutation: {

    },
  },
  {
    debug: true,
  }
);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

const schemaWithPermissions = applyMiddleware(schema, permissions);

const server = new ApolloServer({
  schema: schemaWithPermissions,
  context: createContext,
  introspection: process.env.NODE_ENV !== 'production',
  cache: new InMemoryLRUCache(),
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],

});

const corsOptions = {
  origin: ['http://localhost:4242'],
};

const startServer = async () => {
  await server.start();
  app.use(
    '/graphql',
    cors(corsOptions),
    json(),
    expressMiddleware(server, {
      context: createContext,
    }),
  );

  const port = process.env.PORT || 5000;
  app.listen(port, () =>
    console.log(`🚀 Gateway API running at port: ${port}`.yellow)
  );
};

startServer();