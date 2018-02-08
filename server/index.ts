import * as express from 'express';
import path from 'path';
//import postgraphql from 'postgraphql';

const app = express();

//app.use(postgraphql(process.env.DATABASE_URL || 'postgres://localhost:5432', { graphiql: true }));
app.use(express.static(path.join(__dirname, '../client/build')))

app.listen(process.env.PORT || 3001, () => {
    console.log("served bro");
});
