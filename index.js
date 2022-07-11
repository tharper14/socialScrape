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
let dropBoxFolder = '_socialScrape'

const test = false;
const localDL = false;


let masterLogPath =  `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/masterCompletedLog.txt`
let chatScrapePath =  `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/chatScrapeLinks.txt`
let encodedFolder = `/Users/${yourUsername}/Social Wake Dropbox/New Clips`

let logPath = `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/chatLog.txt`
let missedLinkPath =  `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/missedLinks.txt`
let missedLogPath =  `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/missedLinksLog.txt`

//---------------------------------------------------------------------
//TURN ON/OFF adding ChatScrape Links to list -> false does not check/add links from chatScrape.txt
let addChatLinks = true
//TURN ON/OFF checking against successLog -> false will download videos no matter what
let checkLog = true   
//TURN ON/OFF adding successful downloads to successLog -> false will not keep record of successful links
let addLog = true  
// Run GetRecent: grab/look for missed links -in progress
let pullChatDb = false;
//DELETE stripped download after successful encoding -> true
const deleteStripDownload = true; 
//---------------------------------------------------------------------

if (test == true)  //dont need to change a bunch of filepaths for running tests, just change test to t/f
{
    dropBoxFolder = 'Tylers Tests';
    encodedFolder =`/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/New Clips`;
    masterLogPath =  `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/masterCompletedLog.txt`
    chatScrapePath =  `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/chatScrapeLinks.txt`
    newClips = `/Users/${yourUsername}/Social Wake Dropbox/New Clips`
    logPath = `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/chatLog.txt`
    missedLinkPath =  `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/missedLinks.txt`
    missedLogPath =  `/Users/${yourUsername}/Social Wake Dropbox/${dropBoxFolder}/logs/missedLinksLog.txt`  
}

if (localDL == true)
{
    encodedFolder = './_finalDownloads';
}

//Don't Change these
const linksList = "./links.txt"
const downloadFolder = './utilities/stripDownloads'    
const failedFolder = './utilities/failedLinks.txt'

const ttOnlyChatID = "'chat652293730519823796'";
const igChatID = "'chat222048912579693603'"
const dateFromChatLinks = '679112890556703100';
//---------------------------------------------------------------------



//initializing all dependency packages
const tiktok = require('tiktok-scraper-without-watermark')  
const Downloader = require("nodejs-file-downloader")        
let unshortener = require("unshorten.it");
let fs = require('fs');
const {readFileSync, promises: fsPromises} = require('fs');
const instagram = require('user-instagram');
const hbjs = require('handbrake-js')
const FileProcessorHH = require('./utilities/fileProcessorHH');
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
let alreadyLogged = []
let alreadyLoaded = []
let addedFromChatScrape = []
let url = ''
let strippedurl = ''
let username = ''
let downloadFlag = false;
let stripFlag = false;
let completeFileName = ''
let duplicate = false;

//encoder quality options
const veryFast = 'Very Fast 1080p30'
const fast = 'Fast 1080p30'
const hq = 'HQ 1080p30 Surround'
const superHQ = 'Super HQ 1080p30 Surround'

