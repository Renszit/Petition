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

const {
    requireLoggedOutUser,
    requireSignedPetition,
    requireLoggedInUser,
} = require("./middleware");

exports.app = app;

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

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register");
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

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const { email, pass } = req.body;
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

app.get("/profile", requireLoggedInUser, (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    let { age, city, homepage } = req.body;
    db.profileData(age, city, homepage, req.session.userId)
        .then(() => {
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

app.get("/petition", requireLoggedInUser, (req, res) => {
    if (req.session.sigId) {
        res.redirect("thanks");
    } else {
        res.render("petition");
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

app.get("/signers", requireSignedPetition, (req, res) => {
    db.signees()
        .then(({ rows }) => {
            res.render("signers", {
                rows,
            });
        })
        .catch((err) => {
            console.log("error in signers", err);
        });
});

app.get("/petition/signers/*", (req, res) => {
    const city = req.url.replace("/petition/signers/", "");
    db.citySigned(city.replace("%20", " "))
        .then(({ rows }) => {
            res.render("signers", {
                rows,
            });
        })
        .catch((err) => {
            console.log("citySigned error: ", err);
            res.redirect("signers");
        });
});

app.get("/thanks", requireLoggedInUser, requireSignedPetition, (req, res) => {
    db.registered()
        .then(({ rows }) => {
            const numberSig = rows[0].count;
            db.getSig(req.session.sigId)
                .then(({ rows }) => {
                    let userSignature = rows[0].signature;
                    res.render("thanks", {
                        numberSig,
                        userSignature,
                    });
                })
                .catch((err) => {
                    console.log("error in getsig:", err);
                });
        })
        .catch((err) => {
            console.log("error in registered", err);
        });
});

app.get("/edit", requireLoggedInUser, (req, res) => {
    const userId = req.session.userId;
    db.getProfileInfo(userId)
        .then(({ rows }) => {
            res.render("edit", {
                rows,
            });
        })
        .catch((err) => console.log("error in getforedit", err));
});

app.post("/edit", (req, res) => {
    let { first, last, pass, email, age, city, homepage } = req.body;
    const userId = req.session.userId;
    if (pass) {
        hash(pass)
            .then((hash) => {
                db.updatePW(first, last, email, hash, userId);
            })
            .then(() => {
                db.updateProfile(age, city, homepage, userId)
                    .then(() => {
                        res.redirect("thanks");
                    })
                    .catch((err) => {
                        console.log("error in updateprofile", err);
                    });
            })
            .catch((err) => {
                console.log("err in hash", err);
            });
    } else {
        db.updateNoPw(first, last, email, userId)
            .then(() => {
                db.updateProfile(age, city, homepage, userId)
                    .then(() => {
                        res.redirect("thanks");
                    })
                    .catch((err) => {
                        console.log("error in updateprofile no pw", err);
                    });
            })
            .catch((err) => {
                console.log("err in update no pw", err);
            });
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("login");
});

app.get("*", (req, res) => {
    res.redirect("/register");
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Server listening..")
    );
}
