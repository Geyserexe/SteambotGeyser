let modules = {};
const config = require("../config.json");

require('fs').readdirSync(__dirname + '/').forEach(function (file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    let name = file.replace('.js', '');
    modules[name] = (require('./' + file));
    if (config.debug) {
      console.log(`loaded module: ${name}`);
    }
  }
});

module.exports = modules;
