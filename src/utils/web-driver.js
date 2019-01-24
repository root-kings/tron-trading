const seleniumWebdriver = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');

const { Builder, until, Key, By } = seleniumWebdriver;

async function buildDriver () {
  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new Chrome.Options().headless())
    .build();
}

async function waitForLogin (driver) {
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url.startsWith('https://kite.zerodha.com');
  });
  console.log('Opened login page');
  await driver.wait(until.elementLocated(By.className('page-title')), 5000);
}

async function fetchLoginInputFields (driver) {
  const usernameInputField = await driver.wait(until.elementLocated(By.css('.su-input-group input[type=text]')));
  const passwordInputField = await driver.wait(until.elementLocated(By.css('.su-input-group input[type=password]')));
  return {
    usernameInputField,
    passwordInputField
  };
}

async function enterAndSubmitForm (formFields, formValues) {
  const { fieldOne, fieldTwo } = formFields;
  const { valueOne, valueTwo } = formValues;
  await fieldOne.sendKeys(valueOne);
  await fieldTwo.sendKeys(valueTwo, Key.ENTER);
}

async function fetchSecurityQuestions (driver) {
  const securityQuestionOneLabel = await driver.wait(until.elementLocated(By.css('.twofa-form div:nth-child(2) .su-input-group .su-input-label')));
  const securityQuestionTwoLabel = await driver.wait(until.elementLocated(By.css('.twofa-form div:nth-child(3) .su-input-group .su-input-label')));
  const securityQuestionOne = await securityQuestionOneLabel.getText();
  const securityQuestionTwo = await securityQuestionTwoLabel.getText();
  return {
    securityQuestionOne,
    securityQuestionTwo
  };
}

async function fetchTwoFAInputFields (driver) {
  const questionOneInputField = await driver.wait(until.elementLocated(By.css('.twofa-form div:nth-child(2) .su-input-group input[type=password]')));
  const questionTwoInputField = await driver.wait(until.elementLocated(By.css('.twofa-form div:nth-child(3) .su-input-group input[type=password]')));
  return {
    fieldOne: questionOneInputField,
    fieldTwo: questionTwoInputField
  };
}

exports.buildDriver = buildDriver;
exports.waitForLogin = waitForLogin;
exports.fetchLoginInputFields = fetchLoginInputFields;
exports.enterAndSubmitForm = enterAndSubmitForm;
exports.fetchSecurityQuestions = fetchSecurityQuestions;
exports.fetchTwoFAInputFields = fetchTwoFAInputFields;
