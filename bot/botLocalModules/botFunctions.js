
const Discord = require('discord.js');
const logger = require('../../localModules/logger')();
const somef = require('../../localModules/someFunctions');

const _svgCaptcha = require('ppfun-captcha');
const _svg2img = require('node-svg2img');

_svgCaptcha.options.width = 500
_svgCaptcha.options.height = 200


let Bot = undefined

module.exports._initBotFunctions = _initBotFunctions
function _initBotFunctions(bot) {
    Bot = bot
}


module.exports.checkPermissions = checkPermissions
function checkPermissions(Member, permissionList, haveAll=false) {
    if(!Array.isArray(permissionList)) permissionList = [permissionList]
    if(permissionList.length == 0) {
        return { missingPermissions: [], havePerm: true }
    }
    let json = {
        missingPermissions: [],
        havePerm: true
    }
    for(let i in permissionList) {
        let perm = permissionList[i]
        if(Member.permissions.has(getBitFieldPermission(perm))) { if(!haveAll) return { missingPermissions: [], havePerm: true} }
        else {
            json.havePerm = false
            json.missingPermissions.push(permissionList[i])
        }
    }
    return (haveAll ? json : { missingPermissions: [], havePerm: false})
}

module.exports.checkPermissionsInChannel = checkPermissionsInChannel
function checkPermissionsInChannel(Member, permissionList, channel, haveAll=false) {
    if(!Array.isArray(permissionList)) permissionList = [permissionList]
    if(permissionList.length == 0) {
        return { missingPermissions: [], havePerm: true }
    }
    let json = {
        missingPermissions: [],
        havePerm: true
    }
    for(let i in permissionList) {
        let perm = permissionList[i]
        if(channel.permissionsFor(Member).has(getBitFieldPermission(perm))) { if(!haveAll) return { missingPermissions: [], havePerm: true} }
        else {
            json.havePerm = false
            json.missingPermissions.push(permissionList[i])
        }
    }
    return (haveAll ? json : { missingPermissions: [], havePerm: false})
}


let BitFieldPermissions_ = {
    //"CREATE_INSTANT_INVITES": PermissionsBitField.Flags.SendMessages

    "AddReactions": 64n,
    "Administrator": 8n,
    "AttachFiles": 32768n,
    "BanMembers": 4n,
    "ChangeNickname": 67108864n,
    "Connect": 1048576n,
    "CreateInstantInvite": 1n,
    "CreatePrivateThreads": 68719476736n,
    "CreatePublicThreads": 34359738368n,
    "DeafenMembers": 8388608n,
    "EmbedLinks": 16384n,
    "KickMembers": 2n,
    "ManageChannels": 16n,
    "ManageEmojisAndStickers": 1073741824n,
    "ManageEvents": 8589934592n,
    "ManageGuild": 32n,
    "ManageMessages": 8192n,
    "ManageNicknames": 134217728n,
    "ManageRoles": 268435456n,
    "ManageThreads": 17179869184n,
    "ManageWebhooks": 536870912n,
    "MentionEveryone": 131072n,
    "ModerateMembers": 1099511627776n,
    "MoveMembers": 16777216n,
    "MuteMembers": 4194304n,
    "PrioritySpeaker": 256n,
    "ReadMessageHistory": 65536n,
    "RequestToSpeak": 4294967296n,
    "SendMessages": 2048n,
    "SendMessagesInThreads": 274877906944n,
    "SendTTSMessages": 4096n,
    "Speak": 2097152n,
    "Stream": 512n,
    "UseApplicationCommands": 2147483648n,
    "UseEmbeddedActivities": 549755813888n,
    "UseExternalEmojis": 262144n,
    "UseExternalStickers": 137438953472n,
    "UseVAD": 33554432n,
    "ViewAuditLog": 128n,
    "ViewChannel": 1024n,
    "ViewGuildInsights": 524288n,
    
    "ADD_REACTIONS": 64n,
    "ADMINISTRATOR": 8n,
    "ATTACH_FILES": 32768n,
    "BAN_MEMBERS": 4n,
    "CHANGE_NICKNAME": 67108864n,
    "CONNECT": 1048576n,
    "CREATE_INSTANT_INVITE": 1n,
    "CREATE_PRIVATE_THREADS": 68719476736n,
    "CREATE_PUBLIC_THREADS": 34359738368n,
    "DEAFEN_MEMBERS": 8388608n,
    "EMBED_LINKS": 16384n,
    "KICK_MEMBERS": 2n,
    "MANAGE_CHANNELS": 16n,
    "MANAGE_EMOJIS_AND_STICKERS": 1073741824n,
    "MANAGE_EVENTS": 8589934592n,
    "MANAGE_GUILD": 32n,
    "MANAGE_MESSAGES": 8192n,
    "MANAGE_NICKNAMES": 134217728n,
    "MANAGE_ROLES": 268435456n,
    "MANAGE_THREADS": 17179869184n,
    "MANAGE_WEBHOOKS": 536870912n,
    "MENTION_EVERYONE": 131072n,
    "MODERATE_MEMBERS": 1099511627776n,
    "MOVE_MEMBERS": 16777216n,
    "MUTE_MEMBERS": 4194304n,
    "PRIORITY_SPEAKER": 256n,
    "READ_MESSAGE_HISTORY": 65536n,
    "REQUEST_TO_SPEAK": 4294967296n,
    "SEND_MESSAGES": 2048n,
    "SEND_MESSAGES_IN_THREADS": 274877906944n,
    "SEND_TTS_MESSAGES": 4096n,
    "SPEAK": 2097152n,
    "STREAM": 512n,
    "USE_APPLICATION_COMMANDS": 2147483648n,
    "USE_EMBEDDED_ACTIVITIES": 549755813888n,
    "USE_EXTERNAL_EMOJIS": 262144n,
    "USE_EXTERNAL_STICKERS": 137438953472n,
    "USE_VAD": 33554432n,
    "VIEW_AUDIT_LOG": 128n,
    "VIEW_CHANNEL": 1024n,
    "VIEW_GUILD_INSIGHTS": 524288n,
}


