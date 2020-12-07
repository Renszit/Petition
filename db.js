var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:rens:petition@localhost:5432/petition");

module.exports.addSignature = (signature, user_id) => {
    const q = `INSERT INTO petition (signature, user_id) 
    VALUES ($1,$2)
    RETURNING id`;
    const params = [signature, user_id];
    return db.query(q, params);
};


module.exports.addRegister = (first, last, email, hash) => {
    const r = `INSERT INTO users (first,last, email, pass)
    VALUES ($1,$2,$3,$4)
    RETURNING id`;
    const param = [first, last,email, hash];
    return db.query(r,param);
};

module.exports.registered = () => {
    return db.query("SELECT COUNT(*) FROM users");
};

module.exports.signees = () => {
    return db.query("SELECT first, last FROM users");
};

module.exports.getSig = (id) => {
    let params = [id];
    return db.query("SELECT signature FROM petition WHERE id = ($1)", params);
};