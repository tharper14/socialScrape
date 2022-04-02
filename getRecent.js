const imessage = require('osa-imessage')
const fs = require('fs')

let liveChatLinks = [];

var logger = fs.createWriteStream('log.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
var writeLine = (line) => logger.write(`\n${line}`);


imessage.listen().on("message", (msg) => {
    console.log(msg)
    writeLine(msg.text);

    // if (msg.group.indexOf("chat901667219280557236") !== -1) {

        // if (msg.text.indexOf("tiktok.com") !== -1) {
        //     writeLine(msg.text);

        // }
    // }
  });





    



// imessage.listen().on("message", (msg) => {
//     console.log(msg.text, '\n', msg.handle, '\n', msg.date)
    
//     fs.writeFile('./liveChat.txt', msg.text);
//   });

//   imessage.getRecentChats(10) // Defaults to 10