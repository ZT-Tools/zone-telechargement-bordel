
/**
 * @version 2.1.0 // 26/07/2023
 * @author Sylicium
 * @description Module someFunction qui réunit plein de fonction utiles
 *
*/

const fs = require("fs")


let config = require("../config")

/**
 * f() : Update l'account dans sont account.user ainsi que ses régions
 * param {} bot - Le bot
 * param {number} user_id - ID du membre à update
 * param {array} members - Variable globale Members
*/



module.exports.isSuperAdmin = isSuperAdmin
/**
 * f() : Booléen qui retourne true si l'ID est celui d'un SuperAdmin
 * @param {string} user_id - L'id de l'utilisateur a check
 */
function isSuperAdmin(user_id) {
    return ( config.superAdminList.indexOf(user_id) != -1 )
}

module.exports.shuffle = shuffle
/**
 * f() : Mélange aléatoirement la liste donnée.
 * @param {Array} list - La liste a mélanger
 */
function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
}


module.exports.sum = sum
/**
 * f() : Retourne la somme de tous les éléments de la liste
 * @param {Array} list - La liste en entrée
 */
function sum(list) {
    return list.reduce((partialSum, a) => partialSum + a, 0);
}

module.exports.choice = choice
/**
 * f() : Retourne un élément àléatoire de la liste
 * @param {Array} list - La liste en entrée
 */
function choice(list) {
    return list[Math.floor(Math.random()*list.length)]
}

module.exports.genHex = genHex
/**
 * f() : Retourne une chaine héxadécimale de la longueur voulue
 * @param {Number} length - Longueur de la chaine voulue
 * @param {Boolean} capitalize - Mettre la chaine en caractères majuscule
 */
