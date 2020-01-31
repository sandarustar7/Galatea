const Discord = require("discord.js");
const SnowflakeUtil = Discord.SnowflakeUtil;
const clientSecret = require("./secret.json");

const ffmpeg = require("ffmpeg");
const leven = require('fast-levenshtein');
const fs = require('fs');
const youtubedl = require('youtube-dl');
const ytdl = require('ytdl-core');
const youtubeStream = require('youtube-audio-stream');
const forever = require("forever-monitor");
const ttscloud = require('@google-cloud/text-to-speech');
const util = require('util');

const keyFile = "./serviceAccount.json";
const projectId = 'discordtts-262305';
const ttsClient = new ttscloud.TextToSpeechClient({projectId, keyFile});
//const api = require('twitch-api-v5');

const client = new Discord.Client();
const UNIXOffset = 1420070400000;

const clientActivity = {
    'name' : ' with the universe',
    'options.type' : 'PLAYING'
}
var prefix = '!';


//var keywordJSON = JSON.parse(fs.readFileSync('keyword.json').toString());
var keywordJSON = {
    "nani" : {
        "Response": "insert text here"  
    }
}
//Loop through all the stuff in the keyword json and add the name to an array
var i = 0;
var keywordArr = [];
//console.log(keywordJSON);
//console.log(keywordJSON.nani.Keyword);
/*for (obj in keywordJSON)
{
    keywordArr.push(obj); 
}
console.log(keywordArr); */

client.on("ready", () => {
    console.log("ready");
    client.user.setActivity(clientActivity.name, clientActivity["options.type"]).then( value => 
        console.log("Presence set!")); 
    //client.channels.get('619406405685870593').send('Ready and listening!');
    banhammer = client.emojis.get("659205334900146199");
    console.log(client.emojis.get("659205334900146199").name);
    hammerfilter = (reaction, user) => {
        return (reaction.emoji.name === banhammer.name && !user.bot);
        //return true;
    }
});

//VERY LARGE Message Processing Function
client.on("message", (message) => {
    let action = false;
    const date = new Date();
    const time = process.hrtime();
    console.log("______NEW MESSAGE_______");
    var diff;
    if (replytoXinxinsBot(message) || message.author.bot) return;

    const defaultCommands = new Promise(function(resolve, reject) {
        if (help(message) || whoareyou(message) || snowflakeDecode(message) || vcJoinTest(message) || vcPlayTest(message) || toConsole(message)
        || id(message) || whoami(message) || ping (message) || err(message) || addResponse(message) || shutdown(message)
        || vcPlayTest2(message) || textToSpeech(message) || emojiId(message) || cheese(message)
        || wavenet(message)) {
            action = true;
            resolve(true);
        } else {
            resolve(false);
        }
    });

    defaultCommands.then(value => {
        if (value === true) {
            console.log("function found");
        } else if (value === false) {
            console.log("function not found");
            if (keywordResponse(message)) {
                console.log("Keyword Response");
            }
        }
        banhammers(message, date);
        diff = process.hrtime(time);
        console.log(diff[1]/1000000 + "ms @ " + date.toTimeString());
    })
    .catch(error => {
        console.log(error);
        throw error;
    })
});

function help (message) {
    if (message.content.startsWith(prefix + "help")) {
        console.log("help");
        message.channel.send("Sending docs, check your DM's").then(unused => {
            message.author.createDM().then(channel => {
                channel.send("A bot by combatperson#4343."
                + "\nDocumentation is not necessarily up to date"
                + "\nThis bot is very much in development, is not necessarily secure or functional lol"
                + "\n!help: This command lol"
                + "\n!whoareyou: prints this bot's snowflake id"
                + "\n!snowflake_decode: deconstructs the provided snowflake into it's inherent fields"
                + "\n!VC Join Test: joins the user's voice channelf for 5 seconds for testing purposes"
                + "\n!VC Play Test: uses a ffmpeg stream to play a file (on server) back."
                + "\n!toConsole: logs a message's content to the console. Useful for finding emoji/user/channel ids"
                + "\n!id: responds with the id's of tagged users"
                + "\n!whoami: responds with message author's id"
                + "\n!ping: responds with pong"
                + "\n!err: throws error"
                + "\n new commands may have not been added yet, please ask combatperson for clarification"
                + "\n!addresponse: adds the first parameter as a keyword, adds the second parameter as a response (because I'm lazy and used string.split(\" \"), only one word per response and keyword can be used"
                + "\n![keyword]: returns the response parameter");
            });
        });
        return true;
    }
    else return false;
}

