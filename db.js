var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:rens:petition@localhost:5432/petition");

module.exports.addSignature = (signature, userId) => {
    const q = `INSERT INTO petition (signature, user_id) 
    VALUES ($1,$2)
    RETURNING id`;
    const params = [signature, userId];
    return db.query(q, params);
};

module.exports.addRegister = (first, last, email, pass) => {
    const r = `INSERT INTO users (first,last, email, pass)
    VALUES ($1,$2,$3,$4)
    RETURNING id`;
    const param = [first, last, email, pass];
    return db.query(r, param);
};

module.exports.getHashAndEmail = (email) => {
    const k = "SELECT pass, id FROM users WHERE email = ($1)";
    const params = [email];
    return db.query(k, params);
};

module.exports.registered = () => {
    return db.query("SELECT COUNT(*) FROM users");
};

module.exports.signees = () => {
    const q = `SELECT 
    users.first, 
    users.last,
    user_profiles.url,
    user_profiles.age,
    user_profiles.city
    FROM users
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    INNER JOIN petition ON users.id = petition.user_id`;
    return db.query(q);
};

module.exports.citySigned = (city) => {
    const q = `SELECT 
        users.first, 
        users.last, 
        user_profiles.age, 
        user_profiles.url 
        FROM users
        LEFT JOIN user_profiles 
        ON users.id = user_profiles.user_id
        INNER JOIN petition ON users.id = petition.user_id
        WHERE TRIM(LOWER(city)) = LOWER($1)`;
    let param = [city];
    return db.query(q, param);
};

module.exports.getSig = (id) => {
    let params = [id];
    return db.query("SELECT signature FROM petition WHERE id = ($1)", params);
};

module.exports.signedUser = (userId) => {
    const q = "SELECT id FROM petition WHERE user_id =($1)";
    const params = [userId];
    return db.query(q, params);
};

module.exports.profileData = (age, city, url, user_Id) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_Id) 
    VALUES ($1,$2,$3,$4) 
    RETURNING id`;
    const params = [age || null, city || null, url || null, user_Id];
    return db.query(q, params);
};
