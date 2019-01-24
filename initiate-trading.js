const { fetchRequestToken } = require('./src/token');
const { generateSessionAndMargins, connectToSocketAndSubscribe } = require('./src/kite');
const { initiateTrading, listenerTickCallback } = require('./src/quote-listener');
const { generateGetAndPostRequests } = require('./src/utils/api');
const { logger } = require('./src/utils/logger');

const API_KEY = '146w3953d6r008eg';
const API_SECRET = '2fckpb2ep2z1cl5yxem0hyh11erjphlf';
const TOKENS = [408065];

(async function () {
  try {
    const requestToken = await fetchRequestToken(API_KEY);
    logger.log('Fetching session and margins');
    const { session, margins } = await generateSessionAndMargins(API_KEY, API_SECRET, requestToken);
    const { access_token: accessToken } = session;
    logger.log('Access Token:', accessToken);
    generateGetAndPostRequests(API_KEY, accessToken);
    await initiateTrading(margins, TOKENS);
    connectToSocketAndSubscribe(API_KEY, accessToken, [408065], listenerTickCallback);
  } catch (e) {
    logger.error(`Code: ${e.code} Message: ${e.message}`);
    logger.error(e.stack);
  }
})();
