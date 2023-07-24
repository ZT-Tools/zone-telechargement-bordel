/**
 * @version 1.2.0 // 23/07/2023
 * @author Sylicium
 * @description Module de serveur qui gère un site web, une api, et supporte un bot discord
 *
*/

const axios = require("axios")
const fs = require("fs")
let config = require("./config")

const express = require('express');
const Discord = require("discord.js");
const Logger = require("./localModules/logger")();
const app = express();
app.use(express.urlencoded())
app.use(express.json())
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);

const Modules_ = {
    "Discord": Discord,
    "app": app,
    "config": config,
    "axios": axios
}

let servEndpoints = {
    api: {
        fs: "/api", // chemin depuis le root du projet et sans le slash de fin
        relative: "/api", // chemin relatif par rapport à ce fichier
    },
    site: {
        fs: "/site", // chemin depuis le root du projet et sans le slash de fin
        relative: "/site", // chemin relatif par rapport à ce fichier
    }
}

let Client;

/*
param types:
string - pour du texte
object - dictionnaire { }
array - liste []
number - Nombre entier ou flotant
boolean - true/false

*/

let APIEvents = [
]

console.log(`[API] Loading APIEvents...`)
fs.readdirSync(`.${servEndpoints.api.fs}/`).forEach(directoryName => {
    let dirPath = `.${servEndpoints.api.fs}/${directoryName}`
    try {
        if( fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory() ) {
            console.log(`[API]   Loading api endpoints for method ${directoryName.toUpperCase()}`)
            fs.readdirSync(`.${servEndpoints.api.fs}/${directoryName}/`).forEach(file => {
                let the_require = require(`.${servEndpoints.api.relative}/${directoryName}/${file}`)
                the_require.method = directoryName.toUpperCase()
                let fileName = file.split(".")
                fileName.pop()
                fileName = fileName.join(".")
                the_require.endpoint = fileName
                APIEvents.push(the_require)
                console.log(`[API]     ✔ Loaded API endpoint (${the_require.method}) /${the_require.endpoint}`)
            })
        } else {
            console.log(`[API]   ! ${directoryName} is a file, not a directory`)
        }
    } catch(e) {
        console.log(`[API][ERROR] ❌`,e)
    }

})
console.log(`[API] ✅ Loaded ${APIEvents.length} APIEvents`,APIEvents)


module.exports.run = (instance_client) => {
    Client = instance_client

    app.all("/assets/*", (req, res) => {
        return res.sendFile(`${__dirname}${servEndpoints.site.relative}${req.path}`)
    })

    
    app.all("*", async (req, res) => { // tout à la fin sinon le "*" catch à la place des autres app.get()

        try {
            
            if(req.path.startsWith("/assets/")) { return res.sendFile(`${__dirname}${servEndpoints.site.relative}${req.path}`) }
            if(req.path.startsWith("/api/")) { return handleAPI(req, res) }

            console.log(`[Web] ${req.method.toUpperCase()} -> ${req.url}`)
            // console.log(req.query)
    
            if(req.path == "/favicon.ico") return res.sendFile(`${__dirname}${servEndpoints.site.relative}/favicon.ico`)
            if(req.path.startsWith("/api/")) return;
            if(req.path.startsWith("/assets/")) return;
    
            if(req.path.endsWith("/") && fs.existsSync(`.${servEndpoints.site.fs}${req.path}/index.html`)) {
                return res.sendFile(`${__dirname}${servEndpoints.site.relative}${req.path}/index.html`)
            } else if(fs.existsSync(`.${servEndpoints.site.fs}${req.path}.html`)) {
                return res.sendFile(`${__dirname}${servEndpoints.site.relative}${req.path}.html`)
            } else {
                return res.sendFile(`${__dirname}${servEndpoints.site.relative}/404.html`)
            }

        } catch(err) {
            res.status(500)
            res.send(JSON.stringify({
                message: `An error occured server-side. ${err}`,
                stack: err.stack.split("\n"),
            }))
        }

    })

    serv.listen(config.website.port, () => {
        console.log(`[server.js] Serveur démarré sur le port ${config.website.port}`)
    })

}



function handleAPI(req, res) {
    console.log("got api",req.url)
        
    let endpoint = req.path.substr(5, req.path.length)


    let apiEvent_list = APIEvents.filter((item) => {
        return (endpoint == item.endpoint)
    })
    
    if(apiEvent_list.length == 0) return res.send({
        status: 404,
        message: `Endpoint does not exists` 
    })

    apiEvent_list2 = apiEvent_list.filter((item) => {
        return (item.method == req.method)
    })
    let allMethodsAllowed = apiEvent_list.map((item, index) => {
        return item.method
    })

    if(apiEvent_list2.length == 0) return res.send({
        status: 405,
        message: `Method not allowed`,
        methods: allMethodsAllowed
    })

    let apiEvent = apiEvent_list2[0]

    for(let paramName in req.query) {
        let paramValue = req.query[paramName]
        try {
            req.query[paramName] = JSON.parse(paramValue)
        } catch(e) {
            Logger.error(e)
            return res.send({
                status: 500,
                message: `Internal server error while parsing to JSON query parameter '${paramName}'.`,
                error: `${e}`,
                stack: e.stack.split("\n")
            })
        }
    }

    for(let i in apiEvent.parameters) {
        let param = apiEvent.parameters[i]
        if(!req.query[param.name] && param.required) {
            return res.send({
                status: 400,
                message: `Bad request. Missing parameter: '${param.name}'. ${param.msg || ""}`,
                parameters: apiEvent.parameters
            })
        } else if(req.query[param.name]) {
            try {
                if(param.type == "array") {
                    if(!Array.isArray(req.query[param.name])) {
                        return res.send({
                            status: 400,
                            message: `Bad request. Invalid parameter type: '${param.name}'. ${param.msg || ""}`,
                            parameters: apiEvent.parameters
                        })
                    }
                } else if(typeof req.query[param.name] != param.type) {
                    return res.send({
                        status: 400,
                        message: `Bad request. Invalid parameter type: '${param.name}'. ${param.msg || ""}`,
                        parameters: apiEvent.parameters
                    })
                }
            } catch(e) {
                Logger.error(e)
                return res.send({
                    status: 500,
                    message: `Internal server error while parsing query parameter '${param.name}' (type:${param.type} | required:${param.required}).`,
                    error: `${e}`,
                    stack: e.stack.split("\n")
                })
            }
        }
    }

    try {
        apiEvent.func(Client, Modules_, req, res).catch(err => {
            return res.send({
                status: 500,
                message: `Internal server error while executing request.`,
                error: `${err}`,
                stack: err.stack.split("\n")
            })
        })
    } catch(err) {
        return res.send({
            status: 500,
            message: `Internal server error while executing request.`,
            error: `${err}`,
            stack: err.stack.split("\n")
        })
    }
}


io.on('connection', socket => {

    console.log(`[socket][+] New connection: ${socket.id}`)

    io.on('disconnect', socket => {
        console.log(`[socket][-] Lost connection: ${socket.id}`)
    })

})