// Before running tests, starts on landing page, logs in to firebase, then visits the dashboard
// Log in occurs with TEST_UID of the courseplan testing account using a function from the cypress-firebase package
// before('Visit site logged in', () => {
//   cy.visit('localhost:8080/login');
//   cy.login(Cypress.env('TEST_UID'));
//   cy.visit('localhost:8080');
//   cy.wait(5000); // ensure the page has time to load
// });


before('Login to website', (done) => {  
    // TEMPORARY workaround for login error
    cy.on('uncaught:exception', (err, runnable) => {
      expect(err.message).to.include('Missing or insufficient permissions')
      
      // using mocha's async done callback to finish
      // this test so we prove that an uncaught exception
      // was thrown
      done()
  
      // return false to prevent the error from
      // failing this test
      return false
    })

    cy.visit('http://localhost:3000/login')
    cy.login(Cypress.env("REACT_APP_TEST_UID"))
    cy.visit('http://localhost:3000')
    cy.wait(5000);
    // cy.get('[data-testid="cypress-test"]').should("exist")
    // .should('have.text', 'Office Hours Simplified')
})

describe('Landing Page Tests', () => {
  it('logs into the website', (done) => {

    cy.get('[data-testid="splitview-landingtext"]').should("exist")
    .should('have.text', 'Please select an office hour from the calendar.')
  })
})