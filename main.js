const { Client } = require('ps-client');
const config = require("./config.json");
const fs = require('fs');
const Bot = new Client({ username: config.username, password: config.password, debug: true, avatar: config.avatar, rooms: config.rooms });
Bot.connect();

const modules = require("./modules/index.js");

const commandChar = config.commandChar;
const owner = config.owner.toLowerCase();
const debug = config.debug;

let triv = null;

//ttl alts
const yesAlts = ["yes", "y", "ye", "ya", "claro", "nyaa", "nya", "yech", "yemen", "closeenough", "wellgoogled", "sure", "oui", "ja", "verily", "tak", "damnright", "hellyeah"];
const meAlts = ["me", "bp", "bpme", "mebp", "/me", "meow"];

//ttl variables
let ttl = false;
let isOpen = false;
let bp;
let users = [];
let asked = false;
let locked = false;

Bot.on('message', message => {

    const authorName = message.author.userid;
    const target = message.target;
    const type = message.type;

    const raw = message.content;
    let re = "";

    //handle backslash as command char because otherwise it just treats it as an escape character :(
    if(commandChar == "\\"){
        re = new RegExp(String.raw`[^a-zA-Z0-9\\ ]`, "g");
    } else {
        re = new RegExp(String.raw`[^a-zA-Z0-9${commandChar} ]`, "g");
    }
    const content = message.content.replace(re, "");

    const isCommand = raw.substring(0, 1) == commandChar;
    let tempCommand = "";
    let mixedBody = "";

    if (isCommand) {
        let k = 1;
        while (k < content.length && content[k] != " ") {
            tempCommand += content[k];
            k++;
        }
        k++;
        while (k < content.length) {
            mixedBody += content[k];
            k++;
        }
        mixedBody.trimEnd();
    }

    const command = tempCommand.toLowerCase();
    const body = mixedBody.toLowerCase();
    const bold = raw.substring(0, 2) == "**" && raw.substring(raw.length - 2) == "**";
    if (type == "pm") {
        if (authorName == owner) {
            if (isCommand) {
                if (debug) console.log(`${owner} pmed ${command}`);
                switch (command) {
                    case "ttl":
                        switch (body) {
                            case "on":
                                if (!ttl) {
                                    target.send("ttl on");
                                    ttl = true;
                                } else {
                                    target.send("ttl already on");
                                }
                                return;
                            case "off":
                                if (!ttl) {
                                    target.send("ttl already off");
                                } else {
                                    target.send("ttl off");
                                    ttl = false;
                                }
                                return;
                        }
                        target.send(`ttl: ${ttl}`);
                        return;
                    case "yesalts":
                        let s = "";
                        yesAlts.forEach(y => {
                            s += y + ", ";
                        });
                        target.send(`!code Yes alts: ${s}`);
                        return;
                }
            }
        }
    }

    //preload
    if (message.isIntro && type == "chat" && authorName != config.username.toLowerCase()) {
        if (target.roomid == "botdevelopment") {
            if (!searchByUser(message.author)) {
                users.push(new TriviaUser(message.author));
                if (debug) console.log(users.length);
            }
        }
        return;
    }

    //access modules, run as needed
    if(!message.isIntro && isCommand && authorName != config.username.toLowerCase()){
        if(modules[command] && (modules[command].type == "any" || modules[command].type == type)){
            let m = modules[command];
            if(m.auth(message.author)){
                m.func(message);
                return;
            } else {
                target.send("your rank is not high enough to use this command.");
            }
        }
    }

    //triv
    if (type == "chat" && authorName != config.username.toLowerCase() && ttl) {
        if (target.roomid == "trivia") {
            if (!triv) {
                triv = target;
            }
            if (!searchByUser(message.author)) {
                users.push(new TriviaUser(message.author));
                if (debug) console.log(users.length);
            }
            if (debug) console.log(authorName.trimEnd() + ": " + content);
            if (isCommand) {
                if (message.author == bp || auth(message.author)) {
                    if (yes(command) && asked) {
                        let oldbp = bp;
                        try {
                            bp = searchByName(body);
                            update(bp.userid);
                            update(authorName);
                        } catch {
                            console.log("bad yes");
                            bp = oldbp;
                            message.author.send("Error: that user is not in this room or has not spoken recently.");
                            return;
                        }
                        asked = false;
                        if (debug) console.log("yes'd " + body);

                        target.send("**It is now " + bp.userid + "'s turn to ask a question.**");
                        return;
                    }
                    switch (command) {
                        case "openbp":
                        case "bpopen":
                            if (!locked) {
                                if (debug) console.log("opened");
                                target.send("**BP is now open (say \"me\" or \"bp\" to claim it).**");
                                isOpen = true;
                            }
                            return;
                    }

                }

                if (auth(message.author)) {
                    switch (command) {
                        case "bp":
                            if (body.length > 0) {
                                if (debug) console.log("better bpmessage" + body);
                                let oldbp = bp;
                                try {
                                    bp = searchByName(body);
                                    target.send("It is now " + bp.userid + "'s turn to ask a question.");
                                } catch {
                                    bp = oldbp;
                                    target.send("Error: That user is not in this room.");
                                }
                                return;
                            }
                            if (debug) console.log("bpmessage ");
                            target.send("It is currently " + bp.userid + "'s turn to ask a question.");
                            return;
                        case "help":
                            if (debug) console.log("helpmessage");
                            target.send(`!code Hi! I'm a bot made by Geysers to fill in for Jeopard-E when it goes down.  Extract score data with ${commandChar}summary and lock me (without muting!) with ${commandChar}shutup.  I can be unlocked with ${commandChar}unshutup. View yesalts with ${commandChar}yesalts. Otherwise, I run ttl just like jeop, but without handling vetoes or ~no, so be careful! I'm also not very good with special characters in names, so try to cut those out when yessing. Thanks!`);
                            return;
                        case "summary":
                            if (debug) console.log("summary");
                            target.send("!code " + summary());
                            return;
                        case "bplock":
                        case "lockbp":
                        case "shutup":
                            if (debug) console.log(`${authorName} locked bp`);
                            if (!locked) {
                                locked = true;
                                target.send("**BP is now locked.  Nobody may ask questions.**");
                            } else {
                                target.send("BP is already locked.");
                            }
                            return;
                        case "unshutup":
                            if (debug) console.log(`${authorName} unlocked bp`);
                            if (!locked) {
                                target.send("BP is already unlocked");
                            } else {
                                locked = false;
                                target.send("**BP is no longer locked.**");
                            }
                            return;
                        case "yesalts":
                            let s = "";
                            yesAlts.forEach(y => {
                                s += y + ", ";
                            });
                            target.send(`!code Yes alts: ${s}`);
                            return;
                    }
                }
            }

            if (bold) {

                if (debug) console.log("bold " + authorName + "," + bp.userid);
                if (message.author == bp && !asked && !locked) {

                    asked = true;
                    if (debug) console.log("bolded q");
                    return;
                }

            }

            if (isOpen && checkMeAlt(content)) {

                if (debug) console.log("claimed");
                bp = message.author;
                update(bp.userid);
                target.send("**It is now " + bp.userid + "'s turn to ask a question!**");
                isOpen = false;
                return;

            }
        }
    }

});

