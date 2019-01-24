const { _get, _post } = require('./utils/api');
const { loginCredentials, twoFAAnswers, getLoginUrl } = require('./utils/credentials');

async function fetchRequestToken (API_KEY) {
  const response = await _get(getLoginUrl(3, API_KEY));
  const refererUrl = response.url;
  const loginResponse = await _post('https://kite.zerodha.com/api/login', {
    user_id: loginCredentials.username,
    password: loginCredentials.password
  });
  const loginResponseBody = await loginResponse.json();
  console.log(loginResponseBody);
  const { question_ids, questions } = loginResponseBody.data;
  const twoFAResponse = await _post('https://kite.zerodha.com/api/twofa', {
    user_id: loginCredentials.username,
    question_id: question_ids,
    answer: [twoFAAnswers[questions[0]], twoFAAnswers[questions[1]]]
  }, {
    encoding: 'formEncoding',
    headers: {
      Referer: refererUrl
    }
  });
  const twoFAResponseBody = await twoFAResponse.json();
  console.log(twoFAResponseBody);
}

exports.fetchRequestToken = fetchRequestToken;