var failedWrite = fs.createWriteStream(failedFolder, {                              //create write stream and write function for failed links, a=append
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

    for (let i = 1; i < chatScrapeArrayRaw.length+1; i++) {

        let chatLink = chatScrapeArrayRaw[i-1];
        //console.log(chatLink)
        //if link #i in chatScrapeArrayRaw does not exist in file.txt or success log, or already in chatScrapeArray, add to chatScrapeArray and add to file.txt
        if(checkIfContainsSync(linksList, chatLink)==false && checkIfContainsSync(masterLogPath, chatLink)==false && chatScrapeArray.includes(chatScrapeArrayRaw[i])==false){
            chatScrapeArray.push(chatLink) //the important part, 
            addedFromChatScrape.push(i) //saving indices from successful adds for report at the end
            appendFromChat(chatLink) //adds link to file.txt -more for visual confirmation, code uses chatScrapeArray
            //console.log(`Link #${i} from chatScrape has been added to ${linksList}`);
        }
        if(checkIfContainsSync(masterLogPath, chatLink)==true && chatLink!=''){
            alreadyLogged.push(i)
           
        } 
        if(checkIfContainsSync(linksList, chatLink)==true && chatLink!='' /*&& checkIfContainsSync(masterLogPath, chatLink)==false*/){
            alreadyLoaded.push(i);
            //console.log(`Chat Link #${i} is already in ${linksList}`)
        }  
    }
     //console.log("\n")
     //console.log(chatScrapeArray)
   
    if(alreadyLogged.length !=0){
        console.log(`Link(s) #${alreadyLogged.toString()} from chatScrape have been downloaded in the past`.blue)}
        
    if(alreadyLoaded.length !=0){
        console.log(`Link(s) #${alreadyLoaded.toString()} from chatScrape already loaded`.blue)}
    if (chatScrapeArray.length == 0){
            console.log("No Chat links were added...\n".blue)
        }
    if(chatScrapeArray.length !=0){
        console.log(`Link(s) #${addedFromChatScrape.toString()} added from chatScrape\n`.green)
    }
}
stripDownload(linksList); //main process


//---------------------------------------------------------------------
//-------------------------------MAIN LOOP END-------------------------



//MAIN FUNCTION
async function stripDownload(linksPath) { 
    
    let fileByLine = textToArray(linksPath)
    
    // let textByLine = textToArray(linksPath)
    let textByLine = fileByLine.concat(chatScrapeArray)
    //console.log(textByLine)
    //console.log(textByLine.length)
    console.log(`Process Starting...`)
    //Loop thru text file line by line
    for (let i = 1; i < textByLine.length+1; i++) {    

        
        url = textByLine[i-1] 
       
        //console.log(masterLogPath)
        // console.log("************************************")
        //console.log('\n')

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
                if (username.charAt(0) == '.')
                {
                     username = username.replaceAt(0, "(dot)");  //if username starts with '.' replace with (dot)
                }

          //FileProcessor____________________________________________________________________
                var fileProcessorHH = new FileProcessorHH({fileName: username + '.mp4', path: encodedFolder});
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
                        let failedInstance = {link:url, usr:username, cfn:completeFileName, number:i}
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
                            if(checkIfContainsSync(failedFolder, url)==false) {writeFailed(url)}
                           // failedLinks.push(url)  //for failed retry
                            failedDownload.push(i) //for error log
                            let failedInstance = {link:url, usr:username, cfn:completeFileName, number:i}
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
                        preset: superHQ};

                    try  {
                        let result = await hbjs.run(options)
                        console.log("Encoding #" + i + " COMPLETE\n************************************✅ \n".brightGreen)
                        //checkAndAdd(masterLogPath, url)
                        downloadFlag = false;
                        //console.log(result)
                        if(addLog){
                            writeSuccessLog(url);}
                        if (deleteStripDownload)
                        {
                            deleteFile(downloadFolder+"/"+completeFileName)
                        }

                    }  catch {
                        console.log("Encoding #" +i+ " FAILED!!".red)
                            failedEncode.push(i)} 
            }                                              
        }
        //Duplicate Link Catcher
        else {
            if (url ==''){
                console.log("Line #" + i + " is blank")
                }
            else if (duplicate === true){
                //console.log('\x1b[33m%s\x1b[0m',"************************************")
                console.log(colors.yellow("Link #" + i + " is a DUPLICATE \n*************SKIPPED*************** ⚠️⚠️\n"))
                duplicateLinks.push(i);
            }
            
            else{
            console.log("Link #" + i + " is not a valid link\n".red)
            invalidLinks.push(i)
            if(checkIfContainsSync(failedFolder, url)==false) {writeFailed(url)};
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
           var fileProcessorHH = new FileProcessorHH({fileName: failedLinks[j].usr + '.mp4', path: encodedFolder});
              try{
                 completeFileName = await fileProcessorHH.getAvailableFileName();
              // console.log(completeFileName)
              } catch {
                  console.log(colors.red("Failed File Processing on link #" + failedLinks[j].number))
                  console.log(colors.red("Contact Tyler, this isnt ready/expected to happen"))
                }
                 
          //TIKTOK STRIPPER Retry____________________________________________________________________acquires raw video url from TikTok
                try {
                    strippedurl = await tiktok.tiktokdownload(url)                             //run stripping function that returns stripped url link
                    stripFlag = true;
                    console.log("Stripped #" + failedLinks[j].number + " SUCCESS".green)
                    let fixIndex = failedStrip.indexOf(failedLinks[j].number) //what index in failed array is this original link # (i) located at
                    if (fixIndex !==-1) {                                        //if index exists..
                        failedStrip.splice(fixIndex);                        //remove that link -since its now good
                    }           
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
                    let fixIndex = failedDownload.indexOf(failedLinks[j].number) //what index in failed array is this original link # (i) located at
                    if (fixIndex !==-1) {                                        //if index exists..
                        failedDownload.splice(fixIndex);                        //remove that link -since its now good
                    }

                } catch(error){
                            if(checkIfContainsSync(failedFolder, url)==false) {writeFailed(url)}
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
                        preset: superHQ};

                    try  {
                        let result = await hbjs.run(options)
                        console.log("Encoding #" + failedLinks[j].number + " COMPLETE\n************************************".green)
                        successRetry.push(failedLinks[j].number)
                        downloadFlag = false;
                        //console.log(result)
                        writeSuccessLog(url);
                        let fixIndex = failedEncode.indexOf(failedLinks[j].number) //what index in failed array is this original link # (i) located at
                        if (fixIndex !==-1) {                                        //if index exists..
                            failedEncode.splice(fixIndex);                        //remove that link -since its now good
                        }
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
            
    if (failedStrip.length===0 && failedShorten.length===0 && failedDownload.length===0 && failedEncode.length===0 && duplicateLinks.length===0 && invalidLinks.length===0)
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

String.prototype.replaceAt = function (index, char) {       //function to replace character in string
    let a = this.split("");
    a[index] = char;
    return a.join("");
  }


 function deleteFile(path) {
    try {
    fs.unlinkSync(path)
        //console.log("raw download deleted")
    }
    catch{
        console.log(`ERROR: ${path} was not deleted!`)
    }

  }



// █░█ ▄▀█ █▀█ █▀█ █▀▀ █▀█ █▀ █░█ ▄▀█ █▀▀ █▄▀ █▀
// █▀█ █▀█ █▀▄ █▀▀ ██▄ █▀▄ ▄█ █▀█ █▀█ █▄▄ █░█ ▄█