function whoareyou(message) {
    //Who are You
    if (message.content.startsWith("!whoareyou")) {
        console.log("who are you");
        message.channel.send(client.user.id);
    }
    return false;
}

function snowflakeDecode(message) {
    if (message.content.startsWith(prefix + "snowflake_decode")) {
        console.log("snowflake decode");
        var stringArr = message.content.split(" ");
        var deconSnowflake = SnowflakeUtil.deconstruct(stringArr[1]);
        message.channel.send("Timestamp (UNIX?):" + deconSnowflake.timestamp +
            "\nDate :" + deconSnowflake.date + 
            "\nWorker ID:" + deconSnowflake.workerID + 
            "\nProcess ID:" + deconSnowflake.processID + 
            "\nIncrement:" + deconSnowflake.increment + 
            "\nBinary: " + deconSnowflake.binary );
        return true;
    }
    else return false;
}

function vcJoinTest(message) {
     //VC testing command
     if(message.content.startsWith(prefix + "VC Join Test")) {
        console.log("VC Join Test");
        message.member.voiceChannel.join()
        .then(connection => {
            message.channel.send("Joined successfully!");
            setTimeout(function() {
                connection.disconnect();
                message.channel.send("Left successfully!");
            },5000)
        });
        return true;
    }
    else return false;
}

function vcPlayTest(message) {
    //VC File playing test command
    //Use Forward Slashes
    if (message.content.startsWith(prefix + "VC Play Test")) {
        console.log("VC File test");
        if (message.member.voiceChannel != null && message.member.voiceChannel != undefined) {
            message.member.voiceChannel.join()
            .then(connection => {
                message.channel.send("Joined Successfully!");
                const dispatcher = connection.playFile("E:/3xperimental/Discord/Galatea/test.mp3");
                dispatcher.on("start", value => {
                    console.log("started playing in theory");
                    console.log(value);
                });
                dispatcher.on("end", value => {
                    console.log("ended playback");
                    console.log(value);
                    connection.disconnect();
                });
            })
            .catch(console.error);
        } else {
            message.channel.send("Could not find voice channel: You may have not joined a voice channel")
        }
        return true;
    }
    else return false;
}

const url = "b2vCs0H3i7U";

function vcPlayTest2(message) {
    if (message.content.startsWith(prefix + "Youtubequery") && message.author.id === "282571468393414667") {
        console.log("VC Play Test 2");
        if (message.member.voiceChannel != null && message.member.voiceChannel != undefined) {
            message.member.voiceChannel.join()
            .then(connection => {
                var requestUrl = 'http://youtube.com/watch?v=' + url;
                /*const readableStream = ytdl(requestUrl, {
                    filter: 'audioonly',
                }); */
                var stream = youtubedl(requestUrl, ['-x', '--audio-format', 'mp3'], {});
                stream.pipe(fs.createWriteStream('temp.mp3'));
                stream.on('end', function end () {
                    const dispatcher = connection.playFile('temp.mp3', {
                        volume: 0.15
                    });
                    dispatcher.on("start", value => {
                        console.log("started playing in theory");
                        console.log(value);
                    });
                    dispatcher.on("end", value => {
                        console.log("ended playback");
                        console.log(value);
                        connection.disconnect();
                    });
                })
                //const dispatcher = connection.playStream(readableStream, {
                //    volume: 0.5
                //});
                
            })
            .catch(console.error);
        } else {
            message.channel.send("Could not find voice channel: You may have not joined a voice channel")
        }
        return true;
    }
    else return false;
}

function toConsole(message) {
    if (message.content.startsWith(prefix + "toConsole")) {
        console.log("toConsole");
        console.log(message.content);
        return true;
    }
    else return false;
}

