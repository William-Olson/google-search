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
   * retrieves from offset up to (offset + limit) recursively
   * and calls callback with results when done
   */
  fetch(q, options, cb, results=[])
  {

    // allow 2 param calls
    if (!cb) {
      cb = options;
      options = { limit: 10, offset: 1, _next: 0 };
    }

    // pluck out vars from options
    let { limit=1, offset=1, _next=0 } = options;

    // min start of 1
    if (offset <= 0) {
      offset = 1;
    }

    // determine how many are left to fetch
    const leftToFetch = (limit + offset) - (offset + _next);
    if (leftToFetch < 1) {
      return cb(null, results);
    }

    // setup the query object
    const query = {
     q,
     num: limit < 10 ? limit : leftToFetch < 10 ? leftToFetch : 10,
     start: offset + _next
    };

    // determine if this is the last fetch
    const done = (query.start + 10) >= (offset + limit);

    this.build(query, (err, resp) => {

      if (err) {
        return cb(err);
      }

      if (!resp.items) {
        return cb(null, results);
      }

      results = results.concat(resp.items.map((h, i) => {
        return Object.assign({}, h, { numIndex: (query.start + i) });
      }));

      if (done) {
        return cb(null, results);
      }

      return this.fetch(q, { limit, offset, _next: _next + 10 }, cb, results);
    });

    return null;
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
