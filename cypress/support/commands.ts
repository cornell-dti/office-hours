/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import firebase from 'firebase/compat/app';
// Cypress as of now doesn't support the new modular Admin SDK so use firebase/compat/auth to get old versions

import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database';
import { attachCustomCommands } from 'cypress-firebase';

Cypress.Commands.add('visitIfNotAlready', (path: string) => {
    cy.location('pathname').then((currentPath) => {
      if (currentPath !== path) {
        cy.visit(`http://localhost:3000${path}`);
      }
    });
  });

  declare global {
    namespace Cypress {
      interface Chainable {
        visitIfNotAlready(path: string): Chainable<void>;
      }
    }
  }

let firebaseConfig: Record<string, unknown>;
if (process.env.NODE_ENV === 'production' && process.env.                   REACT_APP_IS_STAGING !== 'true') {
    firebaseConfig = {
        apiKey: Cypress.env("REACT_APP_API_KEY"),
        authDomain: "queue-me-in-prod.firebaseapp.com",
        databaseURL: "https://queue-me-in-prod.firebaseio.com",
        projectId: "queue-me-in-prod",
        storageBucket: "queue-me-in-prod.appspot.com",
        messagingSenderId: "283964683310",
        appId: "1:283964683310:web:98ef1bd535c6315749dbbf",
        measurementId: "G-GHJ0TML275"
    };
} else {
    firebaseConfig = {
        apiKey: Cypress.env("REACT_APP_TEST_KEY") ? Cypress.env("REACT_APP_TEST_KEY") : Cypress.env("REACT_APP_API_KEY"),
        authDomain: 'qmi-test.firebaseapp.com',
        databaseURL: 'https://qmi-test.firebaseio.com',
        projectId: 'qmi-test',
        storageBucket: 'qmi-test.appspot.com',
        messagingSenderId: '349252319671',
    };
}

firebase.initializeApp(firebaseConfig);
attachCustomCommands({ Cypress, cy, firebase });
