const imessage = require('osa-imessage')
const fs = require('fs')


async function chatScrape(linkPath, logPath, completedPath, missedLinkPath, missedLogPath, chatID, dateFromChatLinks)
{
    var chatLogger = fs.createWriteStream(logPath, {
        flags: 'a'})// 'a' means appending (old data will be preserved)
    var writeChatLog = (line) => chatLogger.write(`\n${line}`);

    var linkScrape = fs.createWriteStream(linkPath, {
        flags: 'a'}) 
    var writeLink = (line) => linkScrape.write(`\n${line}`);

    var missedChatLogger = fs.createWriteStream(missedLogPath, {
        flags: 'a' })
    var writeMissedChatLog = (line) => missedChatLogger.write(`\n${line}`);

    var missedChatLinks = fs.createWriteStream(missedLinkPath, {
        flags: 'a'})
    var writeMissedChatLinks = (line) => missedChatLinks.write(`\n${line}`);

   // try {    
    let chats = imessage.getRecentChats(100, chatID, dateFromChatLinks);
   // } catch {
      //  console.log("Error retreiving chat links")
  //  }
    
    for (let i = 0; i < chats.length; i++)//loop through ${limit} chats
    {
                let fullDate = imessage.fromAppleTime(chats[i].date)
                let shortDate = fullDate.toLocaleString('en-US', {
                    timeZone: 'America/New_York',
                    year: "2-digit",
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    /* timeStyle: 'full'*/ })
        if (checkIfContainsSync(completedPath, chats[i].text) == false 
                && checkIfContainsSync(linkPath, chats[i].text) == false
                && chats[i].text != anamoly1 && chats[i].text != anamoly2) //if link[i] is not in completedLog AND not pulled from chat -if not loaded for next run (in chatScrapeLinks.txt)
            {
                
                writeLink(chats[i].text);  //write link to chatScrapeLinks.txt
                //console.log(chats[i].text)
                writeMissedChatLinks(`${chats[i].text}`);  //just a second source for troubleshooting, meant to be deleted everytime?
                console.log(`${shortDate}, ${chats[i].text}, ${chats[i].handle}`)
                //console.log(chats[i].text)

            }
            if (checkIfContainsSync(logPath, chats[i].text) ==false && chats[i].text != anamoly1 && chats[i].text != anamoly2 && chats[i].text != null ) //if chatlog doesnt contain the link or these two wierd texts that keep popping up -quick fix
            {
                writeChatLog(`${shortDate}, ${chats[i].text}, ${chats[i].handle}`); //if not not logged, log it (chatLog.txt)
                writeMissedChatLog(`${shortDate}, ${chats[i].text}, ${chats[i].handle}`); //if not not logged, log it (missedChatLog.txt)
                
            } 
    }// end of loop

    function checkIfContainsSync(filename, str) {

        let contents = fs.readFileSync(filename, 'utf-8');
        const result = contents.includes(str);
        return result;
    }



}


module.exports.chatScrape = chatScrape;