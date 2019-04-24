var Env: any = {};
var StringUtils = require("./string_utils");

Env.getRequired = function (key: string, msg: string) {
    var value = process.env[key];
    if (StringUtils.isBlank(value)) {
        console.log(`Required environment variable ${key} is not set: ${msg}`);
        throw `Required environment variable ${key} is not set: ${msg}`;
    }
    return value;
}

module.exports = Env;
