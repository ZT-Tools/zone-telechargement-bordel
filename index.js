
const axios = require("axios")
const fs = require("fs")
let config = require("./config")
const Discord = require("discord.js")
const Logger = require("./localModules/logger")()
const somef = require("./localModules/someFunctions")
const botf = require("./bot/botLocalModules/botFunctions")

try {
    require("dotenv").config()
} catch(e) { console.log(e) }

let bot = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.DirectMessageTyping,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.GuildBans,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
        Discord.GatewayIntentBits.GuildIntegrations,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildScheduledEvents,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent
    ],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.GuildScheduledEvent,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
        Discord.Partials.ThreadMember,
        Discord.Partials.User
    ],
    presence: {
        status: "online",
        activities: [{
            name: 'v3.0.0',
            type: "LISTENING",
        }]
    }
})

botf._initBotFunctions(bot)
bot.botf = botf

let server = require("./server")
server.run()


const Modules = {
    somef: somef,
    botf: botf,
    server: server,
    Logger: Logger,
    fs: fs,
    axios: axios
}


bot.commands = {}
bot.commands.slashCommands = new Discord.Collection();

let SlashCommandsCollection = []

fs.readdirSync("./bot/slashcommands").forEach(file => {
    if(file.endsWith(".js")) {
        try {
            let fileName = file.split(".")
            fileName.pop()
            fileName.join(".")

            temp = require(`./bot/slashcommands/${fileName}`)
            SlashCommandsCollection.push({
                commandInformations: temp.commandInformations,
                require: temp
            });
            bot.commands.slashCommands.set(temp.commandInformations.commandDatas.name, {
                commandInformations: temp.commandInformations,
                require: temp
            });
            Logger.info(`✔ Successfully loaded command ${temp.commandInformations.commandDatas.name}`)
        } catch(e) {
            Logger.warn(`❌ Failed loading command of file /slashcommands/${file}`,e)
        }
    }
});

bot.on("ready", () => {
    Logger.info(`[BOT]: Bot démarré en tant que ${bot.user.tag}`)
    //console.log(`Bot démarré en tant que ${bot.user.tag} | ${Object.size(bot.guilds.cache)} serveurs rejoints`)

    bot.user.setPresence({
        status: "online",
        activities: [
            {
                name: `v${config.bot.version}`,
                type: "PLAYING"
            }
        ]
    });

    try {

        if(config.bot.setApplicationCommandsOnStart) {
            Logger.warn("❕ Penser à désactiver le config.bot.setApplicationCommandsOnStart pour ne pas recharger les commandes à chaque démarrage.")
            let commandDatas_ = SlashCommandsCollection.map(x => { return x.commandInformations.commandDatas })
            if(config.bot.setApplicationCommandsInLocal) {
                for(let i in config.bot.setApplicationCommandsInLocal_guilds) {
                    let guild = bot.guilds.cache.get(config.bot.setApplicationCommandsInLocal_guilds[i])
                    try {
                        guild.commands.set(commandDatas_)
                        Logger.info(`✔ Successfully reloaded guild commands for ${guild.name} (${guild.id})`)
                    } catch(e) {
                        try {
                            Logger.warn(`❌ Failed to reload guild commands for ${guild.name} (${guild.id})`,e)
                        } catch(err) {
                            Logger.warn(`❌❌ Failed to reload guild commands for UNKNOW guild (id=${config.bot.setApplicationCommandsInLocal_guilds[i]})`)
                            Logger.warn(e)
                        }
                    }
                }
            } else {
                try {
                    bot.application.commands.set(commandDatas_)
                    Logger.info(`✔ Successfully reloaded global application commands.`)
                } catch(e) {
                    Logger.warn(`❌ Failed to reload global application commands.`,e)
                }
            }
        }
        Logger.info("✅ Chargement des slash commandes terminé")

    } catch(e) {
        Logger.debug(e)
    }
})



