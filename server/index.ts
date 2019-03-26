import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './typedefs'

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        sessions: () => [{ 'room': "gates G01" }]
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
