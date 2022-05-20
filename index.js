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






//---------------------------------------------------------------------
//-------------------------SET DOWNLOAD FILE LOCATION HERE-------------
const downloadFolder = './downloads';    
//---------------------------------------------------------------------
//-------------------------SET ENCODING FILE LOCATION HERE-------------
const encodedFolder ='./encodedDownloadsReady/' 
//---------------------------------------------------------------------
//---------------------------------------------------------------------


//initializing all dependency packages
const tiktok = require('tiktok-scraper-without-watermark')  
const Downloader = require("nodejs-file-downloader")        
let unshortener = require("unshorten.it");
let fs = require('fs');
const instagram = require('user-instagram');
const hbjs = require('handbrake-js')
const FileProcessorHH = require('./fileProcessorHH');

//let completedDownloads = []
let failedShorten = []
let failedStrip = []
let failedDownload = []
let failedEncode = []
let url = ''
let strippedurl = ''
let username = ''
let downloadFlag = false;
let completeFileName = ''
let text = fs.readFileSync("./file.txt", 'utf-8');                                         //convert .txt file to array with each line
let textByLine = text.split('\n')                                                          //'textByLine' is array with each link from text file




//MAIN FUNCTION
async function stripDownload() {                                                           //asynchronous app to allow for loop to wait on async data
    //Loop thru text file line by line
    for (let i = 1; i < textByLine.length+1; i++) {                                        //loop through array with links
        
        url = textByLine[i-1] 
      
      //Instagram DOWNLOADER - IN PROGRESS
        if (url.indexOf("instagram") !== -1) {
                console.log('IG Link');
                try {
                    await instagram.authenticate('social.scrape', 'Socialscrape!');
                    console.log("success authenticating")
                } catch {console.log("error authenticating")}}


      //TIKTOK FULL DOWNLOADER
        else if (url.indexOf("tiktok") !== -1) {

          //USERNAME EXTRACTOR_________________________________________________________________Get Username for filenaming
                if (url.indexOf("https://www.tiktok.com/@") !== -1){                            //regular link (not vm)
                    let short = url.substring(24)                                              //strip the first 24 characters off static link (https://www.tiktok.com.@)
                    username = short.substring(0, short.indexOf('/'))                          //strip everything after the first /, set as username variable
                    console.log("Username #" + i + " Pulled") 
                }
                else if (url.indexOf("https://vm.tiktok.com") !== -1){                                                                         // else = mobile link (vm.tiktok)
                    try {
                        let long_url = await unshortener(url)                                  //unshorten mobile short link to get username
                        let short = long_url.substring(24)                                     //strip the first 24 characters off static link (https://www.tiktok.com.@)
                        username = short.substring(0, short.indexOf('/'))                      //strip everything after the first /, set as username variable
                        console.log("Username #" + i + " Pulled") 
                    } catch {
                            console.log("URL #" + i + "could not be shortened")                //throw error message if shorten fails
                            let failedLink = url.substring(22)
                            let failedClip = failedLink.substring(0, failedLink.indexOf('/')); // naming clip link id alerting to find username
                            username = "RENAMETHISCLIP_" + failedClip
                            failedShorten.push(i);}     
                }
                else if (url.indexOf("https://www.tiktok.com/t/") !== -1){
                    try {
                        let long_url = await unshortener(url)                                  //unshorten mobile short link to get username
                        console.log(long_url)
                        let short = long_url.substring(24)                                     //strip the first 24 characters off static link (https://www.tiktok.com.@)
                        username = short.substring(0, short.indexOf('/'))                      //strip everything after the first /, set as username variable
                        console.log("Username #" + i + " Pulled") 
                    } catch {
                            console.log("URL #" + i + "could not be shortened")                //throw error message if shorten fails
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
                    // console.log(completeFileName)
                } catch {
                        console.log("Failed File Processing on download #" + i )}

          //TIKTOK STRIPPER____________________________________________________________________acquires raw video url from TikTok
                try {
                    strippedurl = await tiktok.tiktokdownload(url)                             //run stripping function that returns stripped url link
                    console.log("Stripped #" + i + " Success")           
                } catch (e) {   
                        console.log(e)                                                         //throw error if failed stripped
                        failedStrip.push(i)}                                                        

          //DOWNLOADER_________________________________________________________________________download video from stripped video URL
                let downloader = new Downloader({                                              //set new instance of Downloader with new parameters
                    url: strippedurl,                                                          //url of stripped video created from tiktokdownload()
                    directory: downloadFolder,                                                 //where to download clips
                    fileName: username + ".mp4",                                               //duplicate filenames get "-#", see FileProcess.js to edit
                    maxAttempts: 3});                                                          // retry failed downloads 3 times until it aborts
                
                try {
                    await downloader.download();                                               //Downloader.download() returns a promise =downloads video
                    console.log("Download #" + i +" Complete")
                    //completedDownloads.push(fileName);
                    downloadFlag = true;

                } catch(error){
                            console.log("Download #" +i+ " failed", error)                     //error is thrown in case of network errors, or status codes of 400 and above.
                            failedDownload.push(i)
                            downloadFlag = false;}                                             //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.


    
          //HANDBRAKE ENCODING_________________________________________________________________encoded freshly downloaded video into different folder
            if (downloadFlag === true)  {
                    let options = {
                        input: `${downloadFolder}/${completeFileName}`,
                        output: `${encodedFolder}/${completeFileName}`,
                        preset: 'Fast 1080p30'};

                    try  {
                        let result = await hbjs.run(options)
                        console.log("Encoding #" + i + " COMPLETE\n************************************")
                        downloadFlag = false;
                        //console.log(result)

                    }  catch {
                            console.log("Error encoding video: " + i)
                            failedEncode.push(i)} 
            }                                              
        }
        else {
            console.log("Link #" + i + " is not a valid link")
        }
    }
    console.log("************************************ \n************************************")
    if (failedShorten.length != 0){
        console.log(`WARNING: Download(s): #` + failedShorten.toString()+ ` was not named correctly`);} //log which links did not download properly
    if (failedStrip.length != 0){
        console.log(`WARNING: Download(s):` + failedStrip.toString()+ ` did not strip`);}
    if (failedDownload.length != 0){
        console.log(`WARNING: Download(s):` + failedDownload.toString()+ ` did not download`);}
    if (failedEncode.length != 0){
            console.log(`WARNING: Download(s):` + failedEncode.toString()+ ` did not encode`);}
    if (failedStrip.length===0 && failedShorten.length===0 && failedDownload.length===0 && failedEncode.length===0)
    {
        console.log(".............NO ERRORS..............");
    }
    console.log("************************************ \n************************************")
    console.log(".........All Done Bitches...........")                    //log message showing completed loop
    console.log("************************************ \n************************************")
}

stripDownload()                                              //actually run defined function above











// █░█ ▄▀█ █▀█ █▀█ █▀▀ █▀█ █▀ █░█ ▄▀█ █▀▀ █▄▀ █▀
// █▀█ █▀█ █▀▄ █▀▀ ██▄ █▀▄ ▄█ █▀█ █▀█ █▄▄ █░█ ▄█