module.exports.getBitFieldPermission = getBitFieldPermission
function getBitFieldPermission(permNameOrList) {
    if(Array.isArray(permNameOrList)) {
        return permNameOrList.map((item, index) => {
            return this.getBitFieldPermission(item)
        })
    } else {
        if(typeof permNameOrList != "string") return permNameOrList
        if(BitFieldPermissions_[permNameOrList] != undefined) {
            return BitFieldPermissions_[permNameOrList]
        } else {
            return permNameOrList
        }
    }

}


/**
 * createMdodal(modalConfiguration): renvoie l'objet de modal créé avec la liste d'option fournie
 * @version: 1.0.0
 * @param {Object} modalConfiguration - La liste des options du modal
*/
function createModal(modalConfiguration) {
    /*
    {
        customId: "ccc",
        title: "titre",
        options: [
            {
                customId: "test",
                label: "coucou",
                style: "short"
            }
        ]
    }
    */

    function getStyleFrom(styleName) {
        if(styleName == "short") {
            return Discord.TextInputStyle.Short
        } else if(styleName == "paragraph") {
            return Discord.TextInputStyle.Paragraph
        }
    }

    let modal = new Discord.ModalBuilder()
		.setCustomId(modalConfiguration.setCustomId)
		.setTitle(modalConfiguration.title);
    
    let allOptionsComponents = modalConfiguration.map((item, index) => {
        return new Discord.ActionRowBuilder().addComponents(
            new Discord.TextInputBuilder()
			.setCustomId(item.customId)
			.setLabel(item.label)
			.setStyle(getStyleFrom(item.style))
        )
    })

    modal.addComponents(...allOptionsComponents)
    
    return modal

}
module.exports.createModal = createModal


