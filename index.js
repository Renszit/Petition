const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const csurf = require("csurf");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use((req, res, next) => {
    console.log("----------------");
    console.log(`${req.method} request comin on route: ${req.url}`);
    console.log("----------------");
    next();
});

app.use(express.static("./public"));

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
app.get("/", (req, res) =>{
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition");
});

//post request
app.post("/petition", (req, res) => {
    let { first, last, signature } = req.body;
    db.addSignature(first, last, signature)
        .then(() => {
            res.redirect("thanks");
        })
        .catch((err) => {
            res.render("petition", {
            });
            console.log("posting did not work", err);
            
        });
});

app.get("/signers", (req, res) => {
    res.render("signers", {
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
    });
});

app.listen(8080, () => console.log("I am listening sire"));
