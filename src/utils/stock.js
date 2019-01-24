const { logger } = require('./logger');

function calculateStopLoss (ltp, direction = 1) {
  const percentStopLoss = ltp * 0.001;
  const idealStopLoss = Math.max(percentStopLoss, 0.05);
  return direction > 0 ? ltp - idealStopLoss : ltp + idealStopLoss;
}

function executeOrder (token, type) {
  const { symbol, noOfStocks, ltp } = token;
  logger.log(`Execute ${type} on ${symbol} for ${noOfStocks} shares at Rs. ${ltp} / share`);
}

function logStockState (token) {
  const { symbol, ltp, stopLoss } = token;
  logger.log(`${symbol} last traded at ${ltp}. Current stop loss at ${stopLoss}`);
}

function calculateFinances (finances, token, type) {
  const expense = token.noOfStocks * token.ltp;
  const { amount, cash } = finances;
  const { initial, current } = cash;
  const { transactions, sell } = amount;
  finances.cash.current = type === 'BUY'
    ? normalizePrice(current - normalizePrice(expense / token.multiplier))
    : normalizePrice(current + normalizePrice(expense / token.multiplier));
  finances.cash.gross = normalizePrice(finances.cash.current - initial);
  finances.amount.transactions = normalizePrice(transactions + expense);
  if (type === 'SELL') {
    finances.amount.sell = normalizePrice(sell + expense);
  }
  finances.charges.brokerage = Math.min(normalizePrice(0.0001 * finances.amount.transactions), 20);
  finances.charges.stt = normalizePrice(finances.amount.sell * 0.00025);
  finances.charges.transactionCharges = normalizePrice(finances.amount.transactions * 0.0000325);
  finances.charges.gst = normalizePrice(0.18 * (finances.charges.brokerage + finances.charges.transactionCharges));
  finances.charges.stampCharges = normalizePrice(0.00002 * finances.amount.transactions);
  const { brokerage, stt, transactionCharges, gst, stampCharges } = finances.charges;
  finances.charges.total = normalizePrice(brokerage + stt + transactionCharges + gst + stampCharges);
  finances.net = normalizePrice(finances.cash.gross - finances.charges.total);
  logger.log(JSON.stringify(finances));
}

function normalizePrice (price) {
  return parseFloat(price.toFixed(2));
}

exports.calculateStopLoss = calculateStopLoss;
exports.executeOrder = executeOrder;
exports.logStockState = logStockState;
exports.calculateFinances = calculateFinances;
