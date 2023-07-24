
const axios = require("axios")

var DomParser = require('dom-parser');
const { ConnectionPoolClearedEvent } = require("mongodb");
var parser = new DomParser();

class ZoneTelechargementParser {
    constructor() {
        this._ZTBaseURL = `https://www.zone-telechargement.homes` 
    }

    _getPayloadURLFromQuery(query) {
        return this._getBaseURL() + `/?search=${encodeURI(query)}`
    }
    _getBaseURL() { return this._ZTBaseURL }

    async _getDOMElementFromURL(url) {
        let response = await axios.get(url)
        let document = parser.parseFromString(response.data)
        return document
    }

    async search(category, query) {
        try {

            let payloadURL = this._getPayloadURLFromQuery(query)

            let document = await this._getDOMElementFromURL(payloadURL)

            let movieList_elements = [...document.getElementById("dle-content").childNodes].filter(x => { return x.className == "cover_global" })

            for(let i in movieList_elements) {
                let elem = movieList_elements[i]

                let movieDatas = {
                    "title": [...elem.getElementsByTagName("div")].filter(x => {
                        return x.className == "cover_infos_title"
                    })[0].getElementsByTagName("a").textContent,
                    "url": this._getBaseURL() + [...elem.getElementsByTagName("div")].filter(x => {
                        return x.className == "cover_infos_title"
                    })[0].getElementsByTagName("a").href,
                    "image": this._getBaseURL() + [...elem.getElementsByTagName("img")].filter(x => {
                        return x.className == "mainimg"
                    })[0].src,
                }

            }
        
        } catch(e) {
            return {
                status: true,
                error: `${e}`,
                stack: e.stack,
            }
        }
    }


    async getMovieDetails(movieURL) {

        if(!movieURL.startsWith(this._getBaseURL())) return {
            status: false,
            error: `Wrong base URL provided`
        }

        let document = await this._getDOMElementFromURL(movieURL)

        let mainElement = (
            document.getElementById("dle-content")
            .getElementsByClassName("base")[0]
            .getElementsByClassName("maincont")[0]
            .getElementsByClassName("corps")[0]
            .getElementsByTagName("div")[0]
        );

        var getMatchingGroups = function(s) {
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

        let otherversions_div = mainElement.getElementsByClassName("otherversions")[0]
        let version_list_a = [...otherversions_div.getElementsByTagName("a")]
        let versions = version_list_a.map(x => {
                return {
                    url: this._getBaseURL() + x.getAttribute("href"),
                    quality: x.getElementsByTagName("b")[0].textContent,
                    language: getMatchingGroups(x.getElementsByTagName("b")[1].textContent)[0],
                }
        })
        // console.log("version1:",otherversions_div)
        // console.log("version2:",version_list_a)
        // console.log("version3:",versions)


        let backPayload = {
            fileName: [...document.getElementById("lecorps").getElementsByTagName("center")].filter(x => {
                return (x.getElementsByTagName("font")[0]?.getAttribute("color") == "red")
            })[0],
            otherVersions: versions,
        }

        console.log("backPayload:",backPayload)
        
        return backPayload

        console.log("backPayload:",backPayload)

        let center_element = mainElement.getElementsByTagName("center")


        let centerElements =[]

        let all_cutsElement_src = [
            `/templates/zone/images/infos_film.png`,
            `/templates/zone/images/synopsis.png`,
            `/templates/zone/images/infos_upload.png`,
            `/templates/zone/images/liens.png`,
        ]

        
        new_temp = []
        let temp = [...center_element.childNodes]
        let synopsis_found = false
        for(let i in temp) {
            e = temp[i]
            if(!synopsis_found) {
                if(e.tagName != "IMG") continue;
                if(!e.src | !e.src.includes("synopsis")) continue;
                synopsis_found = true
            }
            new_temp.push(e)
        }
        new_temp.getElementsByTagName("em")[0].textContent
        

    }



}

let ZT = new ZoneTelechargementParser()

await ZT.search("star wars")

module.exports = new ZoneTelechargementParser()