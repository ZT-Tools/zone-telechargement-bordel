try {
    require("dotenv").config()
} catch(e) { console.log(e) }

module.exports = {
    website: {
        port: 8080
    },
    bot: {
        token: process.env.TOKEN,
        setApplicationCommandsOnStart: false, // set to true one time te reload commands (be careful to return this to false then)
        setApplicationCommandsInLocal: true, // set to false to reload commands Globally (do it only once!!)
        setApplicationCommandsInLocal_guilds: [
            "792139282831507467", // test de bots
        ],
    },
    emojis: {
        "loading": {
            id: "", //"867530470438731827",
            tag: "🔄", //"<a:loading:867530470438731827>"
        },
        "check_mark": {
            id: "", //"905859187580485662",
            tag: "✅", //"<:check:905859187580485662>"
        },
        "no": {
            id: "",
            tag: "❌"
        }
    }
}