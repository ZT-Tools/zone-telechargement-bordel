/*

/!\ Developement version /!\
Do not use this file in a production environment.
Or if you do, at your own risks, and dont make any issue about it please.

*/


const axios = require("axios")

var DomParser = require('dom-parser');
var somef = require('./someFunctions');
var parser = new DomParser();

class ZoneTelechargementParser {
    constructor(devMode=false, axiosRequestTimeInBetween=300) {
        this._ZTBaseURL = `https://www.zone-telechargement.homes` 
        this._allCategories = [ "films", "series", "jeux", "musiques", "mangas", "ebooks", "autres-videos", "logiciels", "mobiles" ]
        this._lastAxiosRequestTimestamp = 0 // Do not edit this value. used as temp
        this._axiosRequestTimeInBetween = axiosRequestTimeInBetween // Default: 300 - In milliseconds. Minimum time to wait between each requests to the base URL. Low values can cause functions to crash due to HTPP error 520 from axios. (Or rate limit errors)
        this._devMode = devMode;
    }
    
    _getBaseURL() { return this._ZTBaseURL }
    _getAllCategories() { return this._allCategories }
    _getMatchingGroups = function(s) {
        try {
            var r=/\((.*?)\)/g, a=[], m;
            while (m = r.exec(s)) {
              a.push(m[1]);
            }
            return a;
        } catch(e) {
            if(this._devMode) console.log(e)
            return s
        }
    };
    _setAxiosRequestTimeInBetween(value) {
        if(typeof value != "number") throw new Error("Argument must be type of 'number'.")
        this._axiosRequestTimeInBetween = value
    }
    _setDevMode(value) {
        if(typeof value != "boolean") throw new Error("Argument must be type of 'boolean'.")
        this._devMode = !!value
    }



    _getPayloadURLFromQuery(category, query, page=1) {
        if(typeof page != "number") throw new Error(`ztParser._getPayloadURLFromQuery(): 'page' must be type of 'number'`)
        category = category.trim().toLowerCase()
        if(!this._allCategories.includes(category)) throw new Error(`ztParser._getPayloadURLFromQuery(): 'category' must be one in the following list: ${this._getAllCategories().join(", ")}`)
        return this._getBaseURL() + `/?p=${category}&search=${encodeURI(query)}&page=${page}`
    }

    async _getDOMElementFromURL(url) {
        if(Date.now()-this._lastAxiosRequestTimestamp < this._axiosRequestTimeInBetween) {
            await somef.sleep(this._axiosRequestTimeInBetween - (Date.now()-this._lastAxiosRequestTimestamp))
        }
        this._lastAxiosRequestTimestamp = Date.now()

        let response = await axios.get(url)
        let document = parser.parseFromString(response.data)
        return document
    }


    async _parseMoviesFromSearchQuery(category, query, page) {

        let payloadURL = this._getPayloadURLFromQuery(category, query, page)

        let document = await this._getDOMElementFromURL(payloadURL)

        let movieList_elements = [...document.getElementById("dle-content").childNodes].filter(x => { return x.getAttribute("class") == "cover_global" })

        let responseMovieList = []

        if(movieList_elements.length == 0) { return responseMovieList }

        for(let i in movieList_elements) {
            let elem = movieList_elements[i]

            let the_url = this._getBaseURL() + [...elem.getElementsByTagName("div")].filter(x => {
                return x.getAttribute("class") == "cover_infos_title"
            })[0].getElementsByTagName("a")[0].getAttribute("href")

            let movieDatas = {
                "title": [...elem.getElementsByTagName("div")].filter(x => {
                    return x.getAttribute("class") == "cover_infos_title"
                })[0].getElementsByTagName("a")[0].textContent,
                "url": the_url,
                "id": the_url.match(/[?&]id=[0-9]{1,5}\-/gmi)[0].match(/\d+/)[0],
                "image": this._getBaseURL() + [...elem.getElementsByTagName("img")].filter(x => {
                    return x.getAttribute("class") == "mainimg"
                })[0].src,
                "quality": [...movieList_elements[2].getElementsByTagName("div")].filter(x => {
                    return x.getAttribute("class") == "cover_infos_title"
                })[0].getElementsByClassName("detail_release")[0].getElementsByTagName("b")[0].textContent,
                "language": this._getMatchingGroups([...movieList_elements[2].getElementsByTagName("div")].filter(x => {
                    return x.getAttribute("class") == "cover_infos_title"
                })[0].getElementsByClassName("detail_release")[0].getElementsByTagName("b")[1].textContent)[0],
                "publishedOn": new Date(elem.getElementsByTagName("time")[0].textContent)
            }
            responseMovieList.push(movieDatas)
        }

        /*
        if(this._devMode) console.log("aaaaa:",[...movieList_elements[2].getElementsByTagName("div")].filter(x => {
            return x.getAttribute("class") == "cover_infos_title"
        })[0].getElementsByClassName("detail_release")[0].getElementsByTagName("b")[0].textContent)
        */

        return responseMovieList
    }

