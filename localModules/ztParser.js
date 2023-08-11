/**
 * @name ztParser
 * @author Sylicium
 * @date 09/08/2023
 * @version 1.7.0
 * @github https://github.com/Sylicium/zone-telechargement-api/
 */

const axios = require("axios")
const cheerio = require("cheerio");

var somef = require('./someFunctions');

class ZoneTelechargementParser {
    constructor(devMode=false,timeStamp=false, axiosRequestTimeInBetween=300) {
        this._ZTBaseURL = `https://www.zone-telechargement.homes` 
        this._allCategories = [ "films", "series", "jeux", "musiques", "mangas", "ebooks", "autres-videos", "logiciels", "mobiles" ]
        this._lastAxiosRequestTimestamp = 0 // Do not edit this value. used as temp
        this._axiosRequestTimeInBetween = axiosRequestTimeInBetween // Default: 300 - In milliseconds. Minimum time to wait between each requests to the base URL. Low values can cause functions to crash due to HTPP error 520 from axios. (Or rate limit errors)
        this._devMode = devMode;
        this._devMode && console.log("ztParser: Dev mode enabled.")
        this._timeStamp = timeStamp
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
        if (this._timeStamp){
            console.log("========================================================")
            console.log("A:",Date.now()-this._lastAxiosRequestTimestamp)
            console.log("B:",this._axiosRequestTimeInBetween)
            console.log("C:",this._axiosRequestTimeInBetween - (Date.now()-this._lastAxiosRequestTimestamp))
            console.log("--------------------------------------------------------")
        }
        if (Date.now() - this._lastAxiosRequestTimestamp < this._axiosRequestTimeInBetween) {
            await somef.sleep(this._axiosRequestTimeInBetween - (Date.now() - this._lastAxiosRequestTimestamp));
        }
        this._lastAxiosRequestTimestamp = Date.now();

        const response = await axios.get(url);
        return cheerio.load(response.data);
    }