function genHex(length, capitalize=false) {
    let str = [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    return (capitalize ? str.toUpperCase() : str.toLowerCase())
}

module.exports.any = any
/**
 * f() : Retourne true si au moins 1 élément se trouve dans les 2 listes
 * @param {Array} list - La 1ere liste
 * @param {Array} list_two - La 2ere liste
 * @param {Boolean} caseSensitive - Prendre en compte ou non la casse. Default: true
 */
function any(list, list_two, caseSensitive=true) {
    if(!caseSensitive) {
        list = list.map(f=>{ return f.toLowerCase(); });
        list_two = list_two.map(f=>{ return f.toLowerCase(); });
    }
    for(let i in list) {
        if(list_two.indexOf(list[i]) != -1) return true
    }
    return false
}

module.exports.anyWordInText = anyWordInText
/**
 * f() : Retourne true si au moins 1 élément se trouve dans le texte
 * @param {String} text - Le texte
 * @param {Array} list - La liste
 * @param {Boolean} caseSensitive - Prendre en compte ou non la casse. Default: true
 */
function anyWordInText(text, list, caseSensitive=true) {
    if(!caseSensitive) {
        list = list.map(f=>{ return f.toLowerCase(); });
        text = text.toLowerCase()
    }
    for(let i in list) {
        if(text.indexOf(list[i]) != -1) return true
    }
    return false
}

module.exports.all = all
/**
 * f() : Retourne true si tous les éléments de la liste A se trouvent dans la B
 * @param {Array} from_list - La liste qui doit être contenue intégralement dans la 2eme
 * @param {Array} list_in - La liste qui doit contenir chaque élement de la 1ere
 * @param {Boolean} caseSensitive - Prendre en compte ou non la casse. Default: true
 */
function all(from_list, list_in, caseSensitive=true) {
    if(!caseSensitive) {
        list = list.map(f=>{ return f.toLowerCase(); });
        list_two = list_two.map(f=>{ return f.toLowerCase(); });
    }
    
    for(let i in from_list) {
        if(list_in.indexOf(from_list[i]) == -1) return false
    }
    return true
}

module.exports.isScam = isScam
/**
 * f() : Renvoie True si le texte entré est détecté comme une arnaque Version 1.1.1 | 21/06/2022
 * @param {String} text - La chaine de texte à tester
 */
function isScam(text) {
    /*
    Dependencies: compareString()
    https://github.com/Discord-AntiScam/scam-links/blob/main/urls.json
    */
    text = text.toLowerCase()
    let _list = text.split(" ")
    let _links = _list.filter(a => ( a.startsWith("http://") || a.startsWith("https://") ))

    //let blacklistedLinks = fs.readFileSync("./datas/static/frequentScamLinks.txt","utf-8").split("\n").map(elem => elem.trim())
    let blacklistedLinks = JSON.parse(fs.readFileSync("./datas/static/frequentScamLinks.txt", "utf-8"))
    blacklistedLinks = blacklistedLinks.map(link => {
        let l = link.replace("http://","")
        if(!l.startsWith("https://")) return `https://${l}`
        else return l
    })
    let whitelistedLinks = [
        "https://discord.com",
        "https://discordapp.com",
        "https://dis.gd"
    ]

    let _linkscore_list = []
    for(let link in _links) {
        for(let scamLink in blacklistedLinks) {
            let s_to_test = _links[link].split("/")
            s_to_test.splice(3)
            if(s_to_test[2]) {
                let extention = ""
                extention = s_to_test[2].split(".")
                extention.pop()
                extention = extention.join(".")
            }
            s_to_test = s_to_test.join("/").replace("http://","https://")
            if(!s_to_test.startsWith("https://")) s_to_test = `https://${s_to_test}`
            
            if(whitelistedLinks.indexOf(s_to_test) != -1) {
                
            } else {
                let _temp = compareString(s_to_test, blacklistedLinks[scamLink])
                let checkWhitelist = []
                for(let i in whitelistedLinks) {
                    checkWhitelist.push(compareString(s_to_test, whitelistedLinks[i]))
                }
                // console.log(`${s_to_test} AND ${blacklistedLinks[scamLink]} => +${_temp}`)
                let _maxTemp = Math.max(_temp, ...checkWhitelist)
                _linkscore_list.push(_maxTemp)
            }
        }
    }
    let _linkscore = Math.max(..._linkscore_list)
    if(_linkscore_list.length == 0) _linkscore = 0
    // console.log("_linkscore:",_linkscore)

    let _score_max = 80 // _score va jusqu'à X
    let _score = _linkscore*10 // 10 max

    function calcScorePercent() {
        let temp = (_score >= _score_max/2)
        if(temp >= 1) temp = 1
        let temp2 = _score/_score_max
        if(temp2 >= 1) temp2 = 1
        return temp2
    }

    if(_linkscore >= 0.9) return {
        scam: true,
        score: calcScorePercent(),
        info: "Link score above 0.9"
    }


    if(text.startsWith("@everyone")) _score += 20 // 40


    let blacklistedWords = [
        "free nitro",
        "steam nitro",
        "nitro steam",
        "nitro from steam",
        "free steam",
        "fast free nitro",
        "get your nitro",
        "take nitro faster",
        "running out",
        "some nitro left",
        "nitro left over here",
        "nitro left over there",
        "this gift is for you bro",
        "aaaaaaaaaaaaaaa"
    ]
    for(let word in blacklistedWords) { // 20 max
        if(text.indexOf(blacklistedWords[word]) != -1) {
            _score += 16
        }
    }
    

    return {
        scam: (_score >= _score_max/2),
        score: calcScorePercent(),
        info: ( (_score >= _score_max/2) ? "Global score above 0.5" : "Global score under 0.5")
    }

    // https://discrod-gifts.org/welcomes
    // if(isScamLinkScore(link) >= 0.5) return true

}


module.exports.isScamScore = isScamLinkScore
/**
 * f() : Retourne un booléen pour savoir si ce lien est un lien d'arnaque
 * @param {String} link - Le lien a tester
 */
function isScamLinkScore(link) {
    
    return false
    // https://discrod-gifts.org/welcomes

    
}

let _normalize = (str) => { return (`${str}`.normalize('NFKD').replace(/[^\w ]/g, '')).toLowerCase().replace(/\s+/g, ' ').trim() }
module.exports._normalize = _normalize

module.exports.capitalize = (str) => { return `${str[0].toUpperCase()}${str.slice(1)}` }

module.exports.formatTime = formatTime
function formatTime(millisecondes, format) {
    /*
    Renvoie un dictionnaire avec le formatage de la durée en ms, en jour, heures, etc...
    YYYY: year
    MM: month
    DDDDD: jour de l'année
    DD: jours du mois
    hh: heure
    mm: minute
    ss: seconde
    */
    let v = {
        y: 31536000000,
        mo: 2628000000,
        d: 86400000,
        h: 3600000,
        m: 60000,
        s: 1000
    }
    let la_date = {
        years: Math.floor(millisecondes / v.y),
        months: Math.floor((millisecondes % v.y) / v.mo), // value de l'année divisée en douze poue faire à peu pres
        all_days: Math.floor(millisecondes / v.d), // jours de l'année
        days: Math.floor(((millisecondes % v.y) % v.mo) / v.d), // jours du mois
        hours: Math.floor((((millisecondes % v.y) % v.mo) % v.d) / v.h),
        minutes: Math.floor(((((millisecondes % v.y) % v.mo) % v.d) % v.h) / v.m),
        seconds: Math.floor((((((millisecondes % v.y) % v.mo) % v.d) % v.h) % v.m) / v.s),
        milliseconds: (((((millisecondes % v.y) % v.mo) % v.d) % v.h) % v.m) % v.s
    }
    //console.log(la_date)

    function formatThis(thing, length = 2) {
        return `0000${thing}`.substr(-length)
    }

    let return_string = format.replace("YYYY", la_date.years).replace("MM", formatThis(la_date.months)).replace("DDDDD", la_date.all_days).replace("DD", formatThis(la_date.days)).replace("hh", formatThis(la_date.hours)).replace("mm", formatThis(la_date.minutes)).replace("ss", la_date.seconds).replace("ms", formatThis(la_date.milliseconds, 3))

    return return_string
}


module.exports.formatDate = formatDate
/**
 * f() : Transforme un timestamp en un texte de date formatée
 * @param {string} timestamp - Le timestamp à convertir
 * @param {string} format - Le format texte à renvoyer (YYYY: year, MM: month, DDDDD: jour de la semaine, DD: day, hh: heure, mm: minute, ss: seconde)
 */
function formatDate(timestamp, format) {
    /*
    YYYY: year
    MM: month
    DDDDD: jour de la semaine
    DD: day
    hh: heure
    mm: minute
    ss: seconde
    */
    let la_date = new Date(timestamp)
    function formatThis(thing, length=2) {
        return `0000${thing}`.substr(-2)
    }

    function getDayName() {
        let list = [
            "lundi",
            "mardi",
            "mercredi",
            "jeudi",
            "vendredi",
            "samedi",
            "dimanche"
        ]
        return list[la_date.getDay()-1]
    }

    let return_string = format.replace("YYYY", la_date.getFullYear()).replace("MM", formatThis(la_date.getMonth()+1)).replace("DDDDD", getDayName()).replace("DD", formatThis(la_date.getDate())).replace("hh", formatThis(la_date.getHours())).replace("mm", formatThis(la_date.getMinutes())).replace("ss", formatThis(la_date.getSeconds()))

    return return_string
}


module.exports.compareString = compareString
/**
 * f() : Renvoie une valeur entre 0 et 1 du taux de similitude entre les deux chaines
 * @param {string} string1 - Première chaine de texte
 * @param {string} string2 - Deuxième chaine de texte
 */
function compareString(string1, string2) {
    // v1.0 from 18/04/2022
    if(string1 == string2) return 1;
    if(string1 == "" || string2 == "") return 0
    let total_count = 0;
    let ok_count = 0;
    for(let longueur_test = 1; longueur_test < string1.length+1; longueur_test++) {
        let morceau;
        for(let multiplier = 0; multiplier <  ((string1.length)/longueur_test)+1; multiplier++ ) {
            let index = longueur_test*multiplier
            if(string1.length > index) {
                total_count++
                let the_string = string1.substr(index, longueur_test)
                if(string2.indexOf(the_string) != -1) {
                    ok_count += 0.5
                } else if(string2.toLowerCase().indexOf(the_string) != -1){
                    ok_count += 0.45
                } else if(string2.indexOf(the_string.toLowerCase()) != -1){
                    ok_count += 0.45
                } else {
                    //console.log(`No '${the_string}' in '${string2}' `)
                }
            }
            if(string2.length > index) {
                let the_string = string2.substr(index, longueur_test)
                if(string1.indexOf(the_string) != -1) {
                    ok_count += 0.5
                } else if(string1.toLowerCase().indexOf(the_string) != -1){
                    ok_count += 0.45
                } else if(string1.indexOf(the_string.toLowerCase()) != -1){
                    ok_count += 0.45
                } else {
                    //console.log(`No '${the_string}' in '${string1}' `)
                }
            }
        }

    }

    let a = string1.length
    let b = string2.length

    let ponderation;
    if( (b/a) == 1) {
        ponderation = 1
    } else if( (b/a) > 1 ) {
        ponderation = (a/b)
    } else {
        ponderation = (b/a)
    }

    let score = (ok_count/total_count)*ponderation

    return score
}

/**
 * class Emitter : Créé un object de socket interne où on peut emit et reçevoir des event (évènements)
 * @version 1.0.0
 */
class Emitter {
    constructor() {
        this.eventsNames = {}
        
        this.on = (callName, callback_f) => {
            if(typeof callback_f != 'function') throw new Error("Callback must must type of 'function'.")
            if(this.eventsNames[callName] == undefined) this.eventsNames[callName] = []
            this.eventsNames[callName].push(callback_f)
        }
        this.emit = (callName, ...datasList) => {
            if(this.eventsNames[callName] == undefined) return;
            for(let i in this.eventsNames[callName]) {
                try { this.eventsNames[callName][i](...datasList) } catch(e) { console.log(e) }
            }
        }
        this.removeListeners = (callName) => (this.eventsNames[callName] = [])
        this.removeAllListeners = () => (this.eventsNames = {})
        this.countListeners = (callName) => (this.eventsNames[callName] != undefined ? this.eventsNames[callName].length : 0)
    }
}
module.exports.Emitter = Emitter

function parseSubZones(containerElement, listOfCutTexts, callbackGetText, defaultKey=undefined) {
    if(typeof callbackGetText != 'function') throw new Error("parseSubZones(): callbackGetText must be type of 'function'.")
    if(typeof listOfCutTexts != 'object') throw new Error("parseSubZones(): callbackGetText must be type of 'array'.")

    /*
    listOfCutTexts: {
        cutOn: "text", // lowercase
        value: "text"
    }

    */
    
    let containerElement_mapped = {
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

    for(let i in containerElement) {
        let e = containerElement[i]
        console.log("e:",e.outerHTML)
        let firstStrongText = callbackGetText(e)
        if(!firstStrongText) continue;

        let the_key;
        let found_key = false
        for(let i in listOfCutTexts) {
            if(firstStrongText.includes(listOfCutTexts[i].cutOn)) the_key = listOfCutTexts.value
            found_key = true
        }
        if(!found_key && defaultKey) { the_key = defaultKey }
        else { continue; }

        containerElement_mapped[the_key] = e
    }

    return containerElement_mapped

}
module.exports.parseSubZones = parseSubZones
