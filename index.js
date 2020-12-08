const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const csurf = require("csurf");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");

app.use(express.static("./public"));
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use((req, res, next) => {
    console.log("----------------");
    console.log(`${req.method} request comin on route: ${req.url}`);
    console.log("----------------");
    next();
});

app.use(
    cookieSession({
        secret: `Kill them with kindness`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());

app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

//register
app.get("/register", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("thanks");
        } else {
            res.redirect("petition"), {};
        }
    } else {
        res.render("register");
    }
});

app.post("/register", (req, res) => {
    const { first, last, email, pass } = req.body;
    hash(pass)
        .then((hash) => {
            db.addRegister(first, last, email, hash)
                .then(({ rows }) => {
                    req.session.userId = rows[0].id;
                    res.redirect("profile");
                })
                .catch((err) => {
                    res.render("register", {
                        incomplete: true,
                    });
                    console.log("error in registration:", err);
                });
        })
        .catch((err) => {
            console.log("err in hash", err);
        });
});

//profile

app.get("/profile", (req, res) => {
    if (req.session.userId) {
        if (!req.session.profileId) {
            res.render("profile");
        } else {
            res.redirect("petition");
        }
    } else {
        res.redirect("login");
    }
});

app.post("/profile", (req, res) => {
    let { age, city, homepage } = req.body;
    db.profileData(age, city, homepage, req.session.userId)
        .then(({ rows }) => {
            req.session.profileId = rows[0].id;
            if (req.session.sigId) {
                res.redirect("thanks");
            } else {
                res.redirect("petition");
            }
        })
        .catch((err) => {
            console.log("error in posting profile", err);
            res.render("profile", {});
        });
});

//login
app.get("/login", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("thanks"), {};
        } else {
            res.redirect("petition");
        }
    } else {
        res.render("login");
    }
});

// app.post("/login")
app.post("/login", (req, res) => {
    let { email, pass } = req.body;
    db.getHashAndEmail(email)
        .then(({ rows }) => {
            const { pass: hash, id: userId } = rows[0];
            compare(pass, hash).then((result) => {
                if (result) {
                    req.session.userId = userId;
                    db.signedUser(userId)
                        .then((sigId) => {
                            if (sigId.rows[0]) {
                                req.session.sigId = sigId.rows[0].id;
                                res.redirect("thanks");
                            } else {
                                res.redirect("petition");
                            }
                        })
                        .catch((err) => {
                            console.log("error in login", err);
                        });
                } else {
                    res.render("login", {
                        incomplete: true,
                    });
                }
            });
        })
        .catch((err) => {
            console.log("error in login 2", err);
        });
});

// petition
app.get("/petition", (req, res) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("thanks");
        } else {
            res.render("petition");
        }
    } else {
        res.redirect("register");
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    db.addSignature(signature, req.session.userId)
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;
            res.redirect("thanks");
        })
        .catch((err) => {
            res.render("petition", {
                incomplete: true,
            });
            console.log("posting did not work", err);
        });
});

//signers
app.get("/signers", (req, res) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        db.signees()
            .then(({ rows }) => {
                res.render("signers", {
                    rows,
                });
            })
            .catch((err) => {
                console.log("error in signers", err);
            });
    }
});

//thanks
app.get("/thanks", (req, res) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        db.registered()
            .then(({ rows }) => {
                const numberSig = rows[0].count;
                db.getSig(req.session.sigId)
                    .then(({ rows }) => {
                        let userSignature = rows[0].signature;
                        let userName = rows[0].first;
                        res.render("thanks", {
                            numberSig,
                            userSignature,
                            userName,
                        });
                    })
                    .catch((err) => {
                        console.log("error in getsig:", err);
                    });
            })
            .catch((err) => {
                console.log("error in registered", err);
            });
    }
});

app.get("*", (req, res) => {
    res.redirect("/register");
});

app.listen(8080, () => console.log("I am listening sire"));
