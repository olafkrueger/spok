
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
  tagLists.forEach(item => {
    tagListsMap.set(parseInt(item.uid), item)
  });
  //console.log(tagListsMap)


  //console.log(games)
  
  let pool;
  let tagNames;
  games.forEach(item => {
    pool = poolsMap.get(item.poolid);
    item.poolTitle = pool.title;

    //console.log(item.kategorie1.split(","));
    item.kategorie1TagNames = resolveTagNames(item.kategorie1, tagListsMap);
    item.kategorie2TagNames = resolveTagNames(item.kategorie2, tagListsMap);
    item.kategorie3TagNames = resolveTagNames(item.kategorie3, tagListsMap);
    item.kategorie4TagNames = resolveTagNames(item.kategorie4, tagListsMap);
    item.kategorie5TagNames = resolveTagNames(item.kategorie5, tagListsMap);
    item.kategorie6TagNames = resolveTagNames(item.kategorie6, tagListsMap);
    item.kategorie7TagNames = resolveTagNames(item.kategorie7, tagListsMap);
    item.kategorie8TagNames = resolveTagNames(item.kategorie8, tagListsMap);
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

function resolveTagNames(tagUidsAsString, tagListsMap) {
  return !tagUidsAsString?[]:tagUidsAsString.split(",").map(uid => {
      return tagListsMap.get(parseInt(uid)) === undefined ? "undefined" : tagListsMap.get(parseInt(uid)).listeneintrag });
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