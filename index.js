const tiktok = require('tiktok-scraper-without-watermark')  //initializing all needed dependency packages
const Downloader = require("nodejs-file-downloader")        
let unshortener = require("unshorten.it");
let fs = require('fs');

let failedShorten = []
let failedStrip = []
let failedDownload = []
let url = 'https://vm.tiktok.com/TTPdrQneHv/'
let strippedurl = ''
let username = ''

let text = fs.readFileSync("./file.txt", 'utf-8');          //convert .txt file to array with each line
let textByLine = text.split('\n')                           //'textByLine' is array with each link from text file

async function stripDownload() {                            //asynchronous app to allow for loop to wait on async data

for (let i = 1; i < textByLine.length+1; i++) {              //loop through array with links
    url = textByLine[i-1]  
  if (url.indexOf("instagram") !== -1) {
        console.log('IG Link');

        //IG download --Work In Progress
      }
  else{
    try {
        let long_url = await unshortener(url)               //unshorten mobile short link to get username
        let short = long_url.substring(24)                  //strip the first 24 characters off static link (https://www.tiktok.com.@)
        username = short.substring(0, short.indexOf('/'))   //strip everything after the first /, set as username variable
        console.log("Username #" + i + " Pulled")  
    } catch {
                console.log("URL #" + i + "could not be shortened")   //throw error message if shorten fails
                let failedLink = url.substring(22)
                let failedClip = failedLink.substring(0, failedLink.indexOf('/'));  // naming clip link id alerting to find username
                username = "RENAMETHISCLIP_" + failedClip
                failedShorten.push(i);
            }     

    try {
        
        let result = await tiktok.tiktokdownload(url)        //run stripping function that returns stripped url link
        strippedurl = result                                 //return stripped video url to variable
        console.log("Stripped #" + i + " Success")           
       
    } catch (e) {   
                console.log(e)                               //throw error if failed stripped
                failedStrip.push(i);
    }                                                        
        
    let downloader = new Downloader({                        //set new instance of downloader with new parameters
            url: strippedurl,                                //url of stripped video created from tiktokdownload()
            directory: "./downloads",                        //-----SET DOWNLOAD FILE LOCATION HERE----
            fileName: username + ".mp4",                     //duplicate filenames get "-#", see FileProcess.js to edit
            maxAttempts: 3,                                  // retry failed downloads 3 times until it aborts
        });

    try {
        await downloader.download();                         //Downloader.download() returns a promise =downloads video
        console.log("Download #" + i +" COMPLETE\n************************************");
            
    } catch(error){
                    console.log("Download" +i+ " failed", error)        //error is thrown in case of network errors, or status codes of 400 and above.
                    failedDownload.push(i);  
                  }   
                                                             //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
 }
}
console.log("************************************ \n************************************")
if (failedShorten.length != 0){
    console.log(`WARNING: Download(s): #` + failedShorten.toString()+ ` was not named correctly`);} //log which links did not download properly
if (failedStrip.length != 0){
    console.log(`WARNING: Downloads:` + failedStrip.toString()+ ` did not strip`);}
if (failedDownload.length != 0){
    console.log(`WARNING: Downloads:` + failedDownload.toString()+ ` did not download`);}
if (failedDownload.length===0 && failedShorten.length===0 && failedDownload.length===0)
{
    console.log(".............NO ERRORS..............");
}
console.log("************************************ \n************************************")
console.log(".........All Done Bitches...........")                    //log message showing completed loop
console.log("************************************ \n************************************")
}

stripDownload()                                              //actually run defined function above