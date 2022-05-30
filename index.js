// ░██████╗░█████╗░░█████╗░██╗░█████╗░██╗░░░░░░░░░██████╗░█████╗░██████╗░░█████╗░██████╗░███████╗
// ██╔════╝██╔══██╗██╔══██╗██║██╔══██╗██║░░░░░░░░██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝
// ╚█████╗░██║░░██║██║░░╚═╝██║███████║██║░░░░░░░░╚█████╗░██║░░╚═╝██████╔╝███████║██████╔╝█████╗░░
// ░╚═══██╗██║░░██║██║░░██╗██║██╔══██║██║░░░░░░░░░╚═══██╗██║░░██╗██╔══██╗██╔══██║██╔═══╝░██╔══╝░░
// ██████╔╝╚█████╔╝╚█████╔╝██║██║░░██║███████╗██╗██████╔╝╚█████╔╝██║░░██║██║░░██║██║░░░░░███████╗
// ╚═════╝░░╚════╝░░╚════╝░╚═╝╚═╝░░╚═╝╚══════╝╚═╝╚═════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░░░░╚══════╝

// ░█─░█ █▀▀█ █▀▀█ █▀▀█ █▀▀ █▀▀█ █▀▀ ░█─░█ █▀▀█ █▀▀ █─█ █▀▀ 
// ░█▀▀█ █▄▄█ █▄▄▀ █──█ █▀▀ █▄▄▀ ▀▀█ ░█▀▀█ █▄▄█ █── █▀▄ ▀▀█ 
// ░█─░█ ▀──▀ ▀─▀▀ █▀▀▀ ▀▀▀ ▀─▀▀ ▀▀▀ ░█─░█ ▀──▀ ▀▀▀ ▀─▀ ▀▀▀🅛🅛🅒
//_______________________________________________________________________________________________





const yourUsername = 'tylerharper';
//---------------------------------------------------------------------
//-------------------------SET DOWNLOAD FILE LOCATION HERE-------------
const downloadFolder = './downloads';    
//---------------------------------------------------------------------
//-------------------------SET ENCODING FILE LOCATION HERE-------------
const encodedFolder ='./encodedDownloadsReady/' 
//---------------------------------------------------------------------
//-------------------------SET MASTER LOG LOCATION HERE----------------
const masterLogPath =  `/Users/${yourUsername}/Social Wake Dropbox/Social Scrape/testLog.txt`
//---------------------------------------------------------------------
//-------------------------SET CHATSCRAPE LOCATION HERE----------------
const chatScrapePath =  `/Users/${yourUsername}/Social Wake Dropbox/Social Scrape/chatScrape.txt`
//---------------------------------------------------------------------
//-------------------------SET LOCAL LINKS LOCATION HERE---------------
const linksList = "./file.txt"
//---------------------------------------------------------------------

let addChatLinks = true; //TURN ON/OFF adding ChatScrape Links to list -> false does not check/add links from chatScrape.txt
let checkLog = true;     //TURN ON/OFF checking against successLog -> false will download videos no matter what
let addLog = true;       //TURN ON/OFF adding successful downloads to successLog -> false will not keep record of successful links

//initializing all dependency packages
const tiktok = require('tiktok-scraper-without-watermark')  
const Downloader = require("nodejs-file-downloader")        
let unshortener = require("unshorten.it");
let fs = require('fs');
const {readFileSync, promises: fsPromises} = require('fs');
const instagram = require('user-instagram');
const hbjs = require('handbrake-js')
const FileProcessorHH = require('./fileProcessorHH');
var colors = require('colors');

//let completedDownloads = []
let failedShorten = []
let failedStrip = []
let failedDownload = []
let failedEncode = []
let duplicateLinks = []
let failedLinks = []
let failedRetry = []
let successRetry = []
let chatScrapeArray= []
let invalidLinks = []
let url = ''
let strippedurl = ''
let username = ''
let downloadFlag = false;
let stripFlag = false;
let completeFileName = ''
// let text = fs.readFileSync("./file.txt", 'utf-8');                                         //convert .txt file to array with each line
// let textByLine = text.split('\n')                                                          //'textByLine' is array with each link from text file
let duplicate = false;

