function getQueryParamsFromUrl (url) {
  const params = {};
  const queryString = url.slice(url.indexOf('?') + 1);
  queryString
    .split('&')
    .map(param => param.split('='))
    .forEach(param => {
      params[param[0]] = param[1]
    });
  return params;
}

function getInstrumentsObject (instrumentCSV) {
  const instObj = {};
  instrumentCSV
    .split('\n')
    .filter(line => line)
    .forEach(line => {
      const lineItems = line.split(',');
      instObj[lineItems[0]] = lineItems[2];
    });
  return instObj;
}

function getMarginMultiplierForInstrument (tokenIds, instrumentObject, equityMargins) {
  const marginMultipliers = {};
  const symbolToToken = {};
  tokenIds.forEach(tokenId => {
    symbolToToken[instrumentObject[tokenId]] = tokenId
  });
  const instrumentsToFetch = tokenIds.map(tokenId => instrumentObject[tokenId]);
  const filteredEquityMargins = equityMargins.filter(margin => instrumentsToFetch.indexOf(margin.tradingsymbol) > -1);
  filteredEquityMargins.forEach(margin => {
    marginMultipliers[symbolToToken[margin.tradingsymbol]] = {
      symbol: margin.tradingsymbol,
      misMultiplier: margin.mis_multiplier
    };
  });

  return marginMultipliers;
}

exports.getQueryParamsFromUrl = getQueryParamsFromUrl;
exports.getInstrumentsObject = getInstrumentsObject;
exports.getMarginMultiplierForInstrument = getMarginMultiplierForInstrument;
