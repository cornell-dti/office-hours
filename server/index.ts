import * as express from 'express';
import postgraphql from 'postgraphql';

const app = express();

app.use(postgraphql(process.env.DATABASE_URL || 'postgres://localhost:5432', { graphiql: true }));
app.use(express.static('build'))

app.listen(process.env.PORT || 3001);