function id(message) {
    //User Id 
    if (message.content.startsWith("!id")) {
        console.log("User ID")
        for (var [key, value] of message.mentions.users) 
        {
            var deconSnowflake = SnowflakeUtil.deconstruct(key);
            var binarySnowflake = decToBi(key);
            message.channel.send("User id: " + key + 
            "\nBinary Snowflake: " + binarySnowflake + 
            "\nDate joined: " + deconSnowflake.date +
            "\nIs a bot: " + value.bot);
        }
        return true;
    }
    else return false;
}

function whoami(message) {
    if (message.content.startsWith("!whoami")) {
        console.log("Who am I");
        console.log(message.author.id);
        message.channel.send(message.author.id);
        return true;
    }
    else return false;
}

function ping(message) {
    //Ping-pong
    if (message.content.startsWith("!ping")) {
        console.log("Ping-pong");
        message.channel.send("pong!");
        console.log(message.channel.id);
        return true;
    }
    else return false;
}

function err(message) {
    if (message.content === prefix + "err") {
        console.log("error throwing");
        message.channel.send("hecc").then(unused => {
            throw new Error;       
        }).catch(e => {
            throw e;
        });
        return true;
    }
    else return false;
}

function addResponse(message) {
    //Add keywords
    //Ideal syntax: !AddResponse Keyword Response
    //Rethink sterilization: eval function?
    if(message.content.toLowerCase().startsWith((prefix + "addresponse"))) {
        console.log("addResponse");
        try {
            var stringArr = message.content.split(" ");
            var duplicate = false;
            var prefixCheck = false;
            var keyword = stringArr[1].toLocaleLowerCase();
            var response = stringArr[2];
            console.log(keyword + " => " + response);
            if (stringArr[2].includes(prefix))
            {
                prefixCheck = true;
                console.log("Response contains prefix");
                message.channel.send("Error: Response contains prefix");
            }
            keywordArr.forEach(element => {
            console.log(element);
            if (stringArr[1] === element)
            {
                duplicate=true;
                console.log("Duplicate detected!");
                message.channel.send("Cannot add response: Keyword is already a command");
            }
        });

        if (!duplicate && !prefixCheck)
        {
            keywordJSON[keyword] =  {'Response': response }
            keywordArr.push(keyword.toString());
            message.channel.send("Added Response!");
        }

        console.log(keywordJSON);
        console.log(keywordArr);
        keywordArr.forEach(element => {
            console.log(element);
        });
        } catch (error) {
            if (error === TypeError )
            {
                console.log(error);
                message.channel.send("Cannot add response: There might have been a syntax error");
            }
        }
        return true;
    }
    else return false;
}

function replytoXinxinsBot(message) {
    //Reply to Xinxin's bot
    if (message.content === "https://www.youtube.com/watch?v=vxKBHX9Datw" && message.author.id === "617473101852180488") {
        console.log("Reply to Xinxin's bot");
        message.channel.send ("<@617473101852180488> SHTAAAAALP PLZZZZZ ");
        return true;
    }
    else return false;
}

function shutdown(message) {
    //Shutdown command
    if(message.content === "shutdown" && message.author.id === '282571468393414667') {
        console.log("Shutdown");
        client.channels.get('619406405685870593').send('Going offline...')
        .then(value => 
            client.destroy()
        .then(value2 => {
            process.exit();
        })
        );
        return true;
    }
    else return false;
}

function keywordResponse(message) {
    //Return keywords (should be last always!)
    var BreakException = {};
    var resultArr = [];
    var distanceArr = [];
    try {
        keywordArr.forEach(element => {
            if (message.content.startsWith('!' + element) && !message.author.bot) {
                resultArr.push(element);
                }
            });

            if (resultArr.length === 1) {
                console.log(keywordJSON[resultArr[0]].Response);
                message.channel.send(keywordJSON[resultArr[0]].Response);
                return true;
            }
            else if (resultArr.length > 1) {
                for (var i=0; i < resultArr.length; i++) {
                    distanceArr[i] = leven.get(message.content, resultArr[i])
                }
                var lowestIndex = 0;
                for (var i=0; i< distanceArr.length; i++) {
                    if (distanceArr[i] < lowestIndex) {
                        lowestIndex = i;
                    }
                }
                console.log(keywordJSON[resultArr[lowestIndex]].Response);
                message.channel.send(keywordJSON[resultArr[lowestIndex]].Response);
                return true;
            }
        }
        catch (e) {
            if (e !== BreakException) throw e;
        }
}