module.exports.checkPermissionList = checkPermissionList
function checkPermissionList(member) {

    let perm_list = [
{ name: "CREATE_INSTANT_INVITE", shouldHave: true },
{ name: "KICK_MEMBERS", shouldHave: false },
{ name: "BAN_MEMBERS", shouldHave: false },
{ name: "ADMINISTRATOR", shouldHave: false },
{ name: "MANAGE_CHANNELS", shouldHave: false },
{ name: "MANAGE_GUILD", shouldHave: false },
{ name: "ADD_REACTIONS", shouldHave: true },
{ name: "VIEW_AUDIT_LOG", shouldHave: false },
{ name: "PRIORITY_SPEAKER", shouldHave: false },
{ name: "STREAM", shouldHave: false },
{ name: "VIEW_CHANNEL", shouldHave: true },
{ name: "SEND_MESSAGES", shouldHave: true },
{ name: "SEND_TTS_MESSAGES", shouldHave: true },
{ name: "MANAGE_MESSAGES", shouldHave:true },
{ name: "EMBED_LINKS", shouldHave: true },
{ name: "ATTACH_FILES", shouldHave: true },
{ name: "READ_MESSAGE_HISTORY", shouldHave: true },
{ name: "MENTION_EVERYONE", shouldHave: false },
{ name: "USE_EXTERNAL_EMOJIS", shouldHave: true },
{ name: "USE_EXTERNAL_STICKERS", shouldHave: true },
{ name: "VIEW_GUILD_INSIGHTS", shouldHave: false },
{ name: "CONNECT", shouldHave: false },
{ name: "SPEAK", shouldHave: false },
{ name: "MUTE_MEMBERS", shouldHave: false },
{ name: "DEAFEN_MEMBERS", shouldHave: false },
{ name: "MOVE_MEMBERS", shouldHave: false },
{ name: "USE_VAD", shouldHave: false },
{ name: "CHANGE_NICKNAME", shouldHave: false },
{ name: "MANAGE_NICKNAMES", shouldHave: false },
{ name: "MANAGE_ROLES", shouldHave: false },
{ name: "MANAGE_WEBHOOKS", shouldHave: false },
{ name: "MANAGE_EMOJIS_AND_STICKERS", shouldHave: false },
{ name: "USE_APPLICATION_COMMANDS", shouldHave: true },
{ name: "REQUEST_TO_SPEAK", shouldHave: false },
{ name: "MANAGE_EVENTS", shouldHave: false },
{ name: "MANAGE_THREADS", shouldHave: false },
{ name: "CREATE_PUBLIC_THREADS", shouldHave: false },
{ name: "CREATE_PRIVATE_THREADS", shouldHave: false },
{ name: "SEND_MESSAGES_IN_THREADS", shouldHave: true },
{ name: "USE_EMBEDDED_ACTIVITIES", shouldHave: false },
{ name: "MODERATE_MEMBERS", shouldHave: false },
]
    let permissions_got = []
    let permissions_required = []
    let permissions_missing = []
    let text_list = []
    for(let i in perm_list) {
        let mini_em;
        let required = false
        if(perm_list[i].shouldHave) {
            mini_em = ":white_check_mark:"
            permissions_required.push(perm_list[i].name)
            required = true
        } else {
            mini_em = ":x:"
        }
        try {
            let permissionChecked = this.checkPermissions(member, [perm_list[i].name])
            if(permissionChecked.havePerm) { //member.hasPermission(perm_list[i].name)
                text_list.push(`${mini_em} :white_check_mark: ${perm_list[i].name}`)
                permissions_got.push(perm_list[i].name)
            } else {
                text_list.push(`${mini_em} :x: ${perm_list[i].name}`)
                if(required) permissions_missing.push(perm_list[i].name)
            }
        } catch(e) {
            text_list.push(`${mini_em} :warning: ${perm_list[i].name}`)
            if(required) permissions_missing.push(perm_list[i].name)
        }
    }
    return {
        list: text_list,
        permissions: permissions_got,
        permissions_required: permissions_required,
        permissions_missing: permissions_missing,
    }

}

module.exports.getMessageUrl = getMessageUrl
function getMessageUrl(messageOrInteraction) {
    let temp = messageOrInteraction
    return `https://discord.com/channels/${temp.guild.id}/${temp.channel.id}/${temp.id}`
}
module.exports.getChannelUrl = getChannelUrl
function getChannelUrl(msgOrInteractionOrChannel) {
    let temp = msgOrInteractionOrChannel
    return `https://discord.com/channels/${temp.guild.id}/${temp.channel ? temp.channel.id : temp.id}`
}

