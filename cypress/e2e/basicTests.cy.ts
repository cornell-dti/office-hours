// Before running tests, starts on landing page, logs in to firebase, then visits the dashboard
// Log in occurs with TEST_UID of the courseplan testing account using a function from the cypress-firebase package
// before('Visit site logged in', () => {
//   cy.visit('localhost:8080/login');
//   cy.login(Cypress.env('TEST_UID'));
//   cy.visit('localhost:8080');
//   cy.wait(5000); // ensure the page has time to load
// });


before('Login to website', () => {  
    // TEMPORARY workaround for login error
    cy.on('uncaught:exception', (err) => {
      expect(err.message).to.include('Missing or insufficient permissions')
      // return false to prevent the error from failing this test
      return false
    })

    cy.visit('http://localhost:3000/login')
    cy.login(Cypress.env("REACT_APP_TEST_UID"))
    cy.visit('http://localhost:3000')
    cy.get('[data-cy="splitView-landingText"]', {timeout: 10000}).should("exist")
    .should('have.text', 'Please select an office hour from the calendar.\n⚠Please make sure to enable browser notifications in your system settings.')
})

describe('Landing Page Tests', () => {
  it('checks default selected date', () => {
    // This is in the form "Mon Apr 21 2025"
    const date = (new Date()).toDateString();
    const day = date.split(" ")[0];
    const month =  date.split(" ")[1];
    const dayNum = date.split(" ")[2];
    cy.get('[data-cy="calDateItem-active"]').within(() => {
      cy.get('.day').should('have.text', day);
      cy.get('.date').should('have.text', dayNum);
    });
    cy.get('[data-cy="calDaySelect-month"]').should('contain.text', month);

  })

  // Add more!

 
})