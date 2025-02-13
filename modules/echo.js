const util = require("./hidden/util.js");

let echoModule = {
    name: "echo",
    type: "any",
    auth: (op) => {return util.auth(op, "%")},
    func: (message) =>  message.target.send(util.trimRaw(message.content, "echo"))
};

module.exports = echoModule;