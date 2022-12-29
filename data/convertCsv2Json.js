

async function run() {
    console.log("Load csv and convert to JSON...")
    const csv = require("csvtojson");
    console.log("still here");
    let  gamesJSON = await csv({
        noheader: true,
    }).fromFile("/home/olaf/github/spok/data/games -100.csv");

var striptags = require('striptags');



gamesJSON = striptags(JSON.stringify(gamesJSON));

    console.log("still here");
  
    toFile(
    JSON.parse(gamesJSON),
    "/home/olaf/github/spok/data/games-100.json"
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