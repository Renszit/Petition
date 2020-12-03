var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

db.query("SELECT * FROM petition")
    .then(function (result) {
        console.log(result.rows);
    })
    .catch(function (err) {
        console.log(err);
    });

module.exports.addSignature = (firstName, lastName, signature) => {
    const q = `INSERT INTO petition (firstName,lastName, signature)
    VALUES ($1 , $2, $3)`;
    const params = [firstName, lastName, signature];
    return db.query(q, params);
};
