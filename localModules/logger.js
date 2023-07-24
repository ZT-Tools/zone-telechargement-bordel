
/**
 * @version 3.2.0 // 19/06/2023
 * @author Sylicium
 * @description Module global qui servira à log pour tous les fichiers au lieu de faire toujours un console.log
 *
*/


const fs = require('fs')
const clc = require('cli-color');

let configuration = {
    coloration: "colored", // normal: erreur tout en rouge, warn tout en orange etc.. | colored couleurs différentes pour la ligne de log pour la date, heure etc..
    logOnStart: false,
    ReplitName: "",
    workDirectoryFullPath: "",
    workDirectory: "\\",
    replitMode: false
}
function formatDate(timestamp, format) {
    /*
    YYYY: year
    MM: month
    DDDDD: jour de la semaine
    DD: day
    hh: heure
    mm: minute
    ss: seconde
    ms: miliseconds
    */
    let la_date = new Date(timestamp)
    function formatThis(thing, length=2) {
        return `0000${thing}`.substr(-length)
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

    let return_string = format.replace("YYYY", la_date.getFullYear()).replace("MM", formatThis(la_date.getMonth()+1)).replace("DDDDD", getDayName()).replace("DD", formatThis(la_date.getDate())).replace("hh", formatThis(la_date.getHours())).replace("mm", formatThis(la_date.getMinutes())).replace("ss", formatThis(la_date.getSeconds())).replace("ms", formatThis(la_date.getMilliseconds(),3))

    return return_string
}

function getDateString(format, timestamp=null) {
    let d = new Date()//.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
    if(timestamp) {
        d = new Date(timestamp)
    }
    return formatDate(d.getTime(), (format || "DD/MM/YYYY - hh:mm:ss"))
}


function colorizeThisType(type, text) {
    type = type.toUpperCase()
    if(type == "ERROR") return clc.red(text)
    if(type == "WARN") return clc.yellow(text)
    if(type == "DEBUG") return clc.magentaBright(text)
    if(type == "INFO") return clc.blueBright(text)
    if(type == "LOG") return clc.whiteBright(text)
    return clc.white(text)
}

let colors = {
    Reset: "",
    Bright: "",
    Dim: "",
    Underscore: "",
    Blink: "",
    Reverse: "",
    Hidden: "",
    FgBlack: "",
    FgRed: "",
    FgGreen: "",
    FgYellow: "",
    FgBlue: "",
    FgMagenta: "",
    FgCyan: "",
    FgWhite: "",
    BgBlack: "",
    BgRed: "",
    BgGreen: "",
    BgYellow: "",
    BgBlue: "",
    BgMagenta: "",
    BgCyan: "",
    BgWhite: ""
    /*
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",
    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",
    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m"*/
}


class Logger {
    constructor(logName) {

        function _getCallerFile(){
            const err = new Error();
        
            Error.prepareStackTrace = (_, stack) => stack;
        
            const stack = err.stack;
        
            Error.prepareStackTrace = undefined;

            let fullFilePath = stack[2].getFileName()
            
            let temp = stack[2].getFileName().split("\\")
            let _a_fileName = temp[temp.length-1].split(".")
            _a_fileName.pop()
            let fileName = _a_fileName.join(".")

            let filePath = fullFilePath
            // let fileName = fileName
            let fullFileName = temp[temp.length-1]

            if(configuration.replitMode) {
                filePath = fullFilePath.replace(`/home/runner/${configuration.ReplitName}/`,""),
                fileName = fileName.replace(`/home/runner/${configuration.ReplitName}/`,""),
                fullFileName = fullFileName.replace(`/home/runner/${configuration.ReplitName}/`,"")
            }
            
            return {
                filePath: fullFilePath,
                fileName: fileName,
                fullFileName: fullFileName
            }
        }
        let fileInfos = _getCallerFile()
        //console.log("caller:",fileInfos)
        /*if(!logName) {
            
        }*/
        //console.log("fileInfos:",fileInfos)
        fileInfos.fileName = fileInfos.fileName
        let logFileName = fileInfos.fileName

        this.writeLog = this.writeLog
        this.callerFile = fileInfos
        this.logFile = {
            filePath: `${configuration.replitMode ? `/home/runner/${configuration.ReplitName}/logs/` : "./logs/"}${fileInfos.fileName}.log`,
            fileName: logFileName,
            logName: (!!logName ? logName : null)
        }
        
        /*
        this.writeAllLogs = (type, a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z) => {
            
            let callerLine;
            try {
                let s = (new Error()).stack.split("\n")[3].split("\\")
                callerLine = "\\" + s[s.length-2] + "\\" + s[s.length-1]
                if(callerLine.substr(-1) == ")") callerLine = callerLine.substr(0, callerLine.length-1)
            } catch(e) {
                callerLine = `!${this.logFile.logName ? `n> ${this.logFile.logName}` : this.callerFile.fullFileName}`
            }
            //console.log(` >>${callerLine}<<`)

            ////////// à remove sur la prod //////////
            if(callerLine.startsWith("\\DirtyBiology v2.0")) callerLine = callerLine.replace("\\DirtyBiology v2.0","<root>")

            let allVars = [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z]
            let date = new Date()
            for(let loop in allVars) {
                if(allVars[loop] !== undefined) this.writeLog(type, `${allVars[loop]}`, date, callerLine)
            }
        }
        */

        if(!fs.existsSync(this.logFile.filePath)) {
            fs.writeFileSync(this.logFile.filePath,`File created on ${getDateString("DD/MM/YYYY at hh:mm:ss.ms")}\n\n`)
        }
        
        this._writeLogLine = (type, ...args) => {

            let callerLine;
            try {
                let splitOnChar = "\\"
                let s = ((new Error()).stack)
                if(s.split("/").length > s.split("\\").length) splitOnChar = "/"
                let s_2 = s.split("\n")[3].split(splitOnChar)
                callerLine = splitOnChar + s_2[s_2.length-2] + splitOnChar + s_2[s_2.length-1]
                if(callerLine.substr(-1) == ")") callerLine = callerLine.substr(0, callerLine.length-1)
            } catch(e) {
                callerLine = `!${this.logFile.logName ? `n> ${this.logFile.logName}` : this.callerFile.fullFileName}`
            }
            //console.log(` >>${callerLine}<<`)

            ////////// à remove sur la prod //////////
            if(callerLine.startsWith(configuration.workDirectory)) callerLine = callerLine.replace(configuration.workDirectory,"<root>")


            if(!callerLine) callerLine = `!${this.logFile.logName ? `n> ${this.logFile.logName}` : this.callerFile.fullFileName}`


            type = type.toUpperCase()

            let date_timestamp = Date.now()

            //text = JSON.stringify(a),JSON.stringify(b),JSON.stringify(c),JSON.stringify(d),JSON.stringify(e),JSON.stringify(f),JSON.stringify(g),JSON.stringify(h),JSON.stringify(i),JSON.stringify(j),JSON.stringify(k),JSON.stringify(l),JSON.stringify(m),JSON.stringify(n),JSON.stringify(o),JSON.stringify(p),JSON.stringify(q),JSON.stringify(r),JSON.stringify(s),JSON.stringify(t),JSON.stringify(u),JSON.stringify(v),JSON.stringify(w),JSON.stringify(x),JSON.stringify(y),JSON.stringify(z)

            let log_text = `[${getDateString("DD/MM/YYYY - hh:mm:ss.ms",date_timestamp)} ${type}] (${callerLine}): ${args}\n`
            //console.log(`[${date} ${type.toUpperCase()}] (${callerLine}): ${text}`)

            if(configuration.coloration == "colored") {
                let dt = {
                    days: getDateString("DD",date_timestamp),
                    months: getDateString("MM",date_timestamp),
                    year: getDateString("YYYY",date_timestamp),
                    hours: getDateString("hh",date_timestamp),
                    minutes: getDateString("mm",date_timestamp),
                    seconds: getDateString("ss",date_timestamp),
                    milliseconds: getDateString("ms",date_timestamp),
                    allTime: getDateString("hh:mm:ss.ms",date_timestamp)
                }
                let colorized_date = `${clc.cyan(dt.days)}${clc.white("/")}${clc.cyan(dt.months)}${clc.white("/")}${clc.cyan(dt.year)} - `
                colorized_date += `${clc.green(`${dt.allTime}`)}`

                // let text_to_log = `[${colorized_date} ${colorizeThisType(type,type)}] (${clc.blue(callerLine)}): ${colorizeThisType(type,text)}`
                // console.log(text_to_log)
                let pretext_to_log = `[${colorized_date} ${colorizeThisType(type,type)}] (${clc.blue(callerLine)}):`
                console.log(pretext_to_log, ...args)
            } else {
                let date = getDateString("DD/MM/YYYY - hh:mm:ss.ms",date_timestamp)
                let text_to_log = `[${date} ${type}] (${callerLine}): ${text}`
                if(type == "ERROR") console.log(clc.redBright(text_to_log))
                else if(type == "WARN") console.log(clc.yellow(text_to_log))
                else if(type == "DEBUG") console.log(clc.magentaBright(text_to_log))
                else if(type == "INFO") console.log(clc.blueBright(text_to_log))
                else if(type == "LOG") console.log(clc.whiteBright(text_to_log))
                else {console.log(clc.white(text_to_log))}
            }

            
            fs.appendFileSync(this.logFile.filePath,log_text, 'utf8');
        }

        /*
        this._writeToGlobalLog = (type, text, date) => {
            let texts = text.split("\n")
            for(let i in texts) {
                //console.log("texts:",texts[i])
                let log_text = `[${date} ${type.toUpperCase()}] (${this.callerFile.fullFileName}): ${texts[i]}\n`
                fs.appendFileSync("./logs/All.log",log_text, 'utf8');

            }
        }
        function writeLog(type, text, timestamp= new Date(), callerLine=false) {
            if(text.message && text.stack) text = text.stack
            let texts = text.split("\n")
            let date = `${getDateString("DD/MM/YYYY - hh:mm:ss.ms",timestamp)}`
            this._writeToGlobalLog(type, text, date)
            for(let i in texts) {
                this._writeLogLine(type,texts[i],this.logFile.filePath, timestamp, callerLine)
            }
        }
        */
        //this.writeLog = writeLog
        
        if(configuration.logOnStart) this._writeLogLine("info",`Starting logger for file '${this.callerFile.filePath.replace(configuration.workDirectoryFullPath,"<root>>\\")}'`)

    }

    
    log = (...args) => {
        this._writeLogLine("LOG", ...args)
    }
    error = (...args) => {
        this._writeLogLine("ERROR", ...args)
    }
    warn = (...args) => {
        this._writeLogLine("WARN", ...args)
    }
    info = (...args) => {
        this._writeLogLine("INFO", ...args)
    }
    debug = (...args) => {
        this._writeLogLine("DEBUG", ...args)
    }

}

module.exports = (...args) => {
    return new Logger(...args)
}