# Office Hours
./client contains the development server for the react app, while ./server contains the GraphQL server for the backend

## Setup
Run
```
cd ./client && npm install
cd ./server && npm install
```
Before running the client, install `less` globally on your machine by running:
```
npm install -g less
npm install -g less-watch-compiler
```

Now, you should be able to run `npm start` and get everything running!

# GraphQL goodies
In what one might say is the entire reason we're using GraphQL, it's very easy to use the API. Once you have the graphQL server running, go to `localhost:3001/graphiql`.

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
