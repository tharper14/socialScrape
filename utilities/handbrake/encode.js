let manualDownloads = [];
let failEncode = [];
const fs = require('fs');
const hbjs = require('handbrake-js');
const inputFolder = './_inputVideos';
const outputFolder = './_encodedOutput';
let currentFile ='';

const veryFast = 'Very Fast 1080p30'
const fast = 'Fast 1080p30'
const hq = 'HQ 1080p30 Surround'
const superHQ = 'Super HQ 1080p30 Surround'

fs.readdirSync(inputFolder).forEach(file => {

  //console.log(file);
  if (file.indexOf(".mp4") !== -1) {
  manualDownloads.push(file)}
//   console.info(manualDownloads)
});

async function manualEncoder() {  
    for (let i = 0; i < manualDownloads.length; i++) {  
        // console.log(manualDownloads[i])
        currentFile = manualDownloads[i]

        let options = {
            input: `${inputFolder}/${currentFile}`,
            output: `${outputFolder}/${currentFile}`,
            preset: superHQ};

        try  {
            let result = await hbjs.run(options)
            console.log("Encoding " + currentFile + " COMPLETE\n************************************")
    
           // console.log(result)

        }  catch {
                console.log("Error encoding video: " + i)
                failEncode.push(currentFile)
        }
    }

    if (failEncode.length != 0){
        console.log(`WARNING: Download(s):` + failEncode.toString()+ ` did not encode`);}
    if (failEncode.length===0)
    {
        console.log(".............NO ERRORS..............");
    }
    console.log("************************************ \n************************************")
    console.log(".........All Done Bitches...........")                    //log message showing completed loop
    console.log("************************************ \n************************************")
}
manualEncoder();
