const axios = require("axios")

var DomParser = require('dom-parser');
var somef = require('./someFunctions');
var parser = new DomParser();

class ZoneTelechargementParser {
    constructor() {
        this._ZTBaseURL = `https://www.zone-telechargement.homes` 
        this._allCategories = [ "films", "series", "jeux", "musiques", "mangas", "ebooks", "autres-videos", "logiciels", "mobiles" ]
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
            console.log(e)
            return s
        }
    };



    _getPayloadURLFromQuery(category, query) {
        category = category.trim().toLowerCase()
        if(!this._allCategories.includes(category)) throw new Error(`_getPayloadURLFromQuery(): Category must be one in the following list: ${this._getAllCategories().join(", ")}`)
        return this._getBaseURL() + `/?p=${category}&search=${encodeURI(query)}`
    }

    async _getDOMElementFromURL(url) {
        let response = await axios.get(url)
        let document = parser.parseFromString(response.data)
        return document
    }

    async search(category, query) {
        try {

            let payloadURL = this._getPayloadURLFromQuery(category, query)

            let document = await this._getDOMElementFromURL(payloadURL)

            let movieList_elements = [...document.getElementById("dle-content").childNodes].filter(x => { return x.getAttribute("class") == "cover_global" })



            let responseMovieList = []

            if(movieList_elements.length == 0) { return responseMovieList }

            for(let i in movieList_elements) {
                let elem = movieList_elements[i]

                let movieDatas = {
                    "title": [...elem.getElementsByTagName("div")].filter(x => {
                        return x.getAttribute("class") == "cover_infos_title"
                    })[0].getElementsByTagName("a")[0].textContent,
                    "url": this._getBaseURL() + [...elem.getElementsByTagName("div")].filter(x => {
                        return x.getAttribute("class") == "cover_infos_title"
                    })[0].getElementsByTagName("a")[0].getAttribute("href"),
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

            console.log("aaaaa:",[...movieList_elements[2].getElementsByTagName("div")].filter(x => {
                return x.getAttribute("class") == "cover_infos_title"
            })[0].getElementsByClassName("detail_release")[0].getElementsByTagName("b")[0].textContent)


            // console.log("responseMovieList:",responseMovieList)

            return responseMovieList
        
        } catch(e) {
            console.log(e)
            return {
                status: false,
                error: `${e}`,
                stack: e.stack.split("\n"),
            }
        }
    }


    async getMovieDetails(movieURL) {

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
        let version_list_a = [...otherversions_div.getElementsByTagName("a")]
        let versions = version_list_a.map(x => {
                return {
                    url: this._getBaseURL() + x.getAttribute("href"),
                    quality: x.getElementsByTagName("b")[0].textContent,
                    language: this._getMatchingGroups(x.getElementsByTagName("b")[1].textContent)[0],
                }
        })
        // console.log("version1:",otherversions_div)
        // console.log("version2:",version_list_a)
        // console.log("version3:",versions)
        
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
            // console.log("e.nodeName",e.nodeName)

            if(e.nodeName == "img" && all_cutsElement_src.includes(e.getAttribute("src"))) { currentStep++ }
            // console.log(`\n\n\n\n=======\n\n centerElements[${currentStep}]`,centerElements[currentStep])
            centerElements[currentStep].push(e)
        }
        
        
        // =============== FILM INFOS ( centerElements[1] ) ===============

        
        let filmInfosElements = [
            [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ]

        let all_cutsElement_src2 = [
            `Origine`,
            `Durée`,
            `Réalisation`,
            `Acteur`,
            `Genre`,
            `Année de production`,
            `Titre original`,
            `Critiques`,
            `Bande annonce`
        ]

        let filmInfos_currentStep = 0

        let temp2 = [...center_element.childNodes]
        for(let i in temp2) {
            let e = temp2[i]
            // console.log("e.nodeName",e.nodeName)

            if(e.nodeName == "strong" && somef.anyWordInText(e.innerHTML, all_cutsElement_src2) ) { filmInfos_currentStep++ }

            filmInfosElements[filmInfos_currentStep].push(e)
        }

        for(let i in filmInfosElements) {
            console.log(filmInfosElements[i].map(x => x.outerHTML))
        }

        console.log("centerElements[1]:",centerElements[1].map(x => { return x.outerHTML.trim() }))
        console.log("centerElements[1]:",centerElements[1].map(x => { return x.nodeName }))

        let getHashtagTextNumber = n => {
            return centerElements[1].filter(x => { return x.nodeName == "#text"})[n] ?? {}
        }

        let movieInfos = {
            name: filmInfosElements[7].filter(x => { return x.nodeName =="#text" })[0].textContent.trim(),
            synopsis: centerElements[2].filter(x => { return x.nodeName == "em" })[0].textContent.trim(),
            fileName: [...corpsElement.getElementsByTagName("center")].filter(x => {
                return (x.getElementsByTagName("font")[0]?.getAttribute("color") == "red")
            })[0].textContent.trim(),
            origin: getHashtagTextNumber(2).textContent.trim(),
            duration: getHashtagTextNumber(4).textContent.trim(),
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
            productionYear: getHashtagTextNumber(19).textContent.trim(),
            originalTitle: getHashtagTextNumber(21).textContent.trim(),
            review: getHashtagTextNumber(23).textContent.trim(),
            trailer: centerElements[1].filter(x => {
                try {
                    console.log("x.getAttribute('href'):",x.getElementsByTagName("a")[0].getAttribute("href"))
                    return x.getElementsByTagName("a")[0].getAttribute("href").indexOf("allocine") != -1
                } catch(e) {
                    return false
                }
            })[0]?.getElementsByTagName("a")[0]?.getAttribute("href")?.trim() ?? null
        }

        console.log("infos:",movieInfos)


        // =============== SYNOPSIS ( centerElements[2] ) ===============
        
        /*
        console.log("centerElements:",centerElements[2].map(x => { return x.nodeName.trim() }))
        console.log("centerElements:",centerElements[2].map(x => { return x.outerHTML.trim() }))
        console.log("tagName:",centerElements[2].filter(x => { return x.nodeName == "em" }))
        */


        let backPayload = {
            movieInfos: movieInfos,
            otherVersions: versions,
        }

        // console.log("backPayload:",backPayload)

        return backPayload

    }

}

let ZT = new ZoneTelechargementParser()

// await ZT.search("star wars")

module.exports = new ZoneTelechargementParser()