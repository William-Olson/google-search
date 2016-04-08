#!/usr/bin/env node
'use strict';


var GoogleSearch = require('../lib/google-search');

// get environment variables
const KEY = process.env.GOOG_API_KEY;
const CX = process.env.GOOG_API_CX;

// create a searcher
var googleSearch = new GoogleSearch({
  key: KEY,
  cx: CX
});


 // perform a search with 20 results
 search('kung fu', function (err, resp) {
   if(err) console.error(err);
   else {
    console.dir(resp);
    console.info(resp.items.length + ' total');
   }
 });



function search(term, cb) {

  // object used to build query
  let req = {
    q: term,
    num: 10, //max is 10
    start: 1
  };

  // send query
  googleSearch.build(req, (err1, res1) => {
    if(err1) cb(err1);
      if(res1.searchInformation && res1.searchInformation.totalResults > 10) {

        //perform the nextPage query
        req.start = 11;
        googleSearch.build(req, (err2, res2) => {
          if(err2) cb(err2);

          //concat results and return them
          if(res2.items)
            res1.items = res1.items.concat(res2.items);

          //return response
          cb(null, res1);
        });

      } else{
        cb(null, res1);
      }

  });
};