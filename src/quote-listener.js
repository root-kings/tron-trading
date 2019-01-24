const { get, post } = require('./utils/api');
const { getInstrumentsObject, getMarginMultiplierForInstrument } = require('./utils/js-utils');
const { calculateStopLoss, executeOrder, logStockState, calculateFinances } = require('./utils/stock');
const { logger } = require('./utils/logger');

const stockInfo = {};
let finances = {
  net: 0,
  amount: {
    transactions: 0,
    sell: 0
  },
  cash: {
    initial: 0,
    current: 0,
    gross: 0
  },
  charges: {
    brokerage: 0,
    stt: 0,
    transactionCharges: 0,
    gst: 0,
    stampCharges: 0,
    total: 0
  }
};
async function initiateTrading (margins, tokenIds) {
  // fetch all instruments
  const instrumentsResponse = await get('/instruments/NSE');
  const instrumentsCSV = await instrumentsResponse.text();
  const instruments = getInstrumentsObject(instrumentsCSV);

  // fetch all margin multipliers
  const marginResponse = await get('/margins/equity');
  const equityMargins = await marginResponse.json();

  // fetch multipliers for tokenIds
  const misMultipliers = getMarginMultiplierForInstrument(tokenIds, instruments, equityMargins);

  // fetch last traded price of token
  const instrumentsQuery = tokenIds
    .map(tokenId => `i=${tokenId}`)
    .join('&');
  const quoteResponse = await get('/quote/ltp?' + instrumentsQuery);
  const quote = await quoteResponse.json();

  // calculate margin available for trading
  const availableCash = 1000; // margins.equity.available.cash;
  const cashToTrade = availableCash * 0.7;
  finances.cash.initial = cashToTrade;
  finances.cash.current = cashToTrade;

  // calculate no of stocks to trade
  const totalNoOfInstruments = tokenIds.length;
  const cashToTradeForInstrument = cashToTrade / totalNoOfInstruments;
  tokenIds.forEach(tokenId => {
    const tokenQuote = quote.data[tokenId];
    stockInfo[tokenId] = {
      symbol: misMultipliers[tokenId].symbol,
      ltp: tokenQuote.last_price,
      cashToTrade: cashToTradeForInstrument,
      multiplier: misMultipliers[tokenId].misMultiplier,
      noOfStocks: Math.floor(cashToTradeForInstrument * misMultipliers[tokenId].misMultiplier / tokenQuote.last_price),
      stopLoss: calculateStopLoss(tokenQuote.last_price),
      direction: 0,
      tippingPoint: undefined
    };
  });

  // initiate starting trade and set valuable direction
  tokenIds.forEach(tokenId => {
    const token = stockInfo[tokenId];
    executeOrder(token, 'BUY');
    calculateFinances(finances, token, 'BUY');
    stockInfo[tokenId].direction = 1;
  });
  logger.log('Current stock info:', JSON.stringify(stockInfo));
}

async function onTick (ticks) {
  ticks = ticks.map(tick => ({
    tokenId: tick.instrument_token,
    ltp: tick.last_price
  }));

  ticks.forEach(tick => {
    // Check if price direction is valuable
    const tokenInfo = stockInfo[tick.tokenId];
    if ((tick.ltp > tokenInfo.ltp && tokenInfo.direction > 0)
      || (tick.ltp < tokenInfo.ltp && tokenInfo.direction < 0)) {
      // check if tipping point is set
      if (typeof tokenInfo.tippingPoint === 'undefined') {
        // update stop loss
        tokenInfo.stopLoss = calculateStopLoss(tick.ltp, tokenInfo.direction);
      } else {
        // Check if price is beyond the tipping point in the valuable direction
        if ((tokenInfo.direction > 0 && tick.ltp > tokenInfo.tippingPoint)
          || (tokenInfo.direction < 0 && tick.ltp < tokenInfo.tippingPoint)) {
          // removing tipping point
          tokenInfo.tippingPoint = undefined;
          // update stop loss
          tokenInfo.stopLoss = calculateStopLoss(tick.ltp, tokenInfo.direction);
        }
      }
    } else if ((tick.ltp < tokenInfo.ltp && tokenInfo.direction > 0)
      || (tick.ltp > tokenInfo.ltp && tokenInfo.direction < 0)) {
      // Check if tipping point is set
      if (typeof tokenInfo.tippingPoint === 'undefined') {
        // Set the tipping point to last LTP
        tokenInfo.tippingPoint = tokenInfo.ltp;
      } else {
        // Check if price is beyond stop loss in the opposite direction
        if ((tick.ltp > tokenInfo.stopLoss && tokenInfo.direction < 0)
          || (tick.ltp < tokenInfo.stopLoss && tokenInfo.direction > 0)) {
          // Remove tipping point
          tokenInfo.tippingPoint = undefined;
          // Exit the position
          const tradeType = tokenInfo.direction > 0 ? 'SELL' : 'BUY';
          const orderToken = {
            ...tokenInfo,
            ltp: tick.ltp
          };
          executeOrder(orderToken, tradeType);
          calculateFinances(finances, orderToken, tradeType);
          // Execute reverse trade
          executeOrder(orderToken, tradeType);
          calculateFinances(finances, orderToken, tradeType);
          // Set new direction
          tokenInfo.direction = tokenInfo.direction > 0 ? -1 : 1;
          // Calculate new stop loss
          tokenInfo.stopLoss = calculateStopLoss(tick.ltp, tokenInfo.direction);
        }
      }
    }
    // Update LTP for token
    tokenInfo.ltp = tick.ltp;
    logStockState(tokenInfo);
  });
}

exports.initiateTrading = initiateTrading;
exports.listenerTickCallback = onTick;