bot.on("interactionCreate", async (interaction) => {

    if(!interaction.guild) return;
    if(interaction.user.bot) return;


    interaction.guild.me_ = () => { return interaction.guild.members.cache.get(bot.user.id) }

    Logger.debug("interaction [command]",interaction)

    //let data = await Database.getGuildDatas(interaction.guild.id)
    let data = undefined

    Logger.debug("Got interaction: "+interaction)

    if(!interaction.isCommand()) return;

    console.log("interaction.command",interaction.command)

   



    let cmd = bot.commands.slashCommands.get(interaction.commandName)

    if(!cmd) {
        return interaction.reply({
            content: ":x: Commande inconnue. [code#01]",
            ephemeral: true
        })
    }

    let hasPerm_bot1 = botf.checkPermissionsInChannel(
        interaction.guild.me_(),
        [ "VIEW_CHANNEL", "SEND_MESSAGES" ].concat(cmd.require.commandInformations.permisionsNeeded.bot),
        interaction.channel,
        true
    )
    
    let hasPerm_bot2 = botf.checkPermissions(interaction.guild.me_(), cmd.require.commandInformations.permisionsNeeded.bot, true)
    let hasPerm_bot = {
        havePerm: hasPerm_bot1.havePerm && hasPerm_bot2.havePerm,
        missingPermissions: somef.removeDuplicates(hasPerm_bot1.missingPermissions.concat(hasPerm_bot2.missingPermissions))
    }

    //Logger.debug(`BOT checking perms: ${cmd.require.commandInformations.permisionsNeeded.bot} : `,hasPerm_bot)
    let hasPerm_user = botf.checkPermissions(interaction.member, cmd.require.commandInformations.permisionsNeeded.user)
    //Logger.debug(`BOT checking perms: ${cmd.require.commandInformations.permisionsNeeded.user} : `,hasPerm_user)

    if(!hasPerm_bot.havePerm) {
        return interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("FF0000")
                    .setTitle(`🤖 Aie.. Le bot manque de permissions!`)
                    .setDescription(`Il a besoin des permissions suivantes:\n${hasPerm_bot.missingPermissions.map((x) => {
                        return `\`${x}\``
                    }).join(", ")}`)
                    .setFooter({ text: `Essayez de contacter un administrateur.` })
            ],
            ephemeral: false
        })
    }
    if(!hasPerm_user.havePerm && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `⛔ Halte! Tu n'a pas la permission d'utiliser cette commande.\nIl te manque une de ces permissions: ${cmd.require.commandInformations.permisionsNeeded.user.map((x) => {
                return `\`${x}\``
            }).join(", ")}`,
            ephemeral: true
        })
    }

    /*
    let filtered = SlashCommandsCollection.filter(x => {
        return x.commandInformations.commandDatas.name == interaction.command.name
    })
    */

    

    if(cmd.require.commandInformations.superAdminOnly && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `⛔ Commande SUPER_ADMIN uniquement.`,
            ephemeral: true
        }) 
    }
    if(cmd.require.commandInformations.disabled && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `⛔ Commande désactivée.`,
            ephemeral: true
        }) 
    }
    if(cmd.require.commandInformations.indev && !somef.isSuperAdmin(interaction.user.id)) {
        return interaction.reply({
            content: `🛠 Commande en développement`,
            ephemeral: true
        }) 
    }


    if(!cmd || !cmd.require) {
        return interaction.reply({
            content: `:x: Commande non prise en charge.`,
            ephemeral: true
        })
    }

    
    cmd.require.execute(Modules, bot, interaction, data).catch(async err => {
        Logger.warn(`Command crashed`,err)
        let the_error_msg = {
            content: "",
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`:x: Woops, looks like the command crashed.`)
                    .setColor("FF0000")
                    .setDescription(`\`\`\`js\n${err.stack}\`\`\``)
            ]
        }
        try {
            await interaction.reply(the_error_msg)
        } catch(e) {
            try {
                await interaction.editReply(the_error_msg)
            } catch(err) {
                Logger.warn(err)
            }
        }
    })

})






// bot.login(config.bot.token)

