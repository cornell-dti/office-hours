import { defineConfig } from "cypress";
import {plugin as cypressFirebasePlugin} from "cypress-firebase"
import admin from "firebase-admin";
import 'dotenv/config'

// If you encounter errors, ensure GOOGLE_APPLICATION_CREDENTIALS is set on your machine to the path leading to the correct service account.
// Also make sure the localhost version is up and running before running tests

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: (process.env.NODE_ENV === 'production' && process.env.REACT_APP_IS_STAGING !== 'true') ? "queue-me-in-prod": "qmi-test",
});

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return cypressFirebasePlugin(on, config, admin, {
        projectId: (process.env.NODE_ENV === 'production' && process.env.REACT_APP_IS_STAGING !== 'true') ? "queue-me-in-prod": "qmi-test"
      });
    },
  },
  "env": { "REACT_APP_TEST_UID": process.env.REACT_APP_TEST_UID,
    "REACT_APP_TEST_KEY": process.env.REACT_APP_TEST_KEY,
    "REACT_APP_API_KEY" : process.env.REACT_APP_API_KEY,
    "REACT_APP_RESEND_API_KEY": process.env.REACT_APP_RESEND_API_KEY
   }
});
