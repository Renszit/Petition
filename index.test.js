const supertest = require("supertest");
const { app } = require("./index.js");
const cookieSession = require("cookie-session");

test("Users who are logged out are redirected to registration when attempting to go to petition", () => {
    cookieSession.mockSessionOnce({
        userId: false,
    });
    return supertest(app)
        .get("/petition")
        .then((response) => {
            expect(response.headers.location).toBe("register");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go the registration page", () => {
    cookieSession.mockSessionOnce({
        userId: true,
    });
    return supertest(app)
        .get("/register")
        .then((response) => {
            expect(response.headers.location).toBe("petition");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go the login page", () => {
    cookieSession.mockSessionOnce({
        userId: true,
    });
    return supertest(app)
        .get("/login")
        .then((response) => {
            expect(response.headers.location).toBe("petition");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page or submit a signature", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        sigId: true,
    });
    return supertest(app)
        .get("/petition")
        .then((response) => {
            expect(response.headers.location).toBe("thanks");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the thank you page", () => {
    cookieSession.mockSession({
        userId: true,
    });
    return supertest(app)
        .get("/thanks")
        .then((response) => {
            expect(response.headers.location).toBe("/petition");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the signers page", () => {
    cookieSession.mockSession({
        userId: true,
    });
    return supertest(app)
        .get("/signers")
        .then((response) => {
            expect(response.headers.location).toBe("/petition");
        });
});
