const twoFAAnswers = {
  "What is your mother's name?": 'Sandhyarani',
  "Which is the bank that gave you your first credit card?": 'ICICI',
  "Which year did you join your current company? (e.g. 2000, 2005, etc)": '2016',
  "What is your shoe size? ( e.g. 5, 7 etc)": '9.5',
  "What was the brand of your first mobile?": 'Samsung'
};

const loginCredentials = {
  username: 'YD4030',
  password: 'Zerodha1At!!'
};

function getLoginUrl (version, API_KEY) {
  return `https://kite.trade/connect/login?v=${version}&api_key=${API_KEY}`;
}

exports.loginCredentials = loginCredentials;
exports.twoFAAnswers = twoFAAnswers;
exports.getLoginUrl = getLoginUrl;