    useBaseURL(url) {
        this._ZTBaseURL = url
        return true
    }

    async searchAll(category, query) {
        try {
            let responseMovieList = []
            let tempMovieList = false
            let searchPage = 0
            while(tempMovieList.length != 0) {
                searchPage++
                tempMovieList = await this._parseMoviesFromSearchQuery(category, query, searchPage)
                responseMovieList = responseMovieList.concat(tempMovieList)
                if(this._devMode) console.log(`Added ${tempMovieList.length} movies from page ${searchPage}`)
            }
            return responseMovieList
        } catch(e) {
            if(this._devMode) console.log(e)
            return {
                status: false,
                error: `${e}`,
                stack: e.stack.split("\n"),
            }
        }
    }

    

    async search(category, query, page) {
        try {
            let responseMovieList = await this._parseMoviesFromSearchQuery(category, query, page)
            return responseMovieList
        } catch(e) {
            if(this._devMode) console.log(e)
            return {
                status: false,
                error: `${e}`,
                stack: e.stack.split("\n"),
            }
        }
    }


    async getMovieDetails(movieID) {


        let movieURL = this._getBaseURL() + `?p=film&id=${movieID}` // FILM sans S car page de description de UN seul film

        if(!movieURL.startsWith(this._getBaseURL())) return {
            status: false,
            error: `Wrong base URL provided`
        }

        let document = await this._getDOMElementFromURL(movieURL)

        let corpsElement = (
            document.getElementById("dle-content")
            .getElementsByClassName("base")[0]
            .getElementsByClassName("maincont")[0]
            .getElementsByClassName("corps")[0]
        );
        let mainElement = (
            corpsElement
            .getElementsByTagName("div")[0]
        );


        let otherversions_div = mainElement.getElementsByClassName("otherversions")[0]
        let versions = []
        if(otherversions_div) {
            let version_list_a = [...otherversions_div.getElementsByTagName("a")]
            versions = version_list_a.map(x => {
                    return {
                        url: this._getBaseURL() + x.getAttribute("href"),
                        quality: x.getElementsByTagName("b")[0].textContent,
                        language: this._getMatchingGroups(x.getElementsByTagName("b")[1].textContent)[0],
                    }
            })
        }
        // if(this._devMode) console.log("version1:",otherversions_div)
        // if(this._devMode) console.log("version2:",version_list_a)
        // if(this._devMode) console.log("version3:",versions)
        
        let center_element = mainElement.getElementsByTagName("center")[0]


        let centerElements = [
            [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ]

        let all_cutsElement_src = [
            `/templates/zone/images/infos_film.png`,
            `/templates/zone/images/synopsis.png`,
            `/templates/zone/images/infos_upload.png`,
            `/templates/zone/images/liens.png`,
        ]

        let currentStep = 0

        let temp = [...center_element.childNodes]
        for(let i in temp) {
            let e = temp[i]
            // if(this._devMode) console.log("e.nodeName",e.nodeName)

            if(e.nodeName == "img" && all_cutsElement_src.includes(e.getAttribute("src"))) { currentStep++ }
            // if(this._devMode) console.log(`\n\n\n\n=======\n\n centerElements[${currentStep}]`,centerElements[currentStep])
            centerElements[currentStep].push(e)
        }
        
        
        // =============== FILM INFOS ( centerElements[1] ) ===============

        if(this._devMode) console.log("center_element",center_element.outerHTML)
        let filmInfosElements = somef.parseSubZones(center_element, (e) => { return e.nodeName == "strong" && somef.anyWordInText(e.innerHTML, [
            `Origine`,
            `Durée`,
            `Réalisation`,
            `Acteur`,
            `Genre`,
            `Année de production`,
            `Titre original`,
            `Critiques`,
            `Bande annonce`
        ])})

        // if(this._devMode) console.log("centerElements[1] outerHTML:",centerElements[1].map(x => { return x.outerHTML.trim() }))
        // if(this._devMode) console.log("centerElements[1] nodeName :",centerElements[1].map(x => { return x.nodeName }))

        if(this._devMode) console.log("centerElements[3]",centerElements[3].map(x => x.outerHTML))

        let parsedZone = somef.mapNameParsedSubZones(
            filmInfosElements,
            [
                { cutOn: "origine", value: "origine" },
                { cutOn: "durée", value: "durée" },
                { cutOn: "réalisation", value: "réalisation" },
                { cutOn: "acteur", value: "acteur" },
                { cutOn: "genre", value: "genre" },
                { cutOn: "année", value: "année" },
                { cutOn: "titre", value: "titre" },
                { cutOn: "critiques", value: "critiques" },
                { cutOn: "bande", value: "bande annonce" },
                { cutOn: "qualité", value: "quality" },
                { cutOn: "langue", value: "language" },
                { cutOn: "taille du fichier", value: "size" },
            ],
            (e) => { return e.filter(x => { return x.nodeName == "strong"})[0]?.getElementsByTagName("u")[0]?.textContent?.toLowerCase()?.trim() ?? null},
            "none"
        )

        if(this._devMode) console.log("parsedZone:",parsedZone)

        for(let i in parsedZone) {
            if(this._devMode) console.log(`parsedZone[${i}]`, parsedZone[i].map(x => x.outerHTML))
        }


        
        let filmInfosElements_mapped = {
            /*"Origine": [],
            "Durée": [],
            "Réalisation": [],
            "Acteur": [],
            "Genre": [],
            "Année de production": [],
            "Titre original": [],
            "Critiques": [],
            "Bande annonce": [],*/
        }

        for(let i in filmInfosElements) {
            let e = filmInfosElements[i]
            let firstStrongText = e.filter(x => { return x.nodeName == "strong"})[0]?.getElementsByTagName("u")[0]?.textContent?.toLowerCase()?.trim() ?? null
            if(!firstStrongText) continue;

            let the_key;
            if(firstStrongText.includes("origine")) the_key = "Origine"
            else if(firstStrongText.includes("durée")) the_key = "Durée"
            else if(firstStrongText.includes("réalisation")) the_key = "Réalisation"
            else if(firstStrongText.includes("acteur")) the_key = "Acteur"
            else if(firstStrongText.includes("genre")) the_key = "Genre"
            else if(firstStrongText.includes("année")) the_key = "Année de production"
            else if(firstStrongText.includes("titre")) the_key = "Titre original"
            else if(firstStrongText.includes("critiques")) the_key = "Critiques"
            else if(firstStrongText.includes("bande")) the_key = "Bande annonce"
            else if(firstStrongText.includes("qualité")) the_key = "quality"
            else if(firstStrongText.includes("langue")) the_key = "language"
            else if(firstStrongText.includes("taille du fichier")) the_key = "fileSize"
            filmInfosElements_mapped[the_key] = e
        }


        for(let i in [...Object.keys(filmInfosElements_mapped)]) {
            let key = [...Object.keys(filmInfosElements_mapped)][i]
            
            if(this._devMode) console.log(`filmInfosElements_mapped[${key}]:`,filmInfosElements_mapped[key].map(x => x.outerHTML))
        }




        


        let getHashtagTextNumber = (elementContainer, n) => {
            return elementContainer.filter(x => { return x.nodeName == "#text"})[n] ?? false
        }

        let movieInfos = {
            name: filmInfosElements[7].filter(x => { return x.nodeName =="#text" })[0].textContent.trim(),
            synopsis: centerElements[2].filter(x => { return x.nodeName == "em" })[0].textContent.trim(),
            fileName: [...corpsElement.getElementsByTagName("center")].filter(x => {
                return (x.getElementsByTagName("font")[0]?.getAttribute("color") == "red")
            })[0].textContent.trim(),
            fileSize: filmInfosElements_mapped["fileSize"] ? (getHashtagTextNumber(filmInfosElements_mapped["fileSize"], 0)?.textContent?.trim() ?? null) : null,
            quality: filmInfosElements_mapped["quality"] ? (getHashtagTextNumber(filmInfosElements_mapped["quality"], 0)?.textContent?.trim() ?? null) : null,
            language: filmInfosElements_mapped["language"] ? (getHashtagTextNumber(filmInfosElements_mapped["language"], 0)?.textContent?.trim() ?? null) : null,
            origin: filmInfosElements_mapped["Origine"] ? (getHashtagTextNumber(filmInfosElements_mapped["Origine"], 0)?.textContent?.trim() ?? null) : null,
            duration: filmInfosElements_mapped["Durée"] ? (getHashtagTextNumber(filmInfosElements_mapped["Durée"], 0)?.textContent?.trim() ?? null) : null,
            director: this._getBaseURL() + encodeURI(centerElements[1].filter(x => { return x.nodeName == "a"})[0].getAttribute("href")),
            actors: filmInfosElements[4].filter(x => { return x.nodeName == "a" }).map(x => {
                return {
                    name: x.textContent,
                    url: this._getBaseURL() + encodeURI(x.getAttribute("href"))
                }
            }),
            genres: filmInfosElements[5].filter(x => { return x.nodeName == "a" }).map(x => {
                return {
                    name: x.textContent,
                    url: this._getBaseURL() + encodeURI(x.getAttribute("href"))
                }
            }),
            productionYear: filmInfosElements_mapped["Année de production"] ? (getHashtagTextNumber(filmInfosElements_mapped["Année de production"], 0)?.textContent?.trim() ?? null) : null,
            originalTitle: filmInfosElements_mapped["Titre original"] ? (getHashtagTextNumber(filmInfosElements_mapped["Titre original"], 0)?.textContent?.trim() ?? null) : null,
            review: filmInfosElements_mapped["Critiques"] ? (getHashtagTextNumber(filmInfosElements_mapped["Critiques"], 0)?.textContent?.trim() ?? null) : null,
            trailer: filmInfosElements_mapped["Bande annonce"] ? (filmInfosElements_mapped["Bande annonce"].filter(x => {
                try {
                    // if(this._devMode) console.log("x.getAttribute('href'):",x.getElementsByTagName("a")[0].getAttribute("href"))
                    return x.getElementsByTagName("a")[0].getAttribute("href").indexOf("allocine") != -1
                } catch(e) {
                    return false
                }
            })[0]?.getElementsByTagName("a")[0]?.getAttribute("href")?.trim() ?? null) : null,
            downloadLinks: null,
            streamingLinks: null
        }

        // if(this._devMode) console.log("infos:",movieInfos)


        // if(this._devMode) console.log("corpsElement:",corpsElement.outerHTML)


        // =============== SYNOPSIS ( centerElements[2] ) ===============
        
        /*
        if(this._devMode) console.log("centerElements:",centerElements[2].map(x => { return x.nodeName.trim() }))
        if(this._devMode) console.log("centerElements:",centerElements[2].map(x => { return x.outerHTML.trim() }))
        if(this._devMode) console.log("tagName:",centerElements[2].filter(x => { return x.nodeName == "em" }))
        */

        
        
        // =============== LIENS DE TELECHARGEMENT ===============

        
        let downloadLinksElements = [
            [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ]

        let all_cutsElement_dl = [
            `Liens De Téléchargement`,
            `Liens De Streaming`
        ]

        let downloadLinks_currentStep = 0

        let temp3 = [...corpsElement.childNodes]
        for(let i in temp3) {
            let e = temp3[i]
            // if(this._devMode) console.log("e.nodeName",e.nodeName)

            if(e.nodeName == "h2" && somef.anyWordInText(e.innerHTML, all_cutsElement_dl) ) { if(this._devMode) console.log("downloadLinks STEP +1"); downloadLinks_currentStep++ }

            downloadLinksElements[downloadLinks_currentStep].push(e)
        }

        for(let i in downloadLinksElements) {
            // if(this._devMode) console.log(`downloadLinksElements[${i}]:`, downloadLinksElements[i].map(x => x.outerHTML))
        }

        /*
        downloadLinksElements[1] : Liens De téléchargement
        downloadLinksElements[2] : Liens De Streaming

        */

        // ===================== LIENS DE TELECHARGEMENT only  ========================


        function parseDownloadLinks(downloadLinksElements_number) {
            let onlyDownloadLinksElement = downloadLinksElements_number.filter(x => { return x.getAttribute("id") == "news-id-23557" })[0].getElementsByClassName("postinfo")[0]
            let downloadLinksElements_dlprotect = [
                [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
            ]
            let downloadLinks_dlprotect_currentStep = 0
            let lastWasBr = false

            let temp4 = [...onlyDownloadLinksElement.childNodes]
            for(let i in temp4) {
                let e = temp4[i]
                // if(this._devMode) console.log(".nodeName",e.nodeName)
                if(e.nodeName == "#text") continue;

                if(e.nodeName == "br" && !lastWasBr) {
                    downloadLinks_dlprotect_currentStep++
                    lastWasBr = true
                    continue;
                }
                lastWasBr = false                
                downloadLinksElements_dlprotect[downloadLinks_dlprotect_currentStep].push(e)
            }

            for(let i in downloadLinksElements_dlprotect) {
                // if(this._devMode) console.log(`downloadLinksElements_dlprotect[${i}]`, downloadLinksElements_dlprotect[i].map(x => x.outerHTML))
            }


            /*for(let i in downloadLinksElements_dlprotect) {
                if(this._devMode) console.log(`downloadLinksElements_dlprotect[${i}]:`, downloadLinksElements_dlprotect[i].map(x => x.outerHTML))
            }*/

            let downloadLinksMapped = downloadLinksElements_dlprotect.filter(x => {
                return x.filter(x => x.nodeName == "b").length == 2
            }).map(x => {
                return {
                    service: x.filter(x => x.nodeName == "b")[0].textContent.trim(),
                    url: x.filter(x => x.nodeName == "b")[1].getElementsByTagName("a")[0].getAttribute("href").trim(),
                }
            })
            return downloadLinksMapped
        }

        movieInfos.downloadLinks = parseDownloadLinks(downloadLinksElements[1])

        // ===================== LIENS DE TELECHARGEMENT only  ========================

        movieInfos.streamingLinks = parseDownloadLinks(downloadLinksElements[2])

        // ===================== ======================== ========================
        










        let backPayload = {
            movieInfos: movieInfos,
            otherVersions: versions,
        }

        // if(this._devMode) console.log("backPayload:",backPayload)

        return backPayload

    }

}

let ZT = new ZoneTelechargementParser()


let a = async () => {
    
    // console.log(JSON.stringify(await ZT.getMovieDetails("8726"),null,4))
    // ZT.getMovieDetails("42023")
    // console.log(await ZT.search("films","transformer"))
    //ZT.search("films","transformer")
}
a()


module.exports = new ZoneTelechargementParser()