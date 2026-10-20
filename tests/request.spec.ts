import { test, expect } from  '../fixtures/pages.fixtures';

test('Complete the Form and submit', async ({ homePage, requestPage }) => {
    await test.step('Navigate to the Request Page', async () => {
      await homePage.goto('/');
    });

    await test.step('Fill out the form and submit', async () => {
      await homePage.clickRequestButton();
      await requestPage.fillRequestForm({
          firstName: 'Joe',
          lastName: 'Doe',
          email: 'joedoe@test.com',
          phone: '1234567890',
          company: 'Test Company',
          industry: 'technology',
          services: ['warehousing'],
          timeline: 'immediate',
          details: 'This is a test message.',
      });
    });

    await test.step('Verify the submission was successful', async () => {
      expect(await requestPage.submitForm()).toBe('Thank you for your request! We will contact you within 24 hours.');
    });
  });