const latexConverter = require("./hidden/latexToBase64SVGHTML");
const config = require("../config.json");
const util = require("./hidden/util.js");

let texModule = {
    name: "tex",
    type: "chat",
    auth: (op) => {return util.auth(op, "any")},
    func: (message) => {
        latexConverter.latexToBase64SVGHTML(message.content.substring(4), (err, imgTag) => {
            let body = message.content.substring(4);
            if (err && config.debug) {
                console.log("Conversion failed: ", err);
            } else {
                message.target.send("!htmlbox " + imgTag.substring(0, imgTag.length - 2) + "width=\"" + 20 * body.length + "\"height=\"50\"");
            }
        })
    }
}

module.exports = texModule;