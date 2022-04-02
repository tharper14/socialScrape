const insta = require('easy-instagram-post-downloader');
let iglink = ''
var postId = ''
let fs = require('fs');
let text = fs.readFileSync("./testext.txt", 'utf-8');          //convert .txt file to array with each line
let textByLine = text.split('\n')                           //'textByLine' is array with each link from text file

for (let i = 1; i < textByLine.length+1; i++) {              //loop through array with links
  iglink = textByLine[i-1]  



 
if (iglink.indexOf("reel") !== -1) {
     iglinkcut = iglink.substring(31)

    
    postId = iglinkcut.substring(0, iglinkcut.indexOf('/')) 
    console.log(postId)
    //IG download
  }  
  else {
    iglinkcut = iglink.substring(28)

    
    postId = iglinkcut.substring(0, iglinkcut.indexOf('/')) 
    console.log(postId)
 
  }           


// create downloads directory and get relative path
var dirName = '/Users/tylerharper/Downloads';

insta(postId, dirName, (error, response) => { 
    if(error) console.log(`Error is: `); 

    if(response) 
    console.log(response);
     //console.log(response.video_url)   
    
});



}







// const insta = require('easy-instagram-post-downloader');
// const instagramGetUrl = require("instagram-url-direct")



// let iglinkcut=''
// let iglinkcut2=""
// let postId = ''
// let iglink = 'https://www.instagram.com/reel/CNA2WbUlxNa/?utm_medium=copy_link'
 
// let links = await instagramGetUrl("https://www.instagram.com/reel/CNA2WbUlxNa/?utm_medium=copy_link")
// console.log(links)


// if (iglink.indexOf("reel") !== -1) {
//      iglinkcut = iglink.substring(31)

    
//     postId = iglinkcut.substring(0, iglinkcut.indexOf('/')) 
//     console.log(postId)
//     //IG download
//   }  
//   else {
//     iglinkcut = iglink.substring(28)

    
//     postId = iglinkcut.substring(0, iglinkcut.indexOf('/')) 
//     console.log(postId)
 
//   }           




// // create downloads directory and get relative path
// var dirName = '/Users/tylerharper/Downloads';

// insta(postId, dirName, (error, response) => { 
//     if(error) console.log(`Error is: `); 
//     if(response) console.log(response);
// });


//cant get reels
// const instagramGetUrl = require("instagram-url-direct")
// let iglink = 'https://www.instagram.com/reel/CPXVQX1lFkv/?utm_medium=copy_link'

// // Output — The word "looking" exists in given string.
// if (iglink.indexOf("instagram") !== -1) {
//   console.log('The word instagram exists in given string.');
// }


// async function stripDownload() {         

// let links = await instagramGetUrl(iglink)
// console.log(links)
// }
// stripDownload();

