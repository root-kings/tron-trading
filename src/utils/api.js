const fetch = require('node-fetch');

const baseURL = 'https://api.kite.trade';

let _get = () => {};
let _post = () => {};

function generateGetAndPostRequests (apiKey, accessToken) {
  _get = async (url, config = {}) => {
    url = url.startsWith('http://') || url.startsWith('https://') ? url : baseURL + url;
    return await fetch(url, {
      method: 'get',
      headers: {
        'X-Kite-Version': 3,
        'Authorization': `token ${apiKey}:${accessToken}`
      },
      ...config
    });
  };

  _post = async (url, config = {}) => {
    url = url.startsWith('http://') || url.startsWith('https://') ? url : baseURL + url;
    const {data, ...requestConfig} = config;
    const body = [];
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        body.push(key + '=' + data[key]);
      }
    }
    return await fetch(url, {
      method: 'post',
      body: body.join('&'),
      headers: {
        'X-Kite-Version': 3,
        'Authorization': `token ${apiKey}:${accessToken}`
      },
      ...requestConfig
    });
  };
}

const get = (url, config) => _get(url, config);
const post = (url, config) => _post(url, config);

exports.get = get;
exports.post = post;
exports.generateGetAndPostRequests = generateGetAndPostRequests;
