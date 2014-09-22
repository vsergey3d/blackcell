
describe("B.Render.applyColorMask", function () {

    var R = B.Render,
        M = R.Mask,
        gl;

    before(function () {
        gl = new B.Test.FakeWebGLContext({});
    });

    it("should apply color mask", function () {

        var masks = [
                M.R,
                M.G,
                M.B,
                M.A,
                M.RGB,
                M.RGBA
            ],
            maskToStr = function (mask) {
                switch (mask) {
                case M.R:
                    return "R";
                case M.G:
                    return "G";
                case M.B:
                    return "B";
                case M.A:
                    return "A";
                case M.RGB:
                    return "RGB";
                case M.RGBA:
                    return "RGBA";
                }
                return "unknown";
            },
            fn = function (mask) {
                return function () {
                    R.applyColorMask(gl, mask);
                };
            },
            i, l, mask;

        for(i = 0, l = masks.length; i < l; i += 1) {
            mask = masks[i];
            expect(fn(mask), maskToStr(mask)).to.not.throw();
        }
    });
});

describe("B.Render.makeDevice", function () {

    var R = B.Render,
        F = R.Format,
        canvas;

    before(function () {
        canvas = new B.Test.FakeCanvas(300, 200);
    });

    it("should make a rendering device", function () {

        var spy = sinon.spy(B.Render, "Device"),
            settings = {
                antialias: false,
                preserveDrawingBuffer: true
            };

        R.makeDevice(canvas, F.RGBA, F.DEPTH, settings);
        expect(spy).to.be.calledWith(canvas, F.RGBA, F.DEPTH, settings);
    });
});

describe("B.Render.isPowerOfTwo", function () {

    var R = B.Render;

    it("should return true if number is power of two", function () {

        var numbers = [
                1,
                2,
                4,
                8,
                32,
                128,
                1024
            ],
            i, l, num;

        for(i = 0, l = numbers.length; i < l; i += 1) {
            num = numbers[i];
            expect(R.isPowerOfTwo(num), num).to.be.true;
        }
    });

    it("should return false if number is not power of two", function () {

        var numbers = [
                0,
                3,
                5,
                6,
                10,
                126,
                1000
            ],
            i, l, num;

        for(i = 0, l = numbers.length; i < l; i += 1) {
            num = numbers[i];
            expect(R.isPowerOfTwo(num), num).to.be.false;
        }
    });
});

describe("B.Render.toPowerOfTwo", function () {

    var R = B.Render;

    it("should return closest power of two value", function () {

        var numbers = [
                [1, 1],
                [3, 4],
                [60, 64],
                [100, 128],
                [300, 512]
            ],
            i, l, num;

        for(i = 0, l = numbers.length; i < l; i += 1) {
            num = numbers[i];
            expect(R.toPowerOfTwo(num[0]), num[0]).to.equal(num[1]);
        }
    });
});