const seleniumWebdriver = require('selenium-webdriver');

const { getQueryParamsFromUrl } = require('./utils/js-utils');
const { buildDriver, waitForLogin, fetchLoginInputFields, enterAndSubmitForm, fetchSecurityQuestions, fetchTwoFAInputFields } = require('./utils/web-driver');
const { loginCredentials, twoFAAnswers, getLoginUrl } = require('./utils/credentials');
const { logger } = require('./utils/logger');

const {By, until} = seleniumWebdriver;
let hasDriverQuit = false;

async function fetchRequestToken (API_KEY) {
  // create a firefox instance
  logger.log('Building driver');
  const driver = await buildDriver();
  try {
    // load login url endpoint
    await driver.get(getLoginUrl(3, API_KEY));
    logger.log('Opening login page');

    // wait till innerTEXT of page-title div is "Login to Follow Trading"
    await waitForLogin(driver);
    logger.log('Login page ready');

    // Fetch Username and Password input fields, enter the credentials and press ENTER
    const loginInputFields = await fetchLoginInputFields(driver);
    const { usernameInputField: fieldOne, passwordInputField: fieldTwo } = loginInputFields;
    const loginFormFields = {
      fieldOne,
      fieldTwo
    };
    const { username: valueOne, password: valueTwo } = loginCredentials;
    const loginFormValues = {
      valueOne,
      valueTwo
    };
    await enterAndSubmitForm(loginFormFields, loginFormValues);
    logger.log('Entered username and password');

    // Wait till two-factor form appears
    await driver.wait(until.elementLocated(By.className('twofa-form')), 10000);
    logger.log('Opened two factor form');

    // Fetch the two questions asked
    const { securityQuestionOne, securityQuestionTwo } = await fetchSecurityQuestions(driver);
    logger.log('Fetched Two FA questions');

    // Fetch the answers for both questions from the answers map
    const answerOne = twoFAAnswers[securityQuestionOne];
    const answerTwo = twoFAAnswers[securityQuestionTwo];
    logger.log('Question 1:', securityQuestionOne, 'Answer:', answerOne);
    logger.log('Question 2:', securityQuestionTwo, 'Answer:', answerTwo);

    // Fill the input fields with the answers and press ENTER
    const twoFAFormFields = await fetchTwoFAInputFields(driver);
    const twoFAFormValues = {
      valueOne: answerOne,
      valueTwo: answerTwo
    };
    await enterAndSubmitForm(twoFAFormFields, twoFAFormValues);
    logger.log('Entered Two FA answers');

    // Wait till the redirect url starts with https://tron-trading.appspot.com
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.startsWith('https://tron-trading.appspot.com');
    }, 10000);
    logger.log('Redirection complete');
    const currentUrl = await driver.getCurrentUrl();

    // Fetch query params of the url
    const queryParams = getQueryParamsFromUrl(currentUrl);

    // Fetch the request_token query param and log it
    const requestToken = queryParams['request_token'];
    logger.log('Request Token:', requestToken);
    await driver.quit();
    hasDriverQuit = true;

    return requestToken;
  } catch (e) {
    logger.error(`Code: ${e.code} Message: ${e.message}`);
    logger.error(`Stack: ${e.stack}`);
  } finally {
    if (!hasDriverQuit) {
      await driver.quit();
    }
  }
}

exports.fetchRequestToken = fetchRequestToken;
