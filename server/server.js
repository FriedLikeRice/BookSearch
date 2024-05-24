const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schema');
const { authMiddleware } = require('./auth');
''
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Apply authentication middleware for REST endpoints
// app.use(authMiddleware);

// Set up Apollo Server with authentication context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    req = authMiddleware(req);
    return { user: req.user };
  },
});

server.applyMiddleware({ app });

// Optionally use existing routes for REST endpoints if needed
// app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`));
});
