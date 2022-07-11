const imessage = require('osa-imessage')
const fs = require('fs')


var logger = fs.createWriteStream('file.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
var writeLine = (line) => logger.write(`\n${line}`);        // writes new link to new line in txt file


imessage.listen().on("message", (msg) => {
    console.log(msg)

    // if (msg.group.indexOf("chat901667219280557236") !== -1) {

         //if (msg.text.indexOf("tiktok.com") !== -1) {
            writeLine(msg.text);

         //}
    // }
  });

  