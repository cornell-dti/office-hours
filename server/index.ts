import * as express from 'express';
import * as bodyparser from 'body-parser';
import * as sqlite from 'sqlite';
import * as fs from 'fs';
import * as path from 'path';
import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  execute,
  subscribe,
} from 'graphql';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

const joinMonster = require('join-monster').default;
const joinMonsterAdapt = require('join-monster-graphql-tools-adapter');
import { PubSub, withFilter } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';

const GRAPHQL_PORT = 3001;
const GRAPHQL_PATH = '/graphql';
const SUBSCRIPTIONS_PATH = '/subscriptions';

const app = express();
const typeDefs = [fs.readFileSync(path.join(__dirname, 'schema.gql'), 'utf8')];
const pubsub = new PubSub();
let db: sqlite.Database;

const resolvers = {
  Query: {
    // call joinMonster in the "user" resolver, and all child fields that are tagged with "sqlTable" are handled!
    viewer(parent, args, ctx, resolveInfo) {
      return joinMonster(
        resolveInfo,
        ctx,
        sql => {
          return db.all(sql);
        },
        { dialect: 'sqlite3' }
      );
    },
    user(parent, args, ctx, resolveInfo) {
      return joinMonster(
        resolveInfo,
        ctx,
        sql => {
          return db.all(sql);
        },
        { dialect: 'sqlite3' }
      );
    },
  },
  Mutation: {
    async changeName(_, { id, newName }) {
      db.run(`UPDATE User SET name='${newName}' WHERE id=${id}`);
      pubsub.publish('nameChanged', {
        nameChanged: await db.all('select * from User'),
      });

      return { id: id, name: newName };
    },
  },
  Subscription: {
    nameChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('nameChanged'),
        (payload, variables) => {
          console.log(payload, variables);
          return true;
        }
      ),
    },
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
joinMonsterAdapt(schema, {
  Query: {
    fields: {
      user: {
        where: (table, args) => `${table}.id = ${args.id}`,
      },
    },
  },
  User: {
    sqlTable: 'User',
    uniqueKey: 'id',
    fields: {
      name: { sqlColumn: 'name' },
      posts: {
        sqlJoin: (userTable, postTable) => `${userTable}.id = ${postTable}.userid`,
      },
    },
  },
  Post: {
    sqlTable: 'Posts',
    uniqueKey: 'id',
    fields: {
      text: { sqlColumn: 'text' },
      author: {
        sqlJoin: (postTable, userTable) => `${postTable}.userid = ${userTable}.id`,
      },
    },
  },
});

async function initialize() {
  db = await sqlite.open(':memory:');
  await db.run(`CREATE TABLE User
  (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255)
  );`);
  await db.run(`
  INSERT INTO User('name')
  VALUES
  ('freiksenet'),
  ('fson'),
  ('Hallie'),
  ('Sophia'),
  ('Riya'),
  ('Kari'),
  ('Estrid'),
  ('Burwenna'),
  ('Emma'),
  ('Kaia'),
  ('Halldora'),
  ('Dorte');`);
  await db.run(`
  CREATE TABLE Posts
  (
    id INTEGER PRIMARY KEY,
    userid INTEGER,
    text VARCHAR(255)
  );  `);
  await db.run(`
  INSERT INTO Posts('userid', 'text')
  VALUES
  (2, 'hello'),
  (1, 'yo');`);
}
initialize();

app.use(
  '/graphql',
  bodyparser.json(),
  graphqlExpress({
    schema: schema,
    context: {}, // at least(!) an empty object
  })
);
app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: GRAPHQL_PATH,
    subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}${SUBSCRIPTIONS_PATH}`,
  })
);

const ws = createServer(app);
ws.listen(GRAPHQL_PORT, () => {
  console.log(`Office Hours GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`);
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: ws,
      path: '/subscriptions',
    }
  );
});