module.exports.sendError = sendError
async function sendError(err, interaction, errorTags) {
    let loggedError = await logError(err, {
        errorTags: errorTags,
        user: interaction.user,
        interaction: interaction
    })

    let lines = [
        `🤖 Aie... une erreur est survenue`,
        `Pour de plus amples informations sur cette erreur, veuillez contacter un administrateur en lui fournissant ces informations:`,
        `ErrorID: \`${loggedError.errorID}\` `,
        `ErrorTags: \`${loggedError.errorTags}\` `
    ].join("\n")

    try {
        await interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor("FF0000")
                    .setDescription(lines)
                    .setDescription(`**${err}** \`\`\`js\n${err}\`\`\` `)
            ],
            ephemeral: false
        })
    } catch(e) {
    }
    
}
module.exports.logError = logError
async function logError(err, temp_options={
    user: undefined,
    message: undefined,
    interaction: undefined
}) {
    let errorID = `${somef.genHex(4)}-${somef.genHex(4)}-${somef.genHex(4)}-${somef.genHex(4)}`
    logger.warn(`[Bot.logError]: ErrorId: '${errorID}'. Error:`,e)
    try {
        options = {
            errorTags: temp_options.errorTags,
            user: temp_options.user,
            message: temp_options.message,
            interaction: temp_options.interaction,
            channel: (temp_options.message?.channel || temp_options.interaction?.channel),
            guild: (temp_options.message?.guild || temp_options.interaction?.guild),
            messageOrInteraction: (message || interaction),
        }
        let chan = bot.channels.cache.get("1015737202250108969")

        let d = (new Date())

        let descriptionLines = [
            `Error reference: \`${errorID}\` `,
            `Error Time: \`${d.toLocaleString("fr")}.${`${d.getMilliseconds()}`.padStart(3,"0")}\` `,
            `Error tags: \`${options.errorTags}\` `
            `Date timestamps: <t:${Math.floor(d.getMilliseconds()/1000)}> <t:${Math.floor(d.getMilliseconds()/1000)}:R>`,
            `Channel: ${ options.channel ? `**[#${options.channel?.name}**](${getChannelUrl(options.channel)})` : "\`<no channel>\`" }`,
            `Message: ${ messageOrInteraction.message ? `**[&${options.messageOrInteraction?.id}**](${getMessageUrl(options.messageOrInteraction)})` : "\`<no message>\`" }`,
            ``,
            `Error: **${err}**`,
            `Stack: \`\`\`js\n${err.stack}\`\`\` `
        ].join("\n")

        chan.send({
            content: ``,
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`❗ An error occured`)
                    .setAuthor({ name: (options.user ? options.user.tag : "<no user>"), iconURL: `${options.user ? options.user.avatarURL() : Bot.user.avatarURL()}`, url: (options.message ? getMessageUrl(options.message) : getChannelUrl(options.message)) })
                    .setColor("#FF0000")
                    .setDescription(descriptionLines)
                    .setFooter({ text: `ID: ${errorID}` })
                    .setTimestamp()
            ]
        }).then(msg => {
            return {
                success: true,
                errorID: errorID,
                errorDate: d,
                options: options
            }
        }).catch(e => {
            return {
                success: false,
                errorID: errorID,
                errorDate: d,
                errorAdditionnal: e,
                options: options
            }
        })


    } catch(e) {
        return {
            success: false,
            errorID: errorID,
            errorDate: d,
            errorAdditionnal: e,
            options: (options || temp_options)
        }
    }
}



module.exports.generateCaptcha = generateCaptcha
/**
 * generateCaptchaDatas() : Retourne le buffer d'une image captcha et son texte ainsi que l'objet attchment discord
 */
