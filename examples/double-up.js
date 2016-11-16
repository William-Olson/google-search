#!/usr/bin/env node

const GoogleSearch = require('../lib/google-search');

// get environment variables
const KEY = process.env.GOOG_API_KEY;
const CX = process.env.GOOG_API_CX;

// create a searcher
const googleSearch = new GoogleSearch({
  key: KEY,
  cx: CX
});

// ------ Execute Query -------

getPages(
  'kung fu',
  { limit: 20, offset: 0 },
  hits => logItems(hits)
);

// ----------------------------

/**
 * retrieves from offset up to (offset + limit) recursively
 * and calls callback with results when done
 */
function getPages(q, { limit=1, offset=0, next=0 }, cb, results=[])
{
  // determine how many are left to fetch
  const leftToRetrieve = ((limit + offset) - (offset + next)) < 1 ?
                  10 : Math.abs((limit + offset) - (offset + next));

  const query = {
   q,
   num: limit < 10 ? limit :
      (leftToRetrieve < 10) ? leftToRetrieve : 10,
   start: (offset + next) === 0 ? (offset + next + 1) : (offset + next)
  };
  const last = (query.start + 10) >= (offset + limit);

  googleSearch.build(query, (err, r) => {
   checkError(err);
   results = results.concat(r.items.map((h, i) => {
     return Object.assign({}, h, { numIndex: (query.start + i) });
   }));

   if (last) {
     return cb(results);
   }

   return getPages(q, { limit, offset, next: next + 10 }, cb, results);
  });
}

// simple helpers

function checkError(err)
{
  if(err) {
    throw err;
  }
}

function logItems(items)
{
 items.forEach((h, i) =>
   console.log(
     `${h.numIndex}. ${h.title}`,
     `\n${h.snippet}`,
     `\n${h.link}\n\n`
   ));
}

