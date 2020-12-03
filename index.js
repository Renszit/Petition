const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
 

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use((req, res, next) => {
    console.log("----------------");
    console.log(`${req.method} request comin on route: ${req.url}`);
    console.log("----------------");
    next(); 
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    res.render("signers", {
        layout: "main",
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main",
    });
});




app.listen(8080, () => console.log("I am listening sire"));