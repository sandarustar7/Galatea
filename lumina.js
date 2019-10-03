const Discord = require("discord.js");
const SnowflakeUtil = Discord.SnowflakeUtil;
const clientSecret = require("./secret.json");
const ytdl = require("ytdl-core");
const ffmpeg = require("ffmpeg");
const leven = require('fast-levenshtein');
const fs = require('fs');
const client = new Discord.Client();
const UNIXOffset = 1420070400000;
const youtubeStream = require('youtube-audio-stream');
const forever = require("forever-monitor");
//const api = require('twitch-api-v5');
const clientActivity = {
    'name' : ' with the universe',
    'options.type' : 'PLAYING'
}
var prefix = '!';


//var keywordJSON = JSON.parse(fs.readFileSync('keyword.json').toString());
var keywordJSON = {
    "nani" : {
        "Response": "insert text here"  
    },
    
    "pneuma" : {
        "Response": "Coffee with Milk????"
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
    client.channels.get('619406405685870593').send('Ready and listening!');
});


//VERY LARGE Message Processing Function
client.on("message", (message) => {
    //var event = new Event('messageSend');
    console.time("message");
    if (message.author.bot) return;
    var messageFlag = false;
    var finished = false;
    const defaultCommands = new Promise(function(resolve, reject) {
        if (message.content.startsWith(prefix + "help")) {
            help();
        }
        
    })
    //if (!message.content.startsWith(prefix)) return;

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
                + "\n!addresponse: adds the first parameter as a keyword, adds the second parameter as a response (because I'm lazy and used string.split(\" \"), only one word per response and keyword can be used"
                + "\n![keyword]: returns the response parameter");
            });
        });
    }
    //Who are You
    if (message.content.startsWith("!whoareyou")) {
        console.log("who are you");
        messageFlag = true;
        message.channel.send(client.user.id);
        finished = true;
    }

    //Snowflake Decode
    if (message.content.startsWith(prefix + "snowflake_decode"))
    {
        console.log("snowflake decode");
        messageFlag = true;
        var stringArr = message.content.split(" ");
        var deconSnowflake = SnowflakeUtil.deconstruct(stringArr[1]);
        message.channel.send("Timestamp (UNIX?):" + deconSnowflake.timestamp +
            "\nDate :" + deconSnowflake.date + 
            "\nWorker ID:" + deconSnowflake.workerID + 
            "\nProcess ID:" + deconSnowflake.processID + 
            "\nIncrement:" + deconSnowflake.increment + 
            "\nBinary: " + deconSnowflake.binary );
            finished = true;
    }

    //VC testing command
    if(message.content.startsWith(prefix + "VC Join Test")) {
        console.log("VC Join Test");
        messageFlag = true;
        message.member.voiceChannel.join()
        .then(connection => {
            message.channel.send("Joined successfully!");
            setTimeout(function() {
                connection.disconnect();
                message.channel.send("Left successfully!");
            },5000)
        });
        finished = true;
    }

    //VC File playing test command
    //Use Forward Slashes
    if (message.content.startsWith(prefix + "VC Play Test")) {
        console.log("VC File test");
        messageFlag = true;
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
                    finished = true;
            })
        })
        .catch(console.error);
        } else {
            message.channel.send("Could not find voice channel: You may have not joined a voice channel")
            finished = true;
        }
    }

    if (message.content.startsWith(prefix + "toConsole")) {
        console.log("toConsole");
        messageFlag = true;
        console.log(message.content);
        finished = true;
    }
    
    //User Id 
    if (message.content.startsWith("!id")) {
        console.log("User ID")
        messageFlag = true;
        for (var [key, value] of message.mentions.users) 
        {
            var deconSnowflake = SnowflakeUtil.deconstruct(key);
            var binarySnowflake = decToBi(key);
            message.channel.send("User id: " + key + 
            "\nBinary Snowflake: " + binarySnowflake + 
            "\nDate joined: " + deconSnowflake.date +
            "\nIs a bot: " + value.bot);
        }
        finished = true;
    }

    /*if (message.content.startsWith("!connections"))
    {
        for (var [key, value] of message.mentions.users)
        {

        }
    }*/
    //Discord doesn't allow bots to look at user profiles WHYYYYY

    //Who am I
    if (message.content.startsWith("!whoami")) {
        console.log("Who am I");
        messageFlag = true;
        console.log(message.author.id);
        message.channel.send(message.author.id).then(unused => {
            finished = true;
        });
    }

    //Ping-pong
    if (message.content.startsWith("ping")) {
        console.log("Ping-pong");
        messageFlag = true;
        message.channel.send("pong!").then(unused => {
            finished = true;
        });
        console.log(message.channel.id);
    }

    //Add keywords
    //Ideal syntax: !AddResponse Keyword Response
    //Rethink sterilization: eval function?
    if(message.content.toLowerCase().startsWith((prefix + "addresponse"))) {
        console.log("addResponse");
        messageFlag = true;
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
            if (stringArr[1] == element)
            {
                duplicate=true;
                console.log("Duplicate detected!");
                message.channel.send("Cannot add response: Keyword is already a command").then(unused => {
                    finished = true;
                });
            }
        });

        if (!duplicate && !prefixCheck)
        {
            keywordJSON[keyword] =  {'Response': response }
            keywordArr.push(keyword.toString());
            message.channel.send("Added Response!").then(unused => {
                finished = true;
            });
        }

        console.log(keywordJSON);
        console.log(keywordArr);
        keywordArr.forEach(element => {
            console.log(element);
        });
        } catch (error) {
            if (error == TypeError )
            {
                console.log(error);
                message.channel.send("Cannot add response: There might have been a syntax error").then(unused => {
                    finished = true;
                });
            }
        }
        
    }

    //Reply to Xinxin's bot
    if (message.content === "https://www.youtube.com/watch?v=vxKBHX9Datw" && message.author.id == "617473101852180488") {
        console.log("Reply to Xinxin's bot");
        messageFlag = true;
        message.channel.send ("<@617473101852180488> SHTAAAAALP PLZZZZZ ").then(unused => {
            finished = true;
        });
    }

    if (message.content === prefix + "err") {
        console.log("error throwing");
        messageFlag = true;
        finished = true;
        message.channel.send("hecc").then(unused => {
            throw new Error;       
        }).catch(e => {
            throw e;
        });
    }

    //Shutdown command
    if(message.content === "shutdown" && message.author.id == '282571468393414667') {
        console.log("Shutdown");
        console.timeEnd("message");
        console.timeLog("message");
        client.channels.get('619406405685870593').send('Going offline...')
        .then(value => 
            client.destroy()
        .then(value2 => {
            process.exit();
        })
        );
    }

    //Return keywords (should be last always!)
    if (!messageFlag) {
        console.log("Keyword Response");
        var BreakException = {};
        var resultArr = [];
        var distanceArr = [];
        try
        {
            keywordArr.forEach(element => {
                if (message.content.startsWith('!' + element) && !message.author.bot) {
                    //console.log(keywordJSON[element].Response);
                    resultArr.push(element);
                    //message.channel.send(keywordJSON[element].Response);
                }
            });

            if (resultArr.length == 1) {
                console.log(keywordJSON[resultArr[0]].Response);
                message.channel.send(keywordJSON[resultArr[0]].Response).then(unused => {
                    finished = true;
                });
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
                message.channel.send(keywordJSON[resultArr[lowestIndex]].Response).then(unused => 
                    finished = true);
            }
        }
        catch (e) {
            if (e !== BreakException) throw e;
            finished = true;
        }
    }
    if (finished) {
        console.timeLog("message");
        console.timeEnd("message");
    }
    
});

function help() {

}

function whoareyou() {

}

function snowflakeDecode() {

}

function vcJoinTest() {

}

function vcPlayTest() {

}

function toConsole() {

}

function id() {

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

process.on('uncaughtException', function (err) {
    client.destroy();
    console.error(err);
    console.log("uncaughtException: Client destroyed successfully");
    throw err;
  })