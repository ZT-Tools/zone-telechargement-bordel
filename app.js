const ZTP = require("./localModules/ztParser") // Import ztParser
ZTP.useBaseURL("https://www.zone-telechargement.homes/") // Do not add the last slash !

let category = "films" // The category you want to search / list of categories at ZTP._allCategories
// Currently, only "films" is tested, so it may crash or not work properly for other categories
let query = "Iron man" // Your search query

async function __main__() {
    let response1 = await ZTP.search(category, query) // Search for a film (category, query, page) default page is 1
    console.log(response1)
}

__main__()