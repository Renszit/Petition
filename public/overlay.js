(function () {
    const hamburger = $("#hamburger");
    const sidenav = $("#sidenav");
    const x = $("#x");

    hamburger.on("click", () => {
        sidenav.css({
            visibility: "visible",
        });
    });

    x.on("click", () => {
        sidenav.css({
            visibility: "hidden",
        });
    });
})();
