// Before running tests, starts on landing page, logs in to firebase, then visits the dashboard


beforeEach('Login to website', () => {  
    // TEMPORARY workaround for login error
    cy.on('uncaught:exception', (err) => {
      expect(err.message).to.include('Missing or insufficient permissions')
      // return false to prevent the error from failing this test
      return false
    })
    console.log('haha');
    console.log(Cypress.env("REACT_APP_TEST_UID"))
    cy.visit('http://localhost:3000/login')
    cy.login(Cypress.env("REACT_APP_TEST_UID"))
    cy.visit('http://localhost:3000/course/cypress-25')
    cy.get('[data-cy="splitView-landingText"]', {timeout: 10000}).should("exist")
    .should('have.text', 'Please select an office hour from the calendar.\n⚠Please make sure to enable browser notifications in your system settings.')
})

// beforeEach('Visit landing view before each test',() => {
//   cy.visitIfNotAlready('/course/cypress-25');
// });

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
  it('checks user is Professor for Cypress 101', () => {
    cy.get('[data-cy="topBar-homeButton"]').should('be.visible').click();
    cy.url().should('include', '/home');
    // Hard coding the test class name "Cypress"
    const testList = [['.courseRole', 'PROF'],['.courseCode', '101'], ['.courseName', 'Cypress']]
    testList.map((test) => {
      cy.get('[data-cy="courseSelection-Cypress"]', { timeout: 10000 })
    .find(test[0]).should('have.text', test[1])
    });
  })


  // Add more!

 
})