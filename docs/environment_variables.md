# Environment Variables
Our app expects certain environment variables to be set before it is run. Anything that is considered sensitive and that cannot therefore be checked into Github should be factored out as an environment variable. While testing locally, you may need to set some of these in your terminal before running the server.

## Authentication

- `OH_GOOGLE_SECRET` - Google OAuth client secret key (**required:** ask the PMs for it!)
- `OH_SESSION_SECRET` - Key used to encrypt session cookies (**optional**: it will default to a hard-coded string if not provided)
- `OH_JWT_SECRET` - Used to sign and verify JWT tokens (**optional**: it will default to a hard-coded string if not provided)
- `POSTGRES_USERNAME` - username that was used to create your admin postgres account. Usually "postgres".
- `POSTGRES_HOSTNAME` - hostname that was used to create your admin postgres account. Usually "localhost".
- `POSTGRES_PORT=5432` - port that your postgres server will be connected through. Usually "5432".
- `POSTGRES_PASSWORD` - Feel free to reuse any password. This file won't be committed.
- `POSTGRES_DBNAME` - the name of your local postgres server