    async _parseMoviesFromSearchQuery(category, query, page) {
        const payloadURL = this._getPayloadURLFromQuery(category, query, page);
        const $ = await this._getDOMElementFromURL(payloadURL);
    
        const movieList_elements = $("#dle-content .cover_global");
        const responseMovieList = [];
    
        if (movieList_elements.length === 0) {
            return responseMovieList;
        }
    
        movieList_elements.each((index, element) => {
            const elem = $(element);
    
            const titleAnchor = elem.find(".cover_infos_title a");
            const the_url = this._getBaseURL() + titleAnchor.attr("href");
    
            const detail_release = elem.find(".cover_infos_global .detail_release");

            const publishDate = new Date(elem.find("time").text());
    
            const movieDatas = {
                title: titleAnchor.text(),
                url: the_url,
                id: the_url.match(/[?&]id=[0-9]{1,5}\-/gmi)[0].match(/\d+/)[0],
                image: this._getBaseURL() + elem.find("img").attr("src"),
                quality: detail_release.find("span:eq(0)").text(),
                language: detail_release.find("span:eq(1)").text(),
                publishedOn: publishDate,
                publishedTimestamp: publishDate.getTime(),
            };
            responseMovieList.push(movieDatas);
        });
    
        return responseMovieList;
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
                console.log(`Added ${tempMovieList.length} movies from page ${searchPage}`)
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



    async getPageDatas(movieID) {
        // A refaire entierement

        
        // let movieURL = this._getBaseURL() + `?p=film&id=${movieID}` // FILM sans S car page de description de UN seul film

        // if(!movieURL.startsWith(this._getBaseURL())) return {
        //     status: false,
        //     error: `Wrong base URL provided`
        // }

        // if(this._devMode) console.log("movieURL:",movieURL)
        
        // let document = await this._getDOMElementFromURL(movieURL)

        // let corpsElement = (
        //     document.getElementById("dle-content")
        //     .getElementsByClassName("base")[0]
        //     .getElementsByClassName("maincont")[0]
        //     .getElementsByClassName("corps")[0]
        // );
        // let mainElement = (
        //     corpsElement
        //     .getElementsByTagName("div")[0]
        // );


        // let otherversions_div = mainElement.getElementsByClassName("otherversions")[0]
        // let version_list_a = [...otherversions_div.getElementsByTagName("a")]
        // let versions = version_list_a.map(x => {
        //         return {
        //             url: this._getBaseURL() + x.getAttribute("href"),
        //             quality: x.getElementsByTagName("b")[0].textContent,
        //             language: this._getMatchingGroups(x.getElementsByTagName("b")[1].textContent)[0],
        //         }
        // })
        // // if(this._devMode) console.log("version1:",otherversions_div)
        // // if(this._devMode) console.log("version2:",version_list_a)
        // // if(this._devMode) console.log("version3:",versions)
        
        // let center_element = mainElement.getElementsByTagName("center")[0]


        // let centerElements = [
        //     [], [], [], [], [], [], [], [], [], [], [], [], [], []
        // ]

        // let all_cutsElement_src = [
        //     `/templates/zone/images/infos_film.png`,
        //     `/templates/zone/images/synopsis.png`,
        //     `/templates/zone/images/infos_upload.png`,
        //     `/templates/zone/images/liens.png`,
        // ]

        // let currentStep = 0

        // let temp = [...center_element.childNodes]
        // for(let i in temp) {
        //     let e = temp[i]
        //     // if(this._devMode) console.log("e.nodeName",e.nodeName)

        //     if(e.nodeName == "img" && all_cutsElement_src.includes(e.getAttribute("src"))) { currentStep++ }
        //     // if(this._devMode) console.log(`\n\n\n\n=======\n\n centerElements[${currentStep}]`,centerElements[currentStep])
        //     centerElements[currentStep].push(e)
        // }
        
        
        // // =============== FILM INFOS ( centerElements[1] ) ===============

        
        // let filmInfosElements = [
        //     [], [], [], [], [], [], [], [], [], [], [], [], [], []
        // ]

        // let all_cutsElement_src2 = [
        //     `Origine`,
        //     `Durée`,
        //     `Réalisation`,
        //     `Acteur`,
        //     `Genre`,
        //     `Année de production`,
        //     `Titre original`,
        //     `Critiques`,
        //     `Bande annonce`
        // ]

        // let filmInfos_currentStep = 0

        // let temp2 = [...center_element.childNodes]
        // for(let i in temp2) {
        //     let e = temp2[i]
        //     // if(this._devMode) console.log("e.nodeName",e.nodeName)

        //     if(e.nodeName == "strong" && somef.anyWordInText(e.innerHTML, all_cutsElement_src2) ) { filmInfos_currentStep++ }

        //     filmInfosElements[filmInfos_currentStep].push(e)
        // }

        // for(let i in filmInfosElements) {
        //     if(this._devMode) console.log(filmInfosElements[i].map(x => x.outerHTML))
        // }

        // // if(this._devMode) console.log("centerElements[1]:",centerElements[1].map(x => { return x.outerHTML.trim() }))
        // // if(this._devMode) console.log("centerElements[1]:",centerElements[1].map(x => { return x.nodeName }))


        
        
        // let filmInfosElements_mapped = {
        //     /*"Origine": [],
        //     "Durée": [],
        //     "Réalisation": [],
        //     "Acteur": [],
        //     "Genre": [],
        //     "Année de production": [],
        //     "Titre original": [],
        //     "Critiques": [],
        //     "Bande annonce": [],*/
        // }

        // for(let i in filmInfosElements) {
        //     let e = filmInfosElements[i]
        //     let firstStrongText = e.filter(x => { return x.nodeName == "strong"})[0]?.getElementsByTagName("u")[0]?.textContent?.toLowerCase()?.trim() ?? null
        //     if(!firstStrongText) continue;

        //     let the_key;
        //     if(firstStrongText.includes("origine")) the_key = "Origine"
        //     else if(firstStrongText.includes("durée")) the_key = "Durée"
        //     else if(firstStrongText.includes("réalisation")) the_key = "Réalisation"
        //     else if(firstStrongText.includes("acteur")) the_key = "Acteur"
        //     else if(firstStrongText.includes("genre")) the_key = "Genre"
        //     else if(firstStrongText.includes("année")) the_key = "Année de production"
        //     else if(firstStrongText.includes("titre")) the_key = "Titre original"
        //     else if(firstStrongText.includes("critiques")) the_key = "Critiques"
        //     else if(firstStrongText.includes("bande")) the_key = "Bande annonce"
        //     filmInfosElements_mapped[the_key] = e
        // }


        // for(let i in [...Object.keys(filmInfosElements_mapped)]) {
        //     let key = [...Object.keys(filmInfosElements_mapped)][i]
            
        //     if(this._devMode) console.log(`filmInfosElements_mapped[${key}]:`,filmInfosElements_mapped[key].map(x => x.outerHTML))
        // }




        // let getHashtagTextNumber = (elementContainer, n) => {
        //     return elementContainer.filter(x => { return x.nodeName == "#text"})[n] ?? false
        // }

        // let movieInfos = {
        //     name: filmInfosElements[7].filter(x => { return x.nodeName =="#text" })[0].textContent.trim(),
        //     synopsis: centerElements[2].filter(x => { return x.nodeName == "em" })[0].textContent.trim(),
        //     fileName: [...corpsElement.getElementsByTagName("center")].filter(x => {
        //         return (x.getElementsByTagName("font")[0]?.getAttribute("color") == "red")
        //     })[0]?.textContent.trim() ?? null,
        //     origin: filmInfosElements_mapped["Origine"] ? (getHashtagTextNumber(filmInfosElements_mapped["Origine"], 0)?.textContent?.trim() ?? null) : null,
        //     duration: filmInfosElements_mapped["Durée"] ? (getHashtagTextNumber(filmInfosElements_mapped["Durée"], 0)?.textContent?.trim() ?? null) : null,
        //     director: this._getBaseURL() + encodeURI(centerElements[1].filter(x => { return x.nodeName == "a"})[0].getAttribute("href")),
        //     actors: filmInfosElements[4].filter(x => { return x.nodeName == "a" }).map(x => {
        //         return {
        //             name: x.textContent,
        //             url: this._getBaseURL() + encodeURI(x.getAttribute("href"))
        //         }
        //     }),
        //     genres: filmInfosElements[5].filter(x => { return x.nodeName == "a" }).map(x => {
        //         return {
        //             name: x.textContent,
        //             url: this._getBaseURL() + encodeURI(x.getAttribute("href"))
        //         }
        //     }),
        //     productionYear: filmInfosElements_mapped["Année de production"] ? (getHashtagTextNumber(filmInfosElements_mapped["Année de production"], 0)?.textContent?.trim() ?? null) : null,
        //     originalTitle: filmInfosElements_mapped["Titre original"] ? (getHashtagTextNumber(filmInfosElements_mapped["Titre original"], 0)?.textContent?.trim() ?? null) : null,
        //     review: filmInfosElements_mapped["Critiques"] ? (getHashtagTextNumber(filmInfosElements_mapped["Critiques"], 0)?.textContent?.trim() ?? null) : null,
        //     trailer: filmInfosElements_mapped["Bande annonce"] ? (filmInfosElements_mapped["Bande annonce"].filter(x => {
        //         try {
        //             // if(this._devMode) console.log("x.getAttribute('href'):",x.getElementsByTagName("a")[0].getAttribute("href"))
        //             return x.getElementsByTagName("a")[0].getAttribute("href").indexOf("allocine") != -1
        //         } catch(e) {
        //             return false
        //         }
        //     })[0]?.getElementsByTagName("a")[0]?.getAttribute("href")?.trim() ?? null) : null,
        //     downloadLinks: null,
        //     streamingLinks: null
        // }

        // if(this._devMode) console.log("infos:",movieInfos)


        // // =============== SYNOPSIS ( centerElements[2] ) ===============
        
        // /*
        // if(this._devMode) console.log("centerElements:",centerElements[2].map(x => { return x.nodeName.trim() }))
        // if(this._devMode) console.log("centerElements:",centerElements[2].map(x => { return x.outerHTML.trim() }))
        // if(this._devMode) console.log("tagName:",centerElements[2].filter(x => { return x.nodeName == "em" }))
        // */


        
        // // =============== LIENS DE TELECHARGEMENT ===============

        
        // let downloadLinksElements = [
        //     [], [], [], [], [], [], [], [], [], [], [], [], [], []
        // ]

        // let all_cutsElement_dl = [
        //     `Liens De Téléchargement`,
        //     `Liens De Streaming`
        // ]

        // let downloadLinks_currentStep = 0

        // let temp3 = [...corpsElement.childNodes]
        // for(let i in temp3) {
        //     let e = temp3[i]
        //     // if(this._devMode) console.log("e.nodeName",e.nodeName)

        //     if(e.nodeName == "h2" && somef.anyWordInText(e.innerHTML, all_cutsElement_dl) ) { console.log("downloadLinks STEP +1"); downloadLinks_currentStep++ }

        //     downloadLinksElements[downloadLinks_currentStep].push(e)
        // }

        // for(let i in downloadLinksElements) {
        //     // if(this._devMode) console.log(`downloadLinksElements[${i}]:`, downloadLinksElements[i].map(x => x.outerHTML))
        // }

        // /*
        // downloadLinksElements[1] : Liens De téléchargement
        // downloadLinksElements[2] : Liens De Streaming

        // */

        // // ===================== LIENS DE TELECHARGEMENT only  ========================


        // function parseDownloadLinks(downloadLinksElements_number) {
        //     let onlyDownloadLinksElement = downloadLinksElements_number.filter(x => { return x.getAttribute("id") == "news-id-23557" })[0].getElementsByClassName("postinfo")[0]
        //     let downloadLinksElements_dlprotect = [
        //         [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        //     ]
        //     let downloadLinks_dlprotect_currentStep = 0
        //     let lastWasBr = false

        //     let temp4 = [...onlyDownloadLinksElement.childNodes]
        //     for(let i in temp4) {
        //         let e = temp4[i]
        //         // if(this._devMode) console.log(".nodeName",e.nodeName)
        //         if(e.nodeName == "#text") continue;

        //         if(e.nodeName == "br" && !lastWasBr) {
        //             downloadLinks_dlprotect_currentStep++
        //             lastWasBr = true
        //             continue;
        //         }
        //         lastWasBr = false                
        //         downloadLinksElements_dlprotect[downloadLinks_dlprotect_currentStep].push(e)
        //     }

        //     for(let i in downloadLinksElements_dlprotect) {
        //         // if(this._devMode) console.log(`downloadLinksElements_dlprotect[${i}]`, downloadLinksElements_dlprotect[i].map(x => x.outerHTML))
        //     }


        //     /*for(let i in downloadLinksElements_dlprotect) {
        //         if(this._devMode) console.log(`downloadLinksElements_dlprotect[${i}]:`, downloadLinksElements_dlprotect[i].map(x => x.outerHTML))
        //     }*/

        //     let downloadLinksMapped = downloadLinksElements_dlprotect.filter(x => {
        //         return x.filter(x => x.nodeName == "b").length == 2
        //     }).map(x => {
        //         return {
        //             service: x.filter(x => x.nodeName == "b")[0].textContent.trim(),
        //             url: x.filter(x => x.nodeName == "b")[1].getElementsByTagName("a")[0].getAttribute("href").trim(),
        //         }
        //     })
        //     return downloadLinksMapped
        // }

        // movieInfos.downloadLinks = parseDownloadLinks(downloadLinksElements[1])

        // // ===================== LIENS DE TELECHARGEMENT only  ========================

        // movieInfos.streamingLinks = parseDownloadLinks(downloadLinksElements[2])

        // // ===================== ======================== ========================
        





        // let backPayload = {
        //     movieInfos: movieInfos,
        //     otherVersions: versions,
        // }

        // // console.log("backPayload:",backPayload)

        // return backPayload

    }
}

module.exports = new ZoneTelechargementParser()