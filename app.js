const ZTP = require("./localModules/ztParser") // Import ztParser
ZTP.useBaseURL("https://www.zone-telechargement.homes/") // Do not add the last slash !

ZTP._devMode = true // Enable dev mode (more logs)

let category = "films" // The category you want to search / list of categories at ZTP._allCategories
// Currently, only "films" is tested, so it may crash or not work properly for other categories
let query = "Iron man" // Your search query

async function __main__() {
    let response1 = await ZTP.search(category, query)

    console.log("Search: ", Object.values(response1)[0][0],"\n")
    // console.log("SearchAll: ", await ZTP.searchAll(category, query),"\n")
    console.log("\n\getMovieDatas: ", await ZTP.getMovieDatas(category, Object.values(response1)[0][0].id),"\n")
}

__main__()