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
    student(parent, args, ctx, resolveInfo) {
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
  // Mutation: {
  //   async changeName(_, { id, newName }) {
  //     db.run(`UPDATE User SET name='${newName}' WHERE id=${id}`);
  //     pubsub.publish('nameChanged', {
  //       nameChanged: await db.all('select * from User'),
  //     });

  //     return { id: id, name: newName };
  //   },
  // },
  // Subscription: {
  //   nameChanged: {
  //     subscribe: withFilter(
  //       () => pubsub.asyncIterator('nameChanged'),
  //       (payload, variables) => {
  //         console.log(payload, variables);
  //         return true;
  //       }
  //     ),
  //   },
  // },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
joinMonsterAdapt(schema, {
  Query: {
    fields: {
      student: {
        where: (table, args) => `${table}.netid = '${args.netid}'`,
      },
    },
  },
  Student: {
    sqlTable: 'students',
    uniqueKey: 'netid',
    fields: {
      courses: {
        junction: {
          sqlTable: 'course_students',
          uniqueKey: ['course_id', 'netid'],
          sqlBatch: {
            thisKey: 'netid',
            parentKey: 'netid',
            sqlJoin: (junctionTable, courseTable) =>
              `${junctionTable}.course_id = ${courseTable}.course_id`,
          },
        },
      },
    },
  },
  Course: {
    sqlTable: 'courses',
    uniqueKey: 'course_id',
    fields: {
      id: { sqlColumn: 'course_id' },
      students: {
        junction: {
          sqlTable: 'course_students',
          uniqueKey: ['course_id', 'netid'],
          sqlBatch: {
            thisKey: 'course_id',
            parentKey: 'course_id',
            sqlJoin: (junctionTable, studentTable) =>
              `${junctionTable}.netid = ${studentTable}.netid`,
          },
        },
      },
      sessions: {
        sqlJoin: (courseTable, sessionTable) =>
          `${courseTable}.course_id = ${sessionTable}.course_id`,
      },
      tas: {
        junction: {
          sqlTable: 'course_tas',
          uniqueKey: ['course_id', 'ta'],
          sqlBatch: {
            thisKey: 'course_id',
            parentKey: 'course_id',
            sqlJoin: (junctionTable, studentTable) => `${junctionTable}.ta = ${studentTable}.netid`,
          },
        },
      },
    },
  },
  Session: {
    sqlTable: 'sessions',
    uniqueKey: 'session_id',
    fields: {
      id: { sqlColumn: 'session_id' },
      course: {
        sqlJoin: (sessionTable, courseTable) =>
          `${sessionTable}.course_id = ${courseTable}.course_id`,
      },
      tas: {
        junction: {
          sqlTable: 'session_tas',
          uniqueKey: ['session_id', 'ta'],
          sqlBatch: {
            thisKey: 'session_id',
            parentKey: 'session_id',
            sqlJoin: (junctionTable, studentTable) => `${junctionTable}.ta = ${studentTable}.netid`,
          },
        },
      },
      questions: {
        sqlJoin: (sessionTable, questionTable) =>
          `${sessionTable}.session_id = ${questionTable}.session_id`,
      },
    },
  },
  Question: {
    sqlTable: 'questions',
    uniqueKey: 'question_id',
    fields: {
      id: { sqlColumn: 'question_id' },
      session: {
        sqlJoin: (questionTable, sessionTable) =>
          `${questionTable}.session_id = ${sessionTable}.session_id`,
      },
      student: {
        sqlJoin: (questionTable, studentTable) =>
          `${questionTable}.student = ${studentTable}.netid`,
      },
    },
  },
});

async function initialize() {
  db = await sqlite.open(':memory:');
  await db.exec(fs.readFileSync(path.join(__dirname, 'db.sql'), 'utf-8'));
  console.log(await db.all('SELECT name FROM sqlite_master WHERE type = "table"'));
  // console.log(await db.all('select * from course_students'));
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
