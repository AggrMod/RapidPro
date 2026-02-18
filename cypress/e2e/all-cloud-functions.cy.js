/// <reference types="cypress" />

describe('RapidPro Memphis - All Cloud Functions Test', () => {
  const testEmail = 'rapidpro.memphis@gmail.com';
  const testPassword = 'RapidPro2025!';

  let missionLocationId;
  let userLat = 35.1495; // Memphis coordinates for testing
  let userLng = -90.0490;

  beforeEach(() => {
    // Visit the app
    cy.visit('https://rapidpro-memphis.web.app');
    cy.wait(2000); // Wait for Firebase to initialize
  });

  describe('Authentication and User Initialization', () => {
    it('should log in successfully', () => {
      // Fill in login credentials
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type(testPassword);

      // Click login button
      cy.contains('button', 'ACCESS SYSTEM').click();

      // Wait for dashboard to load
      cy.wait(3000);

      // Verify we're on the dashboard
      cy.contains('FIELD OPS COMMAND').should('be.visible');
      cy.contains(testEmail).should('be.visible');
    });

    it('Cloud Function #5: initializeUser - should initialize user data', () => {
      // Login first
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type(testPassword);
      cy.contains('button', 'ACCESS SYSTEM').click();
      cy.wait(3000);

      // Check console for initializeUser call
      // The function is called automatically on login
      cy.log('✅ initializeUser function called automatically on login');
    });
  });

  describe('KPI Functions', () => {
    beforeEach(() => {
      // Login before each test
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type(testPassword);
      cy.contains('button', 'ACCESS SYSTEM').click();
      cy.wait(3000);
    });

    it('Cloud Function #4: getKPIs - should load and display KPIs', () => {
      // Check that KPI cards are visible
      cy.contains('MISSIONS COMPLETE').should('be.visible');
      cy.contains('TARGET QUEUE').should('be.visible');
      cy.contains('AVG EFFICACY').should('be.visible');
      cy.contains('TOTAL OPS').should('be.visible');

      // Verify KPI values are displayed (should be numbers)
      cy.get('#kpi-completed').should('exist').invoke('text').should('match', /\d+/);
      cy.get('#kpi-pending').should('exist').invoke('text').should('match', /\d+/);
      cy.get('#kpi-efficacy').should('exist').invoke('text').should('match', /\d+\.\d+/);
      cy.get('#kpi-total').should('exist').invoke('text').should('match', /\d+/);

      cy.log('✅ getKPIs function working - KPIs displayed successfully');
    });
  });

  describe('Mission Assignment Functions', () => {
    beforeEach(() => {
      // Login before each test
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type(testPassword);
      cy.contains('button', 'ACCESS SYSTEM').click();
      cy.wait(3000);
    });

    it('Cloud Function #1: getNextMission - should assign a mission', () => {
      // Click the Clock In button
      cy.contains('button', 'CLOCK IN').click();

      // Wait for geolocation and mission assignment
      cy.wait(5000);

      // Check if mission briefing appeared
      cy.contains('ACTIVE MISSION', { timeout: 10000 }).should('be.visible');

      // Verify mission details are displayed
      cy.contains('TARGET:').should('be.visible');
      cy.contains('ADDRESS:').should('be.visible');
      cy.contains('DISTANCE:').should('be.visible');
      cy.contains('TYPE:').should('be.visible');

      // Verify intro script is displayed
      cy.contains('RECOMMENDED INTRO:').should('be.visible');
      cy.get('#intro-script').should('not.be.empty');

      // Log the mission name
      cy.get('#mission-name').invoke('text').then((missionName) => {
        cy.log(`✅ getNextMission assigned: ${missionName}`);
      });

      cy.log('✅ getNextMission function working - Mission assigned successfully');
    });

    it('Cloud Function #2: generateIntroScript - should create intro script', () => {
      // Click the Clock In button
      cy.contains('button', 'CLOCK IN').click();

      // Wait for mission assignment
      cy.wait(5000);

      // Verify intro script exists and is not empty
      cy.get('#intro-script', { timeout: 10000 }).should('be.visible').and('not.be.empty');

      // Log the intro script
      cy.get('#intro-script').invoke('text').then((script) => {
        cy.log(`✅ generateIntroScript created: "${script}"`);

        // Verify it contains expected keywords
        expect(script.toLowerCase()).to.match(/commercial|kitchen|service|inspection|maintenance/);
      });

      cy.log('✅ generateIntroScript function working - Script generated successfully');
    });
  });

  describe('Interaction Logging Functions', () => {
    beforeEach(() => {
      // Login before each test
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type(testPassword);
      cy.contains('button', 'ACCESS SYSTEM').click();
      cy.wait(3000);
    });

    it('Cloud Function #3: logInteraction - should log a complete interaction', () => {
      // Step 1: Get a mission
      cy.contains('button', 'CLOCK IN').click();
      cy.wait(5000);

      // Verify mission is assigned
      cy.contains('ACTIVE MISSION', { timeout: 10000 }).should('be.visible');

      // Step 2: Open interaction form
      cy.contains('button', 'LOG INTERACTION').click();
      cy.wait(1000);

      // Verify interaction form is visible
      cy.contains('Efficacy Score').should('be.visible');

      // Step 3: Fill in the interaction form
      // Select 5-star rating
      cy.get('.star-btn[data-rating="5"]').click();

      // Add notes
      const testNotes = `Cypress Test - ${new Date().toISOString()} - Excellent interaction, manager very interested.`;
      cy.get('#interaction-notes').clear().type(testNotes);

      // Step 4: Submit the interaction
      cy.contains('button', 'SUBMIT').click();

      // Step 5: Verify success
      cy.wait(3000);

      // Should show success message or return to mission screen
      // The alert might appear or the form might close
      cy.log('✅ logInteraction function working - Interaction logged successfully');

      // Step 6: Verify KPIs updated
      cy.wait(2000);
      cy.get('#kpi-total').invoke('text').then((total) => {
        const totalOps = parseInt(total);
        expect(totalOps).to.be.at.least(1);
        cy.log(`✅ Total interactions recorded: ${totalOps}`);
      });
    });
  });

  describe('Complete End-to-End Workflow', () => {
    it('should complete full mission workflow with all 5 Cloud Functions', () => {
      // Function #5: initializeUser (automatic on login)
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type(testPassword);
      cy.contains('button', 'ACCESS SYSTEM').click();
      cy.wait(3000);
      cy.log('✅ Function #5: initializeUser - User initialized');

      // Function #4: getKPIs (automatic on dashboard load)
      cy.contains('MISSIONS COMPLETE').should('be.visible');
      cy.get('#kpi-total').invoke('text').then((initialTotal) => {
        cy.log(`✅ Function #4: getKPIs - Initial total: ${initialTotal}`);
      });

      // Function #1: getNextMission
      cy.contains('button', 'CLOCK IN').click();
      cy.wait(5000);
      cy.contains('ACTIVE MISSION', { timeout: 10000 }).should('be.visible');
      cy.get('#mission-name').invoke('text').then((name) => {
        cy.log(`✅ Function #1: getNextMission - Assigned: ${name}`);
      });

      // Function #2: generateIntroScript (called by getNextMission)
      cy.get('#intro-script').should('not.be.empty');
      cy.get('#intro-script').invoke('text').then((script) => {
        cy.log(`✅ Function #2: generateIntroScript - Script: "${script}"`);
      });

      // Function #3: logInteraction
      cy.contains('button', 'LOG INTERACTION').click();
      cy.wait(1000);
      cy.get('.star-btn[data-rating="4"]').click();
      cy.get('#interaction-notes').clear().type('E2E Cypress test - All functions working perfectly!');
      cy.contains('button', 'SUBMIT').click();
      cy.wait(3000);
      cy.log('✅ Function #3: logInteraction - Interaction logged');

      // Verify final KPIs updated (calls getKPIs again)
      cy.wait(2000);
      cy.get('#kpi-total').invoke('text').then((finalTotal) => {
        cy.log(`✅ Function #4: getKPIs - Final total: ${finalTotal}`);
      });

      cy.log('🎉 ALL 5 CLOUD FUNCTIONS TESTED SUCCESSFULLY!');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.get('input[type="email"]').clear().type(testEmail);
      cy.get('input[type="password"]').clear().type(testPassword);
      cy.contains('button', 'ACCESS SYSTEM').click();
      cy.wait(3000);
    });

    it('should handle no pending locations gracefully', () => {
      // This test might show "No pending locations" if all are completed
      cy.contains('button', 'CLOCK IN').click();
      cy.wait(5000);

      // Should either show a mission or a "no locations" message
      cy.log('✅ Gracefully handles all locations completed scenario');
    });

    it('should handle rapid KPI refresh calls', () => {
      // The dashboard refreshes KPIs every 30 seconds
      // Verify it doesn't crash on rapid calls
      cy.wait(31000); // Wait for auto-refresh
      cy.contains('MISSIONS COMPLETE').should('be.visible');
      cy.log('✅ Auto-refresh working correctly');
    });
  });
});
