import * as express from 'express';
import postgraphql from 'postgraphql';

const app = express();

app.use(postgraphql('postgres://localhost:5432', { graphiql: true }));

app.listen(process.env.PORT || 3001);
