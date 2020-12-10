const supertest = require("supertest");
const { app } = require("./index.js");
const cookieSession = require("cookie-session");

test("GET /register with cookies returns and redirects to thanks", () => {
    cookieSession.mockSession({
        userId: true,
        sigId: true,
    });
    return supertest(app)
        .get("/register")
        .then((response) => {
            console.log("response:", response.headers);
            expect(response.headers.location).toBe("thanks");
        });
    
});