var failedWrite = fs.createWriteStream('./failedLinks.txt', {                              //create write stream and write function for failed links, a=append
    flags: 'a'})
var writeFailed = (line) => failedWrite.write(`\n${line}`);                                

var successLog = fs.createWriteStream(masterLogPath, {
    flags: 'a'})
var writeSuccessLog = (line) => successLog.write(`\n${line}`);




//---------------------------------------------------------------------
//---------------------------------MAIN LOOP---------------------------


//add chat links to file.txt, to turn off, set addChatLinks to false;
if (addChatLinks){
    console.log("Getting Chat Links...\n".blue)
    let chatScrapeArrayRaw = textToArray(chatScrapePath)

    // console.log("Raw ChatScrapes")
    // console.log(chatScrapeArrayRaw)
    var appendLinks = fs.createWriteStream(linksList, {
        flags: 'a'})
    var appendFromChat = (line) => appendLinks.write(`\n${line}`);

    for (let i = 0; i < chatScrapeArrayRaw.length; i++) {

        let chatLink = chatScrapeArrayRaw[i];
        //if link #i in chatScrapeArrayRaw does not exist in file.txt or success log, or already in chatScrapeArray, add to chatScrapeArray and add to file.txt
        if(checkIfContainsSync(linksList, chatLink)==false && checkIfContainsSync(masterLogPath, chatLink)==false && chatScrapeArray.includes(chatScrapeArrayRaw[i])==false){
            chatScrapeArray.push(chatLink)
            appendFromChat(chatLink)
            console.log(`Link #${i+1} from chatScrape has been added to ${linksList}`);
        }
        if(checkIfContainsSync(masterLogPath, chatLink)==true){
            console.log(`Chat Link #${i+1} is already downlownloaded`)
        } 
        if(checkIfContainsSync(linksList, chatLink)==true && checkIfContainsSync(masterLogPath, chatLink)==false){
            console.log(`Chat Link #${i+1} is already in ${linksList}`)
        }  
    }
    // console.log("Filtered ChatScrapes")
    // console.log(chatScrapeArray)

   
    
}

stripDownload(linksList);


//---------------------------------------------------------------------
//-------------------------------MAIN LOOP END-------------------------



