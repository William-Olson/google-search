const https = require('https');
const url = require('url');

const DEFAULTS = {
  format: 'json',
  headers: { 'User-Agent': 'GoogleSearch' },
  host: 'www.googleapis.com',
  port: 443,
  path: '/customsearch/v1',
  alt: 'json'
};

module.exports = class GoogleSearch {

  constructor(options={})
  {
    this._config = Object.assign({}, DEFAULTS, options);
  }

  /**
   * Builds a proper request and queries google's search
   * api. Callback is in the form: callback(err, resp)
   */
  build(query, callback)
  {
    const data = [];
    https.get(this._generateUrl(query), resp =>
      resp
        .on('data', chunk => data.push(chunk))
        .on('error', err => callback(err))
        .on('end', () => this._processPayload(data, callback))
    );
  }

  /**
   * Formats, parses, and returns a proper url using given
   * query options q, and cx/key api credentials
   */
  _generateUrl(q)
  {
    const query = Object.assign({}, q, {
      key: this._config.key,
      cx: this._config.cx
    });

    return url.parse(url.format({
      protocol: 'https',
      hostname: this._config.host,
      pathname: this._config.path,
      query
    }));
  }

  /**
   * Handles parsing of data chunks collected after
   * the request connection ends. Invokes callback
   * with search results or helpful failure message
   */
  _processPayload(chunkArray, callback)
  {
    const payload = chunkArray.join('').trim();
    try {
      const result = JSON.parse(payload);
      callback(null, result);
    }
    catch (e) {
      callback(null, {
        status_code: 500,
        status_text: 'JSON.parse failed'
      });
    }
  }
};
