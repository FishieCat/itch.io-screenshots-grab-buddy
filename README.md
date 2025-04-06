# itch.io-screenshots-grab-buddy
grab screens from itch.io a bit quicker

To use the extension:

1. Install a userscript extension like Tampermonkey, Greasemonkey, Violentmonkey etc. in your web browser
2. Install the extension by creating a new one in your extension and copy-pasteing the content of [itch-scr-grab.js](https://raw.githubusercontent.com/FishieCat/itch.io-screenshots-grab-buddy/refs/heads/main/itch-scr-grab.js) into it
3. Save and test with https://incredulous.itch.io/picture-perfect and https://itch.io/jam/gmtk-2024/rate/2903789

It should look like this:

![example1](https://github.com/user-attachments/assets/58ac7fcb-759a-442e-b43b-47ce1979ca1e)

and this:

![example2](https://github.com/user-attachments/assets/2bd3cfe9-f752-44fa-9e07-16638b17ba52)

To make use of the textbox code:

1. Install [git](https://git-scm.com/downloads) on Windows
2. Click the textbox created by the extension and hit CTRL+C or right click and copy
3. Right click the empty area of the target folder in Windows Explorer and click `open Git Bash here`  
   ![open git bash here](https://github.com/user-attachments/assets/13b67a8b-8b14-449e-87f3-587aa8cb9fdb)
5. MIDDLE MOUSE BUTTON click into the command line window and hit Return

This can probably easily be rewritten to use curl so it works on [OS X](https://curl.se/mail/lib-2012-11/0013.html) and apparently [Windows 10 1803+](https://stackoverflow.com/a/16216825) without the need for the above.
