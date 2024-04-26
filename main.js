const { Client } = require('ps-client');
const config = require("./config.json");
const Bot = new Client({ username: config.username, password: config.password, debug: true, avatar: config.avatar, rooms: config.rooms });
Bot.connect();

const latexConverter = require('./latexToBase64SVGHTML');


//ttl variables
let isOpen = false;
let bp;
let users = [];
let asked = false;
let locked = false;

Bot.on('message', message => {


    // if(message.type=="pm"){
    //     if(message.author.userid=="geysers"){

    //     }
    // }

    //preload
    if (message.isIntro && message.type=="chat" && message.author.userid != "steambotgeyser") {
        if (message.target.roomid == "trivia") {
            if (!searchByUser(message.author)) {
                users.push(new TriviaUser(message.author));
                console.log(users.length);
            }
        }
        return;
    }

    //schol
    if (!message.isIntro && message.type=="chat" && message.target.roomid == "scholastic") {
        if (message.content.substring(0, 1) == "\\") {
            if (message.content.substring(1, 4).toLowerCase() == "tex") {
                let m = message.content.substring(5, message.content.length);
                latexConverter.latexToBase64SVGHTML(m, (err, imgTag) => {
                    if (err) {
                        console.error("Conversion failed:", err);
                    } else {
                        message.target.send("!htmlbox " + imgTag.substring(0,imgTag.length-2)+"width=\"" + 20*m.length + "\"height=\"50\"");
                    }
                });
            }
        }
    }

    //triv
    if (message.type == "chat" && message.author.userid != "steambotgeyser") {
        if (message.target.roomid == "trivia") {
            if (!searchByUser(message.author)) {
                users.push(new TriviaUser(message.author));
                console.log(users.length);
            }
            let m = message.content;
            console.log(message.author.userid.trimEnd() + ": " + m);
            if (yes(m.split(" ")[0]) && asked && (message.author == bp || auth(message.author))) {

                asked = false;
                marray = m.split(" ");
                m = "";
                for (let i = 1; i < marray.length; i++) {
                    m += marray[i];
                }
                console.log("yes'd " + m);
                bp = searchByName(m);
                update(message.author.userid);
                update(m);
                message.target.send("**It is now " + m + "'s turn to ask a question.**");

            } else if (m.substring(0, 2) == "**" && m.substring(m.length - 2, m.length) == "**") {

                console.log("bold " + message.author.userid + "," + bp.userid);
                if (message.author == bp && !asked && !locked) {

                    asked = true;
                    console.log("bolded q");

                }

            } else if ((m == "~openbp" || m == "~bpopen") && !locked && (bp == message.author || auth(message.author))) {

                console.log("opened");
                message.target.send("**BP is now open (say \"me\" or \"bp\" to claim it).**");
                isOpen = true;

            } else if (m == "~bp" && auth(message.author)) {

                console.log("bpmessage ");
                message.target.send("It is currently " + bp.userid + "'s turn to ask a question.");

            } else if (isOpen && (m.toLowerCase() == "bp" || m.toLowerCase() == "me")) {

                console.log("claimed");
                bp = message.author
                update(bp);
                message.target.send("**It is now " + bp.userid + "'s turn to ask a question!**");
                isOpen = false;

            } else if (m == "~summary" && auth(message.author)) {

                console.log("summary");
                message.target.send(summary());

            } else if ((m == "~bplock" || m == "~lockbp" || m == "~shutup") && auth(message.author) && !locked) {

                locked = true;
                message.target.send("**BP is now locked.  Nobody may ask questions.**");

            } else if ((m == "~unshutup") && auth(message.author) && locked) {

                locked = false;
                message.target.send("**BP is no longer locked.**");

            } else if (m.slice(0, 3) == "~bp" && auth(message.author)) {

                console.log("better bpmessage" + m.substring(4, m.length));
                let target = m.substring(4, m.length).trimEnd();
                bp = searchByName(target);
                message.target.send("It is now " + bp.userid + "'s turn to ask a question!");

            }
        }
    }

});



//trivia stuff
function yes(str) {
    return (str == "~yes" || str == "~nyaa" || str == "~ye" || str == "~y" || str == "~claro" || str == "~wellgoogled" || str == "~closeenough");
}

function auth(op) {
    return (op.userid == "geysers" || op.group != " ");
}

function summary() {
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
        console.log(users[i].obj.userid + " " + n);
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