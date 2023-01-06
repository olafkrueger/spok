
let games = require("./games.json");
let pools = require("./pools.json");
let tagLists = require("./taglists.json");

async function run() {
  console.log("Load and join data...")

  // Create Maps from data
  const poolsMap = new Map();
  pools.forEach(item => {
    poolsMap.set(item.poolid, item)
  });
  const tagListsMap = new Map();
  const tagListsArray = [];
  tagLists.forEach(item => {
    tagListsMap.set(parseInt(item.uid), item)
    tagListsArray[parseInt(item.uid)] = item;
  });

  //console.log(tagListsMap)


  //console.log(games)
  
  let pool;
  let tagNames;
  games.forEach(item => {
    pool = poolsMap.get(item.poolid);
    item.poolTitle = pool.title;

    tagNames = item.kategorie1.split(",").map(uid => {
      console.log(uid);
      console.log(tagListsArray[parseInt(uid)]);
      return tagListsMap.get(parseInt(uid)) === undefined ? "undefined" : tagListsMap.get(parseInt(uid)).listeneintrag;
      //return tagListsArray[parseInt(uid)]?tagListsArray[parseInt(uid)].listeneintrag:"false";
      //return foo;
      
    });
    //console.log(item.kategorie1.split(","));
    item.kategorie1Name = tagNames;
  });


  /*
  var striptags = require('striptags');
  games = striptags(JSON.stringify(games));
  */ 

  toFile(
    games,
    "/home/olaf/github/spok/data/gamesJoined.json"
  );
}

function toFile(json, filename) {
  const fs = require("fs");
  // write JSON string to a file
  fs.writeFile(filename, JSON.stringify(json), (err) => {
    if (err) {
      throw err;
    }
    console.log("JSON data is saved to " + filename);
  });
}





run();