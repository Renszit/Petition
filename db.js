var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:rens:petition@localhost:5432/petition");

module.exports.addSignature = (first, last, signature) => {
    const q = `INSERT INTO petition (first, last, signature)
    VALUES ($1, $2, $3)
    RETURNING id`;
    const params = [first, last, signature];
    return db.query(q, params);
};

module.exports.registered = () => {
    return db.query("SELECT (*) FROM petition");
};

module.exports.signees = () => {
    return db.query("SELECT first,last FROM petition");
};