//MAIN FUNCTION
async function stripDownload(linksPath) { 
    
    let fileByLine = textToArray(linksPath)
    
    // let textByLine = textToArray(linksPath)
    let textByLine = fileByLine.concat(chatScrapeArray)
    //console.log(textByLine)
    //console.log(textByLine.length)

    //Loop thru text file line by line
    for (let i = 1; i < textByLine.length+1; i++) {    

        
        url = textByLine[i-1] 
       
        //console.log(masterLogPath)
        console.log("************************************")
    //    if(url == ''){
    //     duplicate=false;
    //    }
       if( checkLog==true && checkIfContainsSync(masterLogPath, url) || url == '') {
           duplicate = true;
       }
       else {
        console.log(`          File #${i} starting          `.brightBlue.underline)  
        duplicate = false;}

       
      //TIKTOK FULL DOWNLOADER
        if (url.indexOf("tiktok") !== -1 && duplicate === false) {  //else if; if tiktok link and if link has not been downloaded before

          //USERNAME EXTRACTOR(TT)_____________________________________________________________Get Username for filenaming
                if (url.indexOf("https://www.tiktok.com/@") !== -1){                           //regular link (not vm)
                    let short = url.substring(24)                                              //strip the first 24 characters off static link (https://www.tiktok.com.@)
                    username = short.substring(0, short.indexOf('/'))                          //strip everything after the first /, set as username variable
                    process.stdout.write("Username #" + i + " PULLED  ".green) 
                }
                else if (url.indexOf("https://vm.tiktok.com") !== -1){                                                                         // else = mobile link (vm.tiktok)
                    try {
                        let long_url = await unshortener(url)                                  //unshorten mobile short link to get username
                        let short = long_url.substring(24)                                     //strip the first 24 characters off static link (https://www.tiktok.com.@)
                        username = short.substring(0, short.indexOf('/'))                      //strip everything after the first /, set as username variable
                        //console.log(username)
                        process.stdout.write("Username #" + i + " PULLED  ".green) 
                    } catch {
                            console.log("URL #" + i + "could not be shortened".red)                //throw error message if shorten fails
                            let failedLink = url.substring(22)
                            let failedClip = failedLink.substring(0, failedLink.indexOf('/')); // naming clip link id alerting to find username
                            username = "RENAMETHISCLIP_" + failedClip
                            failedShorten.push(i);}     
                }
                else if (url.indexOf("https://www.tiktok.com/t/") !== -1){
                    try {
                        let long_url = await unshortener(url)                                  //unshorten mobile short link to get username
                        //console.log(long_url)
                        let short = long_url.substring(24)                                     //strip the first 24 characters off static link (https://www.tiktok.com.@)
                        username = short.substring(0, short.indexOf('/'))                      //strip everything after the first /, set as username variable
                        process.stdout.write("Username #" + i + " PULLED  ".green) 
                    } catch {
                            console.log("URL #" + i + "could not be shortened".red)                //throw error message if shorten fails
                            let failedLink = url.substring(22)
                            let failedClip = failedLink.substring(0, failedLink.indexOf('/')); // naming clip link id alerting to find username
                            username = "RENAMETHISCLIP_" + failedClip
                            failedShorten.push(i);}     
                }
                else {
                    username = "undefined"
                }


          //FileProcessor____________________________________________________________________
                var fileProcessorHH = new FileProcessorHH({fileName: username + '.mp4', path: downloadFolder});
                try{
                        completeFileName = await fileProcessorHH.getAvailableFileName();
                     console.log(completeFileName)
                } catch {
                        console.log("Failed File Processing on download #".red + i )}

          //TIKTOK STRIPPER____________________________________________________________________acquires raw video url from TikTok
                try {
                    strippedurl = await tiktok.tiktokdownload(url)                             //run stripping function that returns stripped url link
                    stripFlag = true;
                    console.log("Stripped #" + i + " SUCCESS".green)         
                } catch (e) {   
                        console.log("Stripped #" +i+ " FAILED!!".red)
                        console.log("Download #" +i+ " ABORTED!!".red)
                        console.log("Encoding #" +i+ " ABORTED!!".red)
                        console.log("************************************❌\n".brightRed)                   //error is thrown in case of network errors, or status codes of 400 and above.
                        //console.log(e)                                                         //throw error if failed stripped
                        failedStrip.push(i)
                        stripFlag = false
                        
                        if(checkIfContainsSync('./failedLinks.txt', url)==false) {
                            writeFailed(url)  
                        }
                        let failedInstance = {link:url, cfn:completeFileName, number:i}
                            failedLinks.push(failedInstance);

                    }                                                        

          //DOWNLOADER_________________________________________________________________________download video from stripped video URL
                if (stripFlag==true){
                let downloader = new Downloader({                                              //set new instance of Downloader with new parameters
                    url: strippedurl,                                                          //url of stripped video created from tiktokdownload()
                    directory: downloadFolder,                                                 //where to download clips
                    fileName: completeFileName,                                               //duplicate filenames get "-#", see FileProcess.js to edit
                    maxAttempts: 3});                                                          // retry failed downloads 3 times until it aborts
                
                try {
                    await downloader.download();                                               //Downloader.download() returns a promise =downloads video
                    console.log("Download #" + i +" COMPLETE".green)
                    //completedDownloads.push(fileName);
                    downloadFlag = true;
                    //writeSuccessLog(url);

                } catch(error){
                            if(checkIfContainsSync('./failedLinks.txt', url)==false) {writeFailed(url)}
                           // failedLinks.push(url)  //for failed retry
                            failedDownload.push(i) //for error log
                            let failedInstance = {link:url, cfn:completeFileName, number:i}
                            failedLinks.push(failedInstance);
                            //console.log(failedLinks)
                           
                            downloadFlag = false;  //aborts encoding attempt
                            // console.log("************************************".brightRed)
                            console.log("Download #" +i+ " FAILED!!".red/*,error*/)
                            console.log("Encoding #" +i+ " ABORTED!!".red)
                            console.log("************************************❌\n".brightRed)
                        }                                             //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.

                }
    
          //HANDBRAKE ENCODING_________________________________________________________________encoded freshly downloaded video into different folder
            if (downloadFlag === true)  {
                    let options = {
                        input: `${downloadFolder}/${completeFileName}`,
                        output: `${encodedFolder}/${completeFileName}`,
                        preset: 'Fast 1080p30'};

                    try  {
                        let result = await hbjs.run(options)
                        console.log("Encoding #" + i + " COMPLETE\n************************************✅ \n".brightGreen)
                        //checkAndAdd(masterLogPath, url)
                        downloadFlag = false;
                        //console.log(result)
                        if(addLog)
                        {
                        writeSuccessLog(url);}

                    }  catch {
                        console.log("Encoding #" +i+ " FAILED!!".red)
                            failedEncode.push(i)} 
            }                                              
        }
        //Duplicate Link Catcher
        else {
            if (url.length < 2){
                //console.log("Line #" + i + " is blank")
                }
            else if (duplicate === true){
                //console.log('\x1b[33m%s\x1b[0m',"************************************")
                console.log(colors.yellow("Link #" + i + " is a DUPLICATE \n*************SKIPPED*************** ⚠️⚠️\n"))
                duplicateLinks.push(i);
            }
            
            else{
            console.log("Link #" + i + " is not a valid link\n".red)
            invalidLinks.push(i)
            if(checkIfContainsSync('./failedLinks.txt', url)==false) {writeFailed(url)};
            }
        }
    }//end of looping thru links in text file
    console.log("____________________________________"+"\n            END OF LIST             \n".italic)
    //console.log(failedLinks)
    //console.log(failedLinks.length)



    //FAILED RETRY _________________________________________________________________
    if (failedLinks.length != 0){
      
        //console.log(`WARNING:`.red+` Some Links failed..`);
        console.log(`RETRYING FAILED DOWNLOADS NOW`.brightMagenta)
        console.log("************************************".brightMagenta+"\n************************************");
        for (let j = 0; j < failedLinks.length; j++) {                                        //loop through array with links
            console.log(`_____Retry #${failedLinks[j].number} starting_____`.brightBlue)
            url = failedLinks[j].link
            //console.log(url)

          //FileProcessor Retry____________________________________________________________________
           var fileProcessorHH = new FileProcessorHH({fileName: username + '.mp4', path: downloadFolder});
              try{
                 completeFileName = await fileProcessorHH.getAvailableFileName();
              // console.log(completeFileName)
              } catch {
                  console.log(colors.red("Failed File Processing on link #" + failedLinks[j].number))
                }
                 
          //TIKTOK STRIPPER Retry____________________________________________________________________acquires raw video url from TikTok
                try {
                    strippedurl = await tiktok.tiktokdownload(url)                             //run stripping function that returns stripped url link
                    stripFlag = true;
                    console.log("Stripped #" + failedLinks[j].number + " SUCCESS".green)           
                } catch (e) {   
                        console.log("Stripped #" +failedLinks[j].number+ " FAILED!!".red)
                        console.log("Download #" +failedLinks[j].number+ " ABORTED!!".red)
                        console.log("Encoding #" +failedLinks[j].number+ " ABORTED!!".red)
                        console.log("************************************❌\n".brightRed)   

                        failedRetry.push(failedLinks[j].number)
                        stripFlag = false
                    }                                                        

          //DOWNLOADER RETRY_________________________________________________________________________download video from stripped video URL
                if (stripFlag==true){
                let downloader = new Downloader({                                              //set new instance of Downloader with new parameters
                    url: strippedurl,                                                          //url of stripped video created from tiktokdownload()
                    directory: downloadFolder,                                                 //where to download clips
                    fileName: completeFileName,                                               //duplicate filenames get "-#", see FileProcess.js to edit
                    maxAttempts: 3});                                                          // retry failed downloads 3 times until it aborts
                
                try {
                    await downloader.download();                                               //Downloader.download() returns a promise =downloads video
                    console.log("Download #" + failedLinks[j].number +" COMPLETE".green)
                    //completedDownloads.push(fileName);
                    downloadFlag = true;
                    //writeSuccessLog(url);

                } catch(error){
                            if(checkIfContainsSync('./failedLinks.txt', url)==false) {writeFailed(url)}
                            failedRetry.push(failedLinks[j].number)
                            
                            console.log("Download #" +failedLinks[j].number+ " FAILED!!".red/*,error*/)             //error is thrown in case of network errors, or status codes of 400 and above.
                            console.log("Encoding #" +failedLinks[j].number+ " ABORTED!!".red) 
                            console.log("************************************❌\n".brightRed)
                            
                            downloadFlag = false;}                                             //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
                }
    
          //HANDBRAKE ENCODING RETRY_________________________________________________________________encoded freshly downloaded video into different folder
            if (downloadFlag === true)  {
                    let options = {
                        input: `${downloadFolder}/${completeFileName}`,
                        output: `${encodedFolder}/${completeFileName}`,
                        preset: 'Fast 1080p30'};

                    try  {
                        let result = await hbjs.run(options)
                        console.log("Encoding #" + failedLinks[j].number + " COMPLETE\n************************************".green)
                        successRetry.push(failedLinks[j].number)
                        downloadFlag = false;
                        //console.log(result)
                        writeSuccessLog(url);

                    }  catch {
                            console.log("Encoding " + failedLinks[j].number + "FAILED".red)
                            failedEncode.push(i)
                            failedRetry.push(failedLinks[j].number)} 
            }  

        } 
        if (failedRetry.length != 0){
            console.log('\x1b[31m%s\x1b[0m',`WARNING: Links(s): #` + failedRetry.toString()+ ` failed AGAIN`);
            
        }
        if (successRetry.length != 0){
            console.log('\x1b[32m%s\x1b[0m',`HOORAY: Links(s): #` + successRetry.toString()+ ` SUCCEEDED on Retry`);
            
        }
        
        console.log("************************************ \n"+"************************************".magenta)
        console.log("RETRY ATTEMPT ENDED".brightMagenta)
    }

    //ERROR REPORT _________________________________________________________________
    //console.log("\n")
   // console.log("\n")
    // console.log(failedLinks.length)
    // console.log(failedStrip.length)

    console.log("************************************ \n************************************")
    if (failedShorten.length != 0){
        console.log('\x1b[31m%s\x1b[0m',`ERROR: Download(s): #` + failedShorten.toString()+ ` was not named correctly`);} //log which links did not download properly
    if (failedStrip.length != 0){
        console.log('\x1b[31m%s\x1b[0m',`ERROR: Download(s):` + failedStrip.toString()+ ` did not strip`);}
    if (failedDownload.length != 0){
        console.log('\x1b[31m%s\x1b[0m',`ERROR: Download(s):` + failedDownload.toString()+ ` did not download`);}
    if (failedEncode.length != 0){
            console.log('\x1b[31m%s\x1b[0m',`ERROR: Download(s):` + failedEncode.toString()+ ` did not encode`);}
    if (duplicateLinks.length != 0){
            console.log(`WARNING:`.yellow +` Links(s): ` + duplicateLinks.toString()+ ` are duplicate links and were skipped`);}
    if (invalidLinks.length != 0){
            console.log(`WARNING:`.yellow +`  Invalid Links(s): ` + invalidLinks.toString());}
            
    if (failedStrip.length===0 && failedShorten.length===0 && failedDownload.length===0 && failedEncode.length===0 && duplicateLinks.length===0 && invalidLinks===0)
    {
        console.log("************************************".brightGreen);
        console.log(".............NO ERRORS..............".brightGreen.bold)
        console.log("************************************".brightGreen);
    }
    //console.log("************************************ \n************************************")
    console.log("************************************ \n************************************")
    console.log(".........All Done Bitches...........".rainbow)                    //log message showing completed loop

    console.log('\n')
    console.log('\n')
}


//if this location contains this string, return true, if not return false
function checkIfContainsSync(filename, str) {

    const contents = readFileSync(filename, 'utf-8');
    const result = contents.includes(str);
    return result;
}



function textToArray(path) {

    let text = fs.readFileSync(path,'utf-8');   //converts .txt file to string                                      //convert .txt file to array with each line
    let textByLine = text.split('\n')           //splits string into array
    return textByLine;
}




// █░█ ▄▀█ █▀█ █▀█ █▀▀ █▀█ █▀ █░█ ▄▀█ █▀▀ █▄▀ █▀
// █▀█ █▀█ █▀▄ █▀▀ ██▄ █▀▄ ▄█ █▀█ █▀█ █▄▄ █░█ ▄█