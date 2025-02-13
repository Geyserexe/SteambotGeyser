const util = require("./hidden/util.js");

let pingModule = {
    name: "ping",
    type: "any",
    auth: (op) => {return util.auth(op, "+")},
    func: (message) =>  message.target.send("pong")
};

module.exports = pingModule;