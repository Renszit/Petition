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

//  redirect to register
app.get("/", (req, res) => {
    res.redirect("/register");
});

//register
app.get("/register", (req, res) => {
    if (req.session.registered == true) {
        res.redirect("petition");
    } else {
        res.render("register"), {};
    }
});

app.post("/register", (req, res) => {
    let { first, last, email, pass } = req.body;
    hash(pass).then((hash) => {
        db.addRegister(first, last, email, hash)
            .then(({ rows }) => {
                req.session.user_id = rows[0].id;
                req.session.registered = true;
                res.render("petition");
            })
            .catch((err) => {
                res.render("register", {
                    incomplete: true,
                });
                console.log("error in registration:", err);
            });
    });
});

//login

app.get("/login", (req, res) => {
    if (req.session.registered == true) {
        res.render("login"), {};
    } else {
        res.render("register");
    }
});

// app.post("/login")
// app.post("/login", (req, res) => {
//     let { email, pass } = req.body;
//     compare(email, pass).then(() => {
//         req.session.registered = true;
//         res.render("thanks");
//         })
//             .catch((err) => {
//                 res.render("register", {
//                     incomplete: true,
//                 });
//                 console.log("error in registration:", err);
//             });
//     });
// });

// petition
app.get("/petition", (req, res) => {
    if (req.session.registered == true) {
        res.render("petition");
    } else {
        res.redirect("register");
    }
});

// ADJUST
app.post("/petition", (req, res) => {
    let { signature } = req.body;
    let userId = req.session.user_id;
    db.addSignature(signature, userId)
        .then(({ rows }) => {
            req.session.sig = true;
            req.session.sigid = rows[0].id;
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
    if (req.session.sig != true) {
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
    if (!req.session.sig) {
        res.redirect("/petition");
    } else {
        db.registered()
            .then(({ rows }) => {
                let numberSig = rows[0].count;
                db.getSig(req.session.id).then(({ rows }) => {
                    let userSignature = rows[0].signature;
                    let userName = rows[0].first;
                    res.render("thanks", {
                        numberSig,
                        userSignature,
                        userName,
                    });
                });
            })
            .catch((err) => {
                console.log("error in thanks", err);
            });
    }
});

app.listen(8080, () => console.log("I am listening sire"));
