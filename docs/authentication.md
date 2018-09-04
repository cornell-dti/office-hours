# Authentication Documentation
This document outlines the authentication flow used by the app, with details about every step and explanations of important concepts.

## Introduction
Since students have G Suite Accounts by default, we decided to use Google sign-in as an authentication service, while enforcing the @cornell.edu hosted domain. This forces students to only login with their Cornell-assigned NetIDs, and not with their personal Gmail addresses. Once a user logs in through Google, we associate them with a user entry on our backend, which is used to identify them within the app going forward.

There are a few high-level steps involved in the authentication flow. Each of the sections below dives deeper into the implementation, one step at a time.

### Sign in with Google
We use Passport.js to handle our interaction with the Google sign-in service. Our implementation follows [this](https://www.youtube.com/playlist?list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x) video tutorial series quite closely; please skim through it if you'd like a step-by-step breakdown of the Passport flow!

- (React land) the user hits the login button and is redirected to `/__auth` on the server
- (Server land) the request is forwarded to the Passport handler, which initiates the Google sign-in process (this is where we tell Google to restrict the hosted domain to @cornell.edu, and that we would like the user's profile and email details)
- (Google land) the user is redirected by Passport to the Google sign in page. Upon completion, Google redirects the user to `/__auth/callback` on our server with a code attached in the URL
- (Server land) this request with the code is first automatically decoded by Passport for us. Passport then calls the callback function provided in the initialization of the Google Strategy. Here, we have access to the user's profile details.

### Creating and retrieving users
- (...still in server land) the user's profile contains a unique Google-assigned id (sub). We need to use this to either create a new user, or retrieve one if this Google user has previously logged in. We collect other details (first name, last name, email, photo URL) and send it over to the GraphQL API via an HTTP request. Note that a library to make GraphQL requests like Apollo is not available on the server, so we must make a raw HTTP request.
- (...still in server land) the request arrives at `/__gql/graphql` on our server. The query and variables reach GraphQL.
- (GraphQL land) the function apiFindOrCreateUser's resolver is called. This is implemented as a PostgreSQL custom function.
- (Postgres land) we use the incoming Google ID to either retrieve the existing user, or create one with the given details if none exists. The backend-generated user ID is returned to GraphQL land. The response eventually makes its way back to the initial request.
- (back to server land) the Google Strategy callback function, which initiated this request, receives the user's ID. This function calls the 'done' function and passes the user ID, signalling to Passport that req.user should now store the user ID.
- (...still in server land) back to `/__auth/callback`, this request finally completes with a redirect to the home page.

### Creating and storing the JWT as a cookie
Before the above redirect occurs, there is one small additional step. We want to store this user's ID securely on the client side, so that subsequent requests to the backend can extract the user's identity in a secure way. To do this, we use JSON Web Tokens (JWTs); you can think of them as JSON objects that are encrypted using some secret key. They are self-contained in that they come with a signature. If anyone tries to tamper with the token, it is easy to detect it if one has the secret encryption key. Overall, JWTs offer a convenient way to store our user ID on the client side.

To store JWTs on the client-side, we use signed cookies. The package 'cookie-session' helps us with this, and in fact integrates seemlessly into the Passport flow. The Passport video tutorial series explains this well, but in essence, all we have to do is implement two functions: `serializeUser` and `deserializeUser`. All cookies set should have both the `Secure` and `HttpOnly` flags set. The secure flag means the cookie will only be transmitted over a secure (HTTPS) connection, protecting from man-in-the-middle attacks. HttpOnly means that the cookies cannot be accessed in Javascript. This protects the user tokens from cross site scripting attacks (XSS).

- (Server land) when the user first logs in, we need to store the user's ID in a JWT, and then store that as a cookie. Passport calls the `serializeUser` function for this. Here, we use the 'jsonwebtoken' package to sign the user ID with a secret, and also specify the expiration of the generated JWT. Additionally, we need the audience to be set to 'postgraphile' in order for the later steps to work.
- (Client land) the cookie-session package comes into play here. It takes the output of `serializeUser` and generates a signed cookie from it, against with a certain expiration and a secret key. This cookie is sent back to the client, which will then store it locally in the browser until expiration.

### Passing the cookie to the backend
- (React land) the user makes an arbitrary GraphQL query. If the backend wants to identify this user for whatever purpose (for example, authorization), we must have the client pass the cookie to the backend with every request. Apollo lets us automatically send the stored cookies with every request using `credentials: 'same-origin'` when creating our `ApolloClient` instance.

- (Server land) cookie-session decrypts the cookie for us using the secret key, and makes the underlying JWT available to Passport

- (...still in server land) Passport will call `deserializeUser`, passing in the JWT. The next step of the flow requires the JWT itself, so we won't do any unpackaging to the JWT right now. We simply pass it along. `req.user` on this incoming request is set to the raw JWT.

### Passing the JWT to Postgres
Our end goal is to make the user's identity known to Postgres while the queries are being executed. Check out [these docs](https://www.graphile.org/postgraphile/postgresql-schema-design/#json-web-tokens) from Postgraphile on how this should be done.

- (...still in server land) the GraphQL request will find its way to the handler for `/__gql/graphql`. Here, we check if `req.user` is defined. Note that this will only be defined if a valid, signed cookie was passed in with the request by the client. If the user is signed in, `req.user` should contain a JWT at this point. We append an Authorization header to this request containing the JWT, since this is the recommended way of passing user authentication details to Postgraphile.

- (GraphQL land) the incoming JWT in the Authorization header is decoded using the JWT secret, and verified to protect against any tampering. If it is valid, then all the claims are made available to Postgres when the query is being resolved. More information [here](https://www.graphile.org/postgraphile/postgresql-schema-design/#json-web-tokens)!

### Identifying the user in Postgres
Since the JWT contained the user ID in a field called userId, we can access the user's identity using `current_setting('jwt.claims.userId')` in Postgres. We can use this in triggers and checks to implement authorization, and also to securely inject the user's ID in certain queries rather than trusting the client to provide a correct user ID.

### Protecting routes behind login
- (React land) if the user tries to access a route that requires login, we need to check if they are actually logged in or not. Note that the client cannot even access the cookie, let alone read it. Therefore, the only way to do this is to send this cookie to the backend and ask it to verify the user's identity. This is done through the GraphQL function, `apiGetCurrentUser`. [This](https://tylermcginnis.com/react-router-protected-routes-authentication/) is a helpful link if you'd like to understand protected routes with React Router!

### Logging out
Though there is no front-end implementation yet, logging out requires the user to visit the `/__auth/logout` route. This simply removes the JWT from the stored cookie, which effectively logs out the user for subsequent requests.
