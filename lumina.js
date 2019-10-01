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
console.log(keywordJSON);
//console.log(keywordJSON.nani.Keyword);
for (obj in keywordJSON)
{
    keywordArr.push(obj); 
}
console.log(keywordArr);

client.on("ready", () => {
    console.log("ready");
    client.user.setActivity(clientActivity.name, clientActivity["options.type"]).then( value => 
        console.log("Presence set!")); 
    client.channels.get('619406405685870593').send('Ready and listening!');
});


//VERY LARGE Message Processing Function
client.on("message", (message) => {
    console.time("Message processing");
    if (message.author.bot) return;
    var messageFlag = false;
    //if (!message.content.startsWith(prefix)) return;

    //Who are You
    if (message.content.startsWith("!whoareyou"))
    messageFlag = true;
    message.channel.send(client.user.id);

    //Snowflake Decode
    if (message.content.startsWith(prefix + "snowflake_decode"))
    {
        messageFlag = true;
        var stringArr = message.content.split(" ");
        var deconSnowflake = SnowflakeUtil.deconstruct(stringArr[1]);
        message.channel.send("Timestamp (UNIX?):" + deconSnowflake.timestamp +
            "\nDate :" + deconSnowflake.date + 
            "\nWorker ID:" + deconSnowflake.workerID + 
            "\nProcess ID:" + deconSnowflake.processID + 
            "\nIncrement:" + deconSnowflake.increment + 
            "\nBinary: " + deconSnowflake.binary );
    }

    //VC testing command
    if(message.content.startsWith(prefix + "VC Join Test")) {
        messageFlag = true;
        message.member.voiceChannel.join()
        .then(connection => {
            message.channel.send("Joined successfully!");
            setTimeout(function() {
                connection.disconnect();
                message.channel.send("Left successfully!");
            },5000)
        });
    }

    //VC File playing test command
    //Use Forward Slashes
    if (message.content.startsWith(prefix + "VC Play Test")) {
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
            })
        })
        .catch(console.error);
        } else {
            message.channel.send("Could not find voice channel: You may have not joined a voice channel")
        }
        
    }

    if (message.content.startsWith(prefix + "toConsole")) {
        messageFlag = true;
        console.log(message.content);
    }
    
    //User Id 
    if (message.content.startsWith("!id")) {
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
        messageFlag = true;
        console.log(message.author.id)
        message.channel.send(message.author.id);
    }

    //Ping-pong
    if (message.content.startsWith("ping")) {
        messageFlag = true;
        message.channel.send("pong!");
        console.log(message.channel.id);
    }

    //Add keywords
    //Ideal syntax: !AddResponse Keyword Response
    //Rethink sterilization: eval function?
    if(message.content.toLowerCase().startsWith((prefix + "addresponse"))) {
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
            if (error == TypeError )
            {
                console.log(error);
                message.channel.send("Cannot add response: There might have been a syntax error");
            }
        }
        
    }

    //Reply to Xinxin's bot
    if (message.content === "https://www.youtube.com/watch?v=vxKBHX9Datw" && message.author.id == "617473101852180488") {
        messageFlag = true;
        message.channel.send ("<@617473101852180488> SHTAAAAALP PLZZZZZ ");
    }

    if (message.content === prefix + "err") {
        messageFlag = true;
        throw new Error;
    }

    //Shutdown command
    if(message.content === "shutdown" && message.author.id == '282571468393414667')
    messageFlag = true;
    console.timeEnd();
    console.timeLog();
    client.channels.get('619406405685870593').send('Going offline...')
        .then(value => client.destroy()
            .then(value2 => {
        process.exit();
        })
    );

    //Return keywords (should be last always!)
    if (!messageFlag) {
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
                message.channel.send(keywordJSON[resultArr[0]].Response);
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
            }
        }
        catch (e) {
            if (e !== BreakException) throw e;
        }
    }
    console.timeEnd();
    console.timeLog();
});

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
    console.log("Client destroyed successfully");
    throw err;
  })