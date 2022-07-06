1. Open VS Code, click on “Explorer” on top left pane and locate the socialScrape folder 
   (ideally throw it in your home directory > /users/tylerharper for me)

2. Open terminal within VS Code > View > Terminal

3. Make sure node is installed > “node -v” (should say v##.##.#) (really just for first time setup to make sure node is up and running properly)

4. Look in index.js file and update username and make sure the filepaths for masterLogPath and
   and chatScrapePath are correct based on your machine (make sure path to DropBox matches) 

5. Depending on what you want to do, set addChatLinks, checkLog, and addLog accordingly.
	-Normal use, all should be true

	>>addChatLinks = TRUE; will add links from group chat -add links from chatScrape.txt

	>>checkLog = TRUE; will prevent duplicate links being downloaded again from our database of
	 completed downloads in the past -checks against masterCompletedLog.txt

	>>addLog = true; successful downloads will have the link logged in masterCompletedLog.txt

	>> i.e. if you want to run a link through the downloader locally, not check against anything
	   or log any successful downloads, set all 3 to FALSE

	

6. Add any links to links.txt if you are not utilizing chatScrape or have links you want to download that aren't in groupchat, 
   1 link per line.

7. Index.js is the starting point for this script, to run script, just type “node index” in the terminal and hit enter. 


>>___Ctrl + C will abort the loop if you want to stop it____<<




Encoder_______________________
if you have videos on hand that you just want to batch run through the encoder, it is now located in the utilities folder..
(.../socialScrape-main/utilities/handbrake)

1. Navigate to the handbrake folder (in VS code, not finder)
Open VS Code, click on “Explorer” on top left pane and locate the handbrke folder (socialScrape-main/utilities/handbrake) 
	or 
 Using the command line/terminal >> "cd utilities"(enter) and then "cd handbrake"(enter)
   	>>the terminal window should be working out of the handbrake folder (username@Users-MBP hanbrake %_)
   
2. Put the videos you wish to encode into the "_inputVideos" folder

3. encode.js is the file that runs the script. Type into the command line/terminal "node encode"
   The newly encoded videos will be located in the _encodedOutput folder

