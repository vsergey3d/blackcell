
B.Test.attributeToStr = function (type) {

    var A = B.Render.Attribute;

    switch (type) {
    case A.UINT:
        return "UINT";
    case A.FLOAT:
        return "FLOAT";
    case A.VECTOR2:
        return "VECTOR2";
    case A.VECTOR3:
        return "VECTOR3";
    case A.VECTOR4:
        return "VECTOR4";
    case A.POSITION:
        return "POSITION";
    case A.NORMAL:
        return "NORMAL";
    case A.TANGENT:
        return "TANGENT";
    case A.UV:
        return "UV";
    case A.COLOR:
        return "COLOR";
    }
    return "unknown";
};

B.Test.formatToStr = function (format) {

    var F = B.Render.Format;

    switch (format) {
    case F.A:
        return "A";
    case F.RGB:
        return "RGB";
    case F.RGBA:
        return "RGBA";
    case F.RGB_DXT1:
        return "RGB_DXT1";
    case F.RGBA_DXT5:
        return "RGBA_DXT5";
    case F.A_F16:
        return "A_F16";
    case F.RGB_F16:
        return "RGB_F16";
    case F.RGBA_F16:
        return "RGBA_F16";
    case F.A_F32:
        return "A_F32";
    case F.RGB_F32:
        return "RGB_F32";
    case F.RGBA_F32:
        return "RGBA_F32";
    case F.DEPTH:
        return "DEPTH";
    case F.DEPTH_STENCIL:
        return "DEPTH_STENCIL";
    }
    return "unknown";
};

B.Test.primitivesToStr = function (type) {

    var P = B.Render.Primitive;

    switch (type) {
    case P.POINT:
        return "POINT";
    case P.LINE:
        return "LINE";
    case P.TRIANGLE:
        return "TRIANGLE";
    }
    return "unknown";
};

B.Test.cmpFuncToStr = function (fn) {

    var CF = B.Render.CmpFunc;

    switch (fn) {
    case CF.NEVER:
        return "NEVER";
    case CF.ALWAYS:
        return "ALWAYS";
    case CF.LESS:
        return "LESS";
    case CF.LESS_EQUAL:
        return "LESS_EQUAL";
    case CF.GREATER:
        return "GREATER";
    case CF.GREATER_EQUAL:
        return "GREATER_EQUAL";
    case CF.EQUAL:
        return "EQUAL";
    case CF.NOT_EQUAL:
        return "NOT_EQUAL";
    }
    return "unknown";
};

B.Test.makeVideoElement = function (width, height) {
    return { name: "HTMLVideoElement", videoWidth: width, videoHeight: height };
};

B.Test.makeImageElement = function (width, height) {
    return { name: "HTMLImageElement", naturalWidth: width, naturalHeight: height };
};

B.Test.makeCanvasElement = function (width, height) {
    return { name: "ImageData/HTMLCanvasElement", width: width, height: height };
};

B.Test.makeVideoElementsArray = function (width, height) {

    var makeVideoElement = B.Test.makeVideoElement;

    return [
        makeVideoElement(width, height),
        makeVideoElement(width, height),
        makeVideoElement(width, height),
        makeVideoElement(width, height),
        makeVideoElement(width, height),
        makeVideoElement(width, height)
    ];
};

B.Test.makeImageElementsArray = function (width, height) {

    var makeImageElement = B.Test.makeImageElement;

    return [
        makeImageElement(width, height),
        makeImageElement(width, height),
        makeImageElement(width, height),
        makeImageElement(width, height),
        makeImageElement(width, height),
        makeImageElement(width, height)
    ];
};

B.Test.makeCanvasElementsArray = function (width, height) {

    var makeCanvasElement = B.Test.makeCanvasElement;

    return [
        makeCanvasElement(width, height),
        makeCanvasElement(width, height),
        makeCanvasElement(width, height),
        makeCanvasElement(width, height),
        makeCanvasElement(width, height),
        makeCanvasElement(width, height)
    ];
};

B.Test.checkSources = function (width, height, checker) {

    var makeVideoElement = B.Test.makeVideoElement,
        makeImageElement = B.Test.makeImageElement,
        makeCanvasElement = B.Test.makeImageElement,

        makers = [makeVideoElement, makeImageElement, makeCanvasElement],
        i, l;

    for(i = 0, l = makers.length; i < l; i += 1) {
        checker(makers[i](width, height));
    }
};

B.Test.checkArraySources = function (width, height, checker) {

    var makeVideoElementsArray = B.Test.makeVideoElementsArray,
        makeImageElementsArray = B.Test.makeImageElementsArray,
        makeCanvasElementsArray = B.Test.makeCanvasElementsArray,

        makers = [
            makeVideoElementsArray,
            makeImageElementsArray,
            makeCanvasElementsArray
        ],
        i, l;

    for(i = 0, l = makers.length; i < l; i += 1) {
        checker(makers[i](width, height));
    }
};

B.Test.makeTestTarget = function (device, readableDepth) {

    var F = B.Render.Format,
        w = 128, h = 128;

    return device.makeTarget(
        device.makeTexture(F.RGBA, w, h, 1),
        device.makeDepth(F.DEPTH, w, h, readableDepth)
    );
};

B.Test.makeTestStage = function (device, target, name) {

    var M = B.Math;

    return device.stage(name || "stage").
        view(M.makeMatrix4().lookAt(M.Vector3.ZERO, M.Vector3.Z, M.Vector3.Y)).
        proj(M.makeMatrix4().orthographic(300, 200, 10, 100)).
        output(target);
};

B.Test.makeTestMesh = function (device) {

    var R = B.Render;

    return device.makeMesh().
        attribute("position", R.Attribute.POSITION).
        vertices([
            0, 0, 0,
            0, 5, 0,
            5, 5, 5
        ]).
        indices([0, 1, 2]).
        computeBounds();
};

B.Test.makeTestTexture = function (device, mips) {

    return device.makeTexture(B.Render.Format.RGBA, 128, 128, mips || 0);
};

B.Test.makeTestDepth = function (device, readable) {

    return device.makeDepth(B.Render.Format.DEPTH, 128, 128, readable);
};

B.Test.makeTestMaterial = function (device, materialName, stage, pass) {

    return device.material(materialName).pass(stage, pass);
};

B.Test.makeTestInstance = function (device, materialName, mesh) {

    return device.instance(materialName, mesh).
        transform(B.Math.makeMatrix4().translation(100, 50, 50));
};

B.Test.makeTestPass = function (device) {

    var vs = ""+
            "void main()"+
            "{"+
            "    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);"+
            "}",

        fs = ""+
            "void main()"+
            "{"+
            "    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);"+
            "}";

    return device.makePass(vs, fs);
};