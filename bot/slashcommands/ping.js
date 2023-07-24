

const Discord = require("discord.js")
const logger = require("../../localModules/logger")
let config = require("../../config")
let somef = require("../../localModules/someFunctions")
const botf = require("../botLocalModules/botFunctions")

module.exports = {
    commandInformations: {
        commandDatas: {
            name: "ping",
            description: "Renvoie la latence du bot et de l'api.",
            dmPermission: false,
            type: Discord.ApplicationCommandType.ChatInput,
            options: []
        },
        canBeDisabled: false,
        permisionsNeeded: {
            bot: ["SEND_MESSAGES","VIEW_CHANNEL"],
            user: []
        },
        rolesNeeded: [],
        superAdminOnly: false,
        disabled: false,
        indev: false,
        hideOnHelp: false
    },
    execute: async (Modules, bot, interaction, data, a,b,c,d,e,f,g,h) => {

		await interaction.deferReply();

        let mesg = await interaction.editReply({ content: `${config.emojis.loading.tag} Calcul de la latence...`, fetchReply: true });
        
        let latency = mesg.createdTimestamp - interaction.createdTimestamp

        let ephemeral = false
        
        if(latency < 0) {
            return interaction.editReply({ephemeral:ephemeral, content:`**:ping_pong: Latency is ${latency}ms.** API Latency is ${Math.round(bot.ws.ping)}ms. ❔`})
        } else if(latency < 400) {
            return interaction.editReply({ephemeral:ephemeral, content:`**:ping_pong: Latency is ${latency}ms.** API Latency is ${Math.round(bot.ws.ping)}ms. :green_circle:`})
        } else if(latency < 700) {
            return interaction.editReply({ephemeral:ephemeral, content:`**:ping_pong: Latency is ${latency}ms.** API Latency is ${Math.round(bot.ws.ping)}ms. :orange_circle:`})
        } else if(latency < 1000) {
            return interaction.editReply({ephemeral:ephemeral, content:`**:ping_pong: Latency is ${latency}ms.** API Latency is ${Math.round(bot.ws.ping)}ms. :red_circle:`})
        } else {
            return interaction.editReply({ephemeral:ephemeral, content:`**:ping_pong: Latency is ${latency}ms.** API Latency is ${Math.round(bot.ws.ping)}ms. ⚠`})
        }

    }
}
