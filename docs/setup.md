# Getting Started

## File Structure
At the top-level, there are three main directories in the repository:
- `/client`: contains all the front-end client code
- `/server`: contains all the backend and database code
- `/scripts`: contains utility scripts that help in development
- `/docs`: technical documentation (such as this) about the app's implementation

## Installation
- Install [Git](https://www.atlassian.com/git/tutorials/install-git) on your machine, or download the [Github Desktop app](https://desktop.github.com/). If you're new to Github, watch [this](https://www.youtube.com/watch?v=w3jLJU7DT5E) quick overview video and go through their introductory [tutorial](https://guides.github.com/activities/hello-world/).
- Use Git to [clone](https://help.github.com/articles/cloning-a-repository/) this repository onto your local machine.
- The server code is written using a framework called Node.js. Download Node [here](https://nodejs.org/en/download/).
- Our code relies on several JavaScript libraries under the hood, and we use the Yarn package manager to manage (i.e. add, update or remove) these dependencies. Install [Yarn](https://yarnpkg.com/lang/en/docs/install/) on your machine.
- Navigate to `/client` in a terminal window and run `yarn install` to install all the libraries that we use on the client.
- Navigate to `/server` in a terminal window and run `yarn install` to install all the libraries that we use on the server.
- We use a Postgres database behind the server to actually store and retrieve data. Install [Postgres](https://www.postgresql.org/download/) on your machine. During the installation, take note of the username, password, and port on which Postgres is initialized. Follow the steps in the [database setup documentation](./database.md) to complete the Postgres setup!
- Set the required environment variables by following [this documentation](./environment_variables.md).

## Running the app
Once the initial installation is complete and Postgres is running, you're ready to run the app. To do so, navigate to `./server` in a terminal window and run `yarn start`. This will start the server on `http://localhost:3001`, and will serve the front-end files that were most recently available in `./client/build`.

## GraphiQL
For our backend API, we are using a relatively new technology called [GraphQL](https://graphql.org/). In essence, this automatically creates an extremely flexible API for our client using only our database schema, so we no longer have to write complicated API endpoints. It comes with a handy tool for API exploration called GraphiQL. When you are running the server on `http://localhost:3001`, you can navigate to `http://localhost:3001/__gql/graphiql` to view the GraphiQL interface. Over here, you can view all the functions available to you (+ auto-generated documentation), and also try out queries in the left panel!

## Making client-side changes
Note that the server will always only serve the client-side files that were most recently available in the `./client/build`. This folder is auto-generated when you run the `yarn deploy` command in `./client`, but this command can take more than 2 minutes to complete! There's a smarter way to run the app if you're testing client-side changes:

`> cd client`

`> yarn start`

This will start the client on `http://localhost:3000` (note that the server runs on 3001, and the client runs on 3000) with live reloading! The `yarn start` command might take a minute to get up and running the first time, but after that, any changes that you make to the front-end will automatically trigger the app to re-compile in a few seconds! The changes should show up in your browser when you refresh the page.

The catch here is that you still need the interaction with the server to work, so you also need to simultaneously run the server to avoid getting a ton of errors. Therefore, we also need to do the following in a new terminal window:

`> cd server`

`> yarn start`

Alternatively, if you are only doing front-end work, you may use the proxy key of the `client/package.json` and set it to `https://queue-me-in.herokuapp.com`. This will cause your development build to use the server implementation that we have hosted. _Note:_ this only works if the database structure/backend has not changed between your local code and the deployed version.

### Fake authentication

There is still one flaw though; our [authentication flow](./authentication.md) will break if the client and server are on different domains. To get around this, we've added a feature in the server that lets you assume the identity of any existing user, thereby temporarily bypassing the need for authentication. There are more details about this in the authentication docs, but here's what you need to do:

`> cd server`

`> yarn start --fakeuserid=<user-id-here>`

For example, if we wanted to assume the identity of the user with ID 3 in our database, we could run `> yarn start --fakeuserid=3`. This would artifically signal to the server that we are user 3, even though we're really not.

This is also useful if you're testing features that work differently for different users! For example, if you are testing a feature in the TA view, you can simply start the server with a fake user ID that corresponds to a TA.

## Making server-side changes
If you are making exclusively server-side changes on the backend, and are not touching the front-end, you can get away with just starting the server process:

`> cd client`

`> yarn start`

This will serve the static build that was most recently generated on the client side. You may also find it useful to pass in the fakeuserid flag to `yarn start` if you're testing a backend feature that changes behavior based on the user's identity.

## Making database changes
If you want to update the database schema, or change the custom functions or triggers in it, please first read and understand the [database documentation](./database.md)! I would highly recommend a visual database management tool like [DBeaver](https://dbeaver.io/), which makes it easier to visualize the database schema and make changes to it. Once you have made changes, follow the instructions in the database documentation to generate a PostgreSQL dump of the database. Commit the generated file so that others can then also update their schema!

While testing schema changes, be sure to restart the server whenever a change is made. Postgraphile (the library that we use to generate the GraphQL schema using the Postgres schema) is initialized only when the server is first started, so its endpoints will not change dynamically.

## Pull Requests
Once you've made changes to the codebase, it's time to get them approved. Please look through [this guide](https://guides.github.com/introduction/flow/) on the Github Flow before you start working on any code! It outlines the general process for making and pushing changes to a repository. (Note: This is not the same as Gitflow) For us specifically, here are some guidelines:
- When you are starting to work on something new, first switch to the master branch and sync it with the remote
- Create a new branch off master, and give it an informative name, prefixed by your initials. For example, if your initials are ab, name your branch `ab/descriptive-name`.
- Commit your changes to this feature branch. Commit often so that you don't accidentally lose your progress!
- Open a pull request (PR), give it a meaningful title and describe the changes that you made. Take note of any future improvements or any existing bugs with the changes you made.
- Notify others of the PR you created, and ask the relevant people to review it for you. They may leave comments and request changes, in which case you should make changes and push new commits to the same branch; the PR will update automatically!
- Finally, when the change is approved by the reviewer, you can go ahead and merge the branch into the master branch.

## Helpful Resources
This folder contains other guides as well, for example on authentication and the database schema. Check those out if you'd like more information about any of those! Here are some additional resources you might find helpful:
- [React tutorial](https://reactjs.org/tutorial/tutorial.html)
- [LESS tutorial](https://tutorialzine.com/2015/07/learn-less-in-10-minutes-or-less)
- [GraphQL tutorial](https://www.howtographql.com/)
- [Postgraphile](https://www.graphile.org/postgraphile/)
- [Apollo Client for GraphQL](https://www.apollographql.com/docs/react/)
- [Progressive Web Apps documentation](https://developers.google.com/web/progressive-web-apps/)
- [Git tutorials from beginner to advanced](https://www.atlassian.com/git/tutorials/what-is-version-control)