//log join / leaves

Bot.on("join", (room, user, isIntro) => {
    if (debug) console.log(user + ">" + room);
    if (user.toLowerCase() == "*jeopard-e" && room.toLowerCase() == "trivia" && !isIntro) {
        ttl = false;
        triv.send(`!code ${summary}`);
    }
});

Bot.on("leave", (room, user, isIntro) => {
    if (debug) console.log(user + "<" + room);
    if (user.toLowerCase() == "*jeopard-e" && room.toLowerCase() == "trivia" && !isIntro) {
        ttl = true;
        triv.send("Jeopard-E has left, starting ttl. Please assign bp.");
    }
});

//trivia stuff
function yes(str) {
    str.trimEnd();
    str = str.toLowerCase();
    for (let i = 0; i < yesAlts.length; i++) {
        let y = yesAlts[i];
        if (str == y) {
            return true;
        }
    }
    return false;
}

function checkMeAlt(str) {
    str = str.trimEnd().toLowerCase();
    str.replace(/[^a-zA-Z]/g, "")
    for (let i = 0; i < meAlts.length; i++) {
        let m = meAlts[i];
        if (str == m) {
            return true;
        }
    }
    return false;
}

function auth(op) {
    return (op.userid == owner || op.group != " ");
}

function summary() {
    let s = "";
    users.forEach(u => {
        if (u.points > 0) {
            s += "__" + u.obj.userid + "__: " + u.points + ",";
        }
    });
    return s;
}

function searchByUser(u) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].obj.userid == u.userid) {
            return users[i].obj;
        }
    }
    return false;
}

function searchByName(n) {
    for (let i = 0; i < users.length; i++) {
        if (debug) console.log(users[i].obj.userid + " " + n);
        if (users[i].obj.userid == n.toLowerCase() || users[i].obj.name.toLowerCase() == n.toLowerCase()) {
            return users[i].obj;
        }
    }
}

function update(n) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].obj.userid == n.toLowerCase() || users[i].obj.name.toLowerCase() == n.toLowerCase()) {
            users[i].points++;
            return;
        }
    }
}

class TriviaUser {
    obj;
    points = 0;

    constructor(user) {
        this.obj = user;
    }
}