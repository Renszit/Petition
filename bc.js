const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

exports.hash = (pass) => {
    return genSalt().then((salt) => {
        return hash(pass, salt);
    });
};

exports.compare = compare;
