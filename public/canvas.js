(function () {
    const canvas = $("#canvas");
    const signature = $("#signature");
    var ctx = canvas[0].getContext("2d");
    let xAxis = canvas.offset().left;
    let yAxis = canvas.offset().top;

    canvas.on("mousedown", (event) => {
        ctx.beginPath();
        ctx.moveTo(event.pageX - xAxis, event.pageY - yAxis);

        canvas.on("mousemove", (event) => {
            ctx.lineTo(event.pageX - xAxis, event.pageY - yAxis);
            ctx.stroke();
        });

        canvas.on("mouseleave", () => {
            canvas.off("mousemove");
            const dataUrl = canvas[0].toDataURL();
            signature.val(dataUrl);
        });

        canvas.on("mouseup", () => {
            canvas.off("mousemove");
            const dataUrl = canvas[0].toDataURL();
            signature.val(dataUrl);
        });
    });
})();