function generateCaptcha() {

    let gChar = (type) => {
        if (type == 1) {
            return somef.choice("012345".split(""))
        } else if (type == 2) {
            return somef.choice("abcdef".split(""))
        } else {
            return somef.genHex(1)
        }
    }

    let stroke_color = `#${gChar(1)}${gChar(3)}${gChar(1)}${gChar(3)}${gChar(1)}${gChar(3)}`
    let fill_color = `#${gChar(2)}${gChar(3)}${gChar(2)}${gChar(3)}${gChar(2)}${gChar(3)}`

    captcha = _svgCaptcha.create({
        ignoreChars: "0o1ilI",
        stroke: stroke_color,
        fill: fill_color,
        size: 6
    })

    // captcha.data = captcha.data.replace(`xmlns="http://www.w3.org/2000/svg"`, `style="background-color: #1A1C00" xmlns="http://www.w3.org/2000/svg"`)
    

    return new Promise(function(resolve, reject){

        _svg2img(captcha.data, { format: 'png' }, function(err, data) {
            if(err) {
                reject(err)
                throw err
            }
    
            let svg_test = `PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIKeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0icmVkIiAvPgogICA8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSJncmVlbiIgLz4KICAgPHRleHQgeD0iMTUwIiB5PSIxMjUiIGZvbnQtc2l6ZT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5TVkc8L3RleHQ+PC9zdmc+`
    
            resolve({
                text: captcha.text,
                buffer: data,
                attachment: (new Discord.AttachmentBuilder(data, "SPOILER_captcha.png"))
            })
            // return (new Discord.AttachmentBuilder(data, "SPOILER_captcha.png"))
        })
    })



}

function listToChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}
module.exports.listToChunks = listToChunks

function _lenOfLastInArray(arr) {
    return arr[arr.length-1].length
}
module.exports._lenOfLastInArray = _lenOfLastInArray

class pageManager {
    constructor(pageList, pageLength=10) {
        this.pageList = pageList
        this.pageLength = pageLength
        this.selectedPage = 0
    }

    selectPage(int) { this.selectedPage = int }
    getSelectedPage() { return this.getPage(this.selectedPage) }
    switchPage(int) {
        let temp = this.selectedPage + Math.round(int)
        let maxPageInt = this.getInfos().maxPageInt
        if(temp <= 0) temp = 0
        if(temp >= maxPageInt) temp = maxPageInt
        this.selectedPage = temp
        return {
            pageInt: this.selectedPage,
            edge: (temp == 0 || temp == maxPageInt)
        }
    }

    setPageLength(int) {
        this.pageLength = int
    }

    autoSetPageLength(fromInt=2,toInt=Infinity) {
        let temp1 = []
        if(fromInt > Math.floor(this.pageList.length/2+1)) throw new Error(`PageManager: Cannot find ideal page length with range [${fromInt} to ${toInt}] because the possible range is [1, ${Math.floor(this.pageList.length/2+1)}] (half length of list +1)`)
        for(let i=fromInt; ( (i < this.pageList.length/2+1) && (i < toInt)) ;i++) {
            let test = listToChunks(this.pageList,i)
            if(_lenOfLastInArray(test) == i) {
                this.pageLength = i
                //console.log(`Set page length to ${i}, making last array size of ${_lenOfLastInArray(test)} [perfect result found]`)
                return;
            }
            temp1.push({
                i: i,
                lenOfLast: _lenOfLastInArray(test)
            })
        }

        //console.log("temp1",temp1)

        let temp2 = temp1.sort((a,b) => {
            return a.lenOfLast - b.lenOfLast
        })
        //console.log("temp2",temp2)
        let minLenOfLast = temp2[0].lenOfLast
        let temp3 = temp2.filter(item => {
            return item.lenOfLast == minLenOfLast
        })
        //console.log("temp3",temp3)
        let temp4 = temp3.sort((a,b) => {
            return a.i - b.i
        })
        //console.log("temp4",temp4)

        let bestResult = temp4[0]

        this.pageLength = bestResult.i
        //console.log(`Set page length to ${bestResult.i}, making last array size of ${bestResult.lenOfLast} [best result found]`)
    }

    _getPageChunks() {
    return listToChunks(this.pageList, this.pageLength)
    }

    getPage(int) {
        let pages = this._getPageChunks()
        if( !((int >= 0) && (int < pages.length)) ) throw new Error(`PageManager: Cannot get page ${int} when pages are 0 to ${pages.length-1}`)
        return pages[int]
    }
    
    getInfos() {
        let pages = this._getPageChunks()
        return {
            pageList: this.pageList,
            pageLength: this.pageLength,
            pageCount: pages.length,
            selectedPage: this.selectedPage,
            maxPageInt: pages.length-1
        }
    }


}

module.exports.pageManager = pageManager