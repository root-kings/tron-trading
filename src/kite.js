const { KiteConnect, KiteTicker } = require('kiteconnect');

let kc;
async function generateSessionAndMargins (API_KEY, API_SECRET, requestToken) {
  kc = new KiteConnect({
    api_key: API_KEY
  });

  const session = await kc.generateSession(requestToken, API_SECRET);
  const margins = await kc.getMargins();

  return {
    session,
    margins
  };
}

function connectToSocketAndSubscribe (API_KEY, accessToken, tokenIds, quoteListenerTickCallback = () => {}) {
  const ticker = new KiteTicker({
    api_key: API_KEY,
    access_token: accessToken
  });
  ticker.connect();
  ticker.on('ticks', ticks => onTickCallback(ticks, [logTicks, quoteListenerTickCallback]));
  ticker.on('connect', () => subscribe(ticker, tokenIds));
}

function onTickCallback (ticks, functions) {
  functions.forEach(func => {
    func.call(null, ticks);
  });
}

function subscribe (ticker, tokenIds) {
  ticker.subscribe(tokenIds);
  ticker.setMode(ticker.modeLTP, tokenIds);
}

function logTicks (ticks) {
  console.log(ticks);
}

exports.generateSessionAndMargins = generateSessionAndMargins;
exports.connectToSocketAndSubscribe = connectToSocketAndSubscribe;
