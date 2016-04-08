var https = require('https'),
    url = require('url');

var GoogleSearch = function(options) {
  if (!options) options = {};
    options.format = options.format ||  'json';
    options.headers = options.headers ||  {'User-Agent': 'GoogleSearch'};
    options.host = options.host ||  'www.googleapis.com';
    options.port = options.port ||  443;
    options.path = options.path ||  '/customsearch/v1';
    options.alt = options.alt ||  'json';

  this.config = {
    key: options.key,
    format: options.format,
    headers: options.headers,
    host: options.host,
    port: options.port,
    path: options.path,
    cx: options.cx
  };
  return this;
};

GoogleSearch.prototype.build = function(options, callback) {
  this._doRequest(this._generateUrl(options), callback); 
};

GoogleSearch.prototype._generateUrl = function(query) {
  query.key = this.config.key;
  query.cx = this.config.cx;
  var pathname = this.config.path;
  var urlFormatted = url.format({
    protocol: "https",
    hostname: this.config.host,
    pathname: pathname,
    query: query
  });
  //console.log(urlFormatted);
  return url.parse(urlFormatted);
};

GoogleSearch.prototype._doRequest = function(requestQuery, callback) {
  https.get(requestQuery, function(res) {
    var data = [];
    // for (var item in res.headers) {
    //   console.log(item + ":" + res.headers[item]);
    // }
    // console.info(res.headers.date);
    // console.info('\tGoogleSearch: ', requestQuery.path); //.split('&num')[0]);

    res.on('data', function(chunk) {data.push(chunk);})
      .on('end', function() {
        var dataBuffer = data.join('').trim();
        var result;
        try {
          result = JSON.parse(dataBuffer);
        } catch(e) {
          result = {'status_code': 500, 'status_text': 'JSON parse failed'};
        }
        callback(null, result);
      }).
      on('error', function(e) {
        callback(e);
      });
  });
};

module.exports = GoogleSearch;
