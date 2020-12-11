exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        if (req.session.sigId) {
            res.redirect("thanks");
        } else {
            res.redirect("/petition");
        }
    } else {
        next();
    }
};

exports.requireSignedPetition = (req, res, next) => {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
};
