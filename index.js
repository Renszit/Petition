const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const csurf = require("csurf");
const cookieSession = require("cookie-session");

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

// temporary redirect to petition
app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (req.session.registered == true) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

//post request
app.post("/petition", (req, res) => {
    let { first, last, signature } = req.body;
    db.addSignature(first, last, signature)
        .then(({ rows }) => {
            req.session.id = rows[0].id;
            req.session.registered = true;
            res.redirect("thanks");
        })
        .catch((err) => {
            res.render("petition",{
                incomplete: true
            });
            console.log("posting did not work", err);
        });
});

app.get("/signers", (req, res) => {
    if (req.session.registered != true) {
        res.redirect("/petition");
    } else {
        db.signees()
            .then(({ rows }) => {
                res.render("signers", { 
                    rows 
                });
            })
            .catch((err) => {
                console.log("error in signers", err);
            });
    }
});

app.get("/thanks", (req, res) => {
    if (!req.session.registered) {
        res.redirect("/petition");
    } else {
        db.registered()
            .then(({ rows }) => {
                let numberReg = rows[0].count;
                db.getSig(req.session.id).then(({ rows }) => {
                    let userSignature = rows[0].signature;
                    let userName = rows[0].first;
                    res.render("thanks", { 
                        numberReg, 
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
