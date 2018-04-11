# Office Hours
./client contains the development server for the react app, while ./server contains the GraphQL server for the backend

## Setup
Run
```
cd ./client && yarn install
cd ./server && yarn install
```

To run the client:
```
cd client
yarn start
```

To create a static production build of the client that the frontend can serve:
```
cd client
yarn run deploy
```

To run the server:
```
cd server
yarn start
```
This will serve the latest production build of the client available to it.

# GraphQL goodies
In what one might say is the entire reason we're using GraphQL, it's very easy to use the API. Once you have the graphQL server running, go to `localhost:3001/__gql/graphiql`.

Tips:
1. Press Docs to explore the different actions you can take.
2. Press <Ctrl-Space> for autocompletion.
3. Check the server output in the console if something isn't working. There may be a helpful error message!

For example, your queries might look something like
```
query {
    user(id: 4) {
        id
        name
    }
}
```
