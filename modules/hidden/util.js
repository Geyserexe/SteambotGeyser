const config = require("../../config.json");

let auth = ((op, level) => {
    if(config.debug){
        console.log(`checking user ${op.group}${op.userid} for auth ${level}`)
    }
    if (level == "any") {
        return true;
    }
    if (op.userid == config.owner.toLowerCase()) {
        return true;
    }
    if (level == "+") {
        return (op.group == "+" || op.group == "%" || op.group == "@" || op.group == "#" || op.group == "~");
    }
    if (level == "%") {
        return (op.group == "%" || op.group == "@" || op.group == "#" || op.group == "~");
    }
    if (level == "@") {
        return (op.group == "@" || op.group == "#" || op.group == "~");
    }
    if (level == "#") {
        return (op.group == "#" || op.group == "~");
    }
    return false;
});

module.exports.auth = auth;

let trimRaw = ((message, command) => {
    if(config.debug){
        console.log(`trimming ${command} off ${message}`);
    }
    return message.substring(command.length+2);
})

module.exports.trimRaw = trimRaw;