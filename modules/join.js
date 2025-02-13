const util = require("./hidden/util.js");

let joinModule = {
    name: "join",
    type: "pm",
    auth: (op) => {return util.auth(op, "%")},
    func: (message) => {
        let tRoom = message.content.substring(5);
        message.target.send("joining " + tRoom);
        message.target.send("/j " + tRoom);
    }
};

module.exports = joinModule;