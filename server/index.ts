import * as express from 'express';
//import postgraphql from 'postgraphql';

console.log("hi");
const app = express();

//app.use(postgraphql(process.env.DATABASE_URL || 'postgres://localhost:5432', { graphiql: true }));
app.use(express.static('../client/build'))

app.listen(process.env.PORT || 3001, () => {
    console.log("served bro");
});
