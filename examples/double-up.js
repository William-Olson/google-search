#!/usr/bin/env node
const GoogleSearch = require('../lib/google-search');

// create a searcher
const searcher = new GoogleSearch({
  key: process.env.GOOG_API_KEY,
  cx: process.env.GOOG_API_CX
});

// ------ Execute Query with 20 Results -------
searcher.fetch('foo bar baz', { limit: 20 }, (err, items) => {
  if (err) {
    throw err;
  }

  items.forEach(({ numIndex, title, snippet, link }) =>
    console.log(`${numIndex}. ${title}\n${snippet}\n${link}\n\n`));
  console.log(`${items.length} items total`);
});
