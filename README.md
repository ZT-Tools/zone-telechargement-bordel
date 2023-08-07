# zone-telechargement-api
 An API for zone-telechargement built from Scratch.
 I'm french by the way.
## Documentation
 Right there, you're welcome: http://www.zone-telechargement-api.ovh/

# IMPORTANT
### For legal reasons, the API had to be cut. Thank you for your understanding.

# ~~Contact~~
~~If you are from the government or if you for any reason want to close this API, you can contact me by opening a new issue and describing that you want to contact me in private for such and such reasons.~~

# How to use
~~For now, endpoint is at http://zone-telechargement-api.ovh/~~
~~To know more details on how to use, please refer to the documentation.~~
Documentation is at http://www.zone-telechargement-api.ovh/ (DNS to https://sylicium.github.io/zone-telechargement-api/) or http://docs.zone-telechargement-api.ovh/

As i had to cut the API, no more API exists. Howerver you can still use this project as following.

If you already know how to code in NodeJS, you can jump to the second part.

## Seting up the environment
1. Install [NodeJS](https://nodejs.org/en) environment on your pc. (make sure to enable Add to Path)
2. Create a directory for your project
3. Open a Command prompt (cmd) and go to your directory.
4. run `npm init` then just press enter for all the things
5. run `npm install axios dom-parser`
## Download and use the repository
1. Download `/localModules/ztParser.js` and `/localModules/someFunctions.js`, and place them in your directory.
2. Create a `index.js` file and put the next code in it:
```javascript
const ZTP = require("./ztParser") // Import ztParser

let category = "films" // The category you want to search / list of categories at ZTP._allCategories
// Currently, only "films" is tested, so it may crash or not work properly for other categories
let query = "Iron man" // Your search query

async function __main__() {
    let response1 = await ZTP.search(category, query) // Search for a film (category, query, page) default page is 1
    console.log(response1)

    let response2 = await ZTP.searchAll(category, query) // Used to get the WHOLE list of film about a query.
    console.log(response2)
    // WARNING ! searchAll() will get EVERY pages of the given query, so it can make A LOT a requests to use at your own risks.
    // For example "Iron man" will get +30 pages. Dont use that unless its really necessary. You can also specify a page number on the ZTP.search() function.

    let movieID = "8726" // Can be find in the response of ZTP search requests
    let response3 = await ZTP.getMovieDetails(movieID) // Used to get a lot a details about a specific movie, such as name, synopsis, actors, download and streaming links, etc..
    console.log(response3)
}
```

## Zone-telechargement has changed URL !! its not working !!
 Don't panic, if its the case, just add that line after importing ztParser:
```javascript
const ZTP = require("./ztParser") // Import ztParser
ZTP.useBaseURL("https://someNewURL.com") // Do not add the last slash !
```
However, if the requests are failing on the new site make sure that:
- Its the good one (there are some scam copy of it)
- The pages have not changed visually
(Since my script decompose the pages to get the datas, if the pages changes, my script just break 🙃)
If the pages changed visually, please let me know by opening an issue (or commenting if someone already reported that) (DO NOT OPEN A NEW ISSUE IF THERE IS ALREADY AN ISSUE ABOUT YOUR PROBLEM PLEASE)
