
B.Sample = {};

B.Sample.runFrameInfoUpdate = function (app) {

    setInterval(function () {

        var info = app.frameInfo();
        if (info) {
            document.getElementById("fps").innerHTML =
                "fps: " + info.fps.toFixed(2);
            document.getElementById("vertex").innerHTML =
                "vertices (total/drawn): " + info.vertexTotal + "/" + info.vertexDrawn;
            document.getElementById("primitive").innerHTML =
                "primitives (total/drawn): " + info.primitiveTotal + "/" + info.primitiveDrawn;
            document.getElementById("instance").innerHTML =
                "instances (total/drawn): " + info.instanceTotal + "/" + info.instanceDrawn;
        }
    }, 100);
};

B.Sample.generateRandomPoints = function (cellSize, cellCount, pointCount, handler) {

    var floor = Math.floor, random = Math.random,

        halfCellSize = cellSize * 0.5,
        halfVolumeSize = cellSize * cellCount * 0.5,
        i, x, y, z, d = halfCellSize - halfVolumeSize;

    for(i = 0; i < pointCount; i += 1) {

        x = floor((random() * cellCount));
        y = floor((random() * cellCount));
        z = floor((random() * cellCount));

        handler(x * cellSize + d, y * cellSize + d, z * cellSize + d, i);
    }
};