function textToSpeech(message) {
    if (message.content.toLowerCase().startsWith((prefix + "speech"))) {
        console.log("tts");
        message.channel.send("Processing TTS...").then(statusMessage => {
            ttsProcessing(message, statusMessage);
        });
        return true;
    } else return false;
}
async function ttsProcessing(message, statusMessage) {
    var content = message.content.split(" ");
        var text = content.slice(1).join(" ");
        const request = {
            input : {text: text},
            voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
            audioConfig: {audioEncoding: 'MP3'},
        };
        try {
            const [response] = await ttsClient.synthesizeSpeech(request);
            const writeFile = util.promisify(fs.writeFile);
            await writeFile('output.mp3', response.audioContent, 'binary');
            message.channel.send({
                files: [{
                    attachment: 'output.mp3',
                    name: 'TTS.mp3'
                }] 
            });
        } catch (e) {
            if (e.message === "8 RESOURCE_EXHAUSTED: Resource has been exhausted (e.g. check quota).") {
                message.channel.send("Quota exhausted! Please wait a minute before sending");
            } else {
                throw e;
            }
        }
        finally {
            statusMessage.delete();
        }
}

async function listENVoices(message) {
    console.log(await ttsClient.listVoices(
        {
        languageCode: "en"
    }
    ));
}

function wavenet(message) {
    if (message.content.startsWith((prefix + "wavenet"))) {
        if (message.author.id === '282571468393414667') {
            console.log("tts");
            message.channel.send("Processing Wavenet...").then(statusMessage => {
                wavenetProcessing(message, statusMessage);
            });
            return true;
        }
        message.channel.send("Unauthorized. Try using the tts command instead");
    }
    return false;
}

async function wavenetProcessing(message, statusMessage) {
    var content = message.content.split(" ");
        var text = content.slice(1).join(" ");
        const request = {
            input : {text: text},
            voice: {languageCode: 'en-US', voice: "en-US-Wavenet-A", ssmlGender: 'NEUTRAL'},
            audioConfig: {audioEncoding: 'MP3'},
        };
        try {
            const [response] = await ttsClient.synthesizeSpeech(request);
            const writeFile = util.promisify(fs.writeFile);
            await writeFile('wavenet.mp3', response.audioContent, 'binary');
            message.channel.send({
                files: [{
                    attachment: 'wavenet.mp3',
                    name: 'wavenet.mp3'
                }] 
            });
        } catch (e) {
            if (e.message === "8 RESOURCE_EXHAUSTED: Resource has been exhausted (e.g. check quota).") {
                message.channel.send("Quota exhausted! Please wait a minute before sending");
            } else {
                throw e;
            }
        }
        finally {
            statusMessage.delete();
        }
}

function emojiId(message) {
    if (message.content.startsWith(prefix + "emoji")) {
        console.log("emoji");
        var text = message.content.split(" ");
        console.log(text[1]);
        //message.channel.send(text[1]);
        //message.channel.send(client.emojis.get("659205334900146199").toString());
        return true;
    }
    return false;
}

var banhammer;

var hammerfilter;

function banhammers(message, time) {
    const collector = message.createReactionCollector(hammerfilter, {time: 600000});

    collector.on('collect', (reaction, reactionCollector) => {
        console.log('Collected ' + reaction.emoji.name + ' at ' + ((new Date).toTimeString()) + ' for message at: ' + time.toTimeString());
    })

    collector.on('end', collected => {
        console.log('Collected ' + collected.size + ' reaction(s) for message at: ' + time.toTimeString());
    });
}


function cheese(message) {
    if (message.content.toLowerCase().startsWith((prefix + "cheese"))) {
        message.channel.send(":notes: I'm on the moon... It's made of cheese... :notes:");
        return true;
    }
    return false;
}
decToBi = function(n) {
    var binary = parseInt(n, 10);
    return binary.toString(2);
}

discordToUNIX = function(n) {
    var UNIX = parseInt(n, 2);
    UNIX += UNIXOffset;
    return UNIX;
}

client.login(clientSecret.secret);

function asyncTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*process.on('uncaughtException', function (err) {
    client.destroy();
    console.error(err);
    console.log("uncaughtException: Client destroyed successfully");
    throw err;
  })*/

