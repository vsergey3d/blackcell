
describe("B.Math.Color", function () {

    var M = B.Math,
        makeColor = M.makeColor;

    it("should exist", function () {
        expect(M.Color).to.exist;
    });

    describe("constructor", function () {

        it("should initialized components with 0 and alpha with 1.0 if no params passed",
            function () {

            var c = new M.Color();

            expect(c).to.have.property("r").that.is.a("number").and.equal(0);
            expect(c).to.have.property("g").that.is.a("number").and.equal(0);
            expect(c).to.have.property("b").that.is.a("number").and.equal(0);
            expect(c).to.have.property("a").that.is.a("number").and.equal(1.0);
        });

        it("should set passed r component", function () {

            var c = new M.Color(1, 0, 0, 0);

            expect(c).to.have.property("r").that.equal(1);
        });

        it("should set passed g component", function () {

            var c = new M.Color(0, 1, 0, 0);

            expect(c).to.have.property("g").that.equal(1);
        });

        it("should set passed b component", function () {

            var c = new M.Color(0, 0, 1, 0);

            expect(c).to.have.property("b").that.equal(1);
        });

        it("should set passed a component", function () {

            var c = new M.Color(0, 0, 0, 1);

            expect(c).to.have.property("a").that.equal(1);
        });
    });

    describe("#copy", function () {

        it("should copy this color", function () {

            var c1 = makeColor(0, 0.4, 0.75, 1),
                c2 = makeColor();

            c2.copy(c1);
            expect(c2).to.equalByComponents(c1);
        });

        it("should not create a new color", function () {

            var c1 = makeColor(0, 0.4, 0.75, 1),
                c2 = makeColor();

            expect(c2.copy(c1)).to.equal(c2);
        });
    });

    describe("#clone", function () {

        it("should clone the color", function () {

            var c = makeColor(0, 0.4, 0.75, 1),
                clone = c.clone();

            expect(clone).to.equalByComponents(c);
        });

        it("should create a new color", function () {

            var v = makeColor(0, 0.4, 0.75, 1),
                clone = v.clone();

            expect(clone).to.not.equal(v);
        });
    });

    describe("#set", function () {

        it("should set color components", function () {

            var c = makeColor();

            c.set(0, 0.4, 0.75, 1);
            expect(c).to.equalByComponents(0, 0.4, 0.75, 1);
        });

        it("should not create a new color", function () {

            var c = makeColor();

            expect(c.set(0, 0.4, 0.75, 1)).to.equal(c);
        });
    });

    describe("#get", function () {

        it("should return color element by index", function () {

            var v = makeColor(0.1, 0.2, 0.3, 0.4);

            expect(v.get(0), "first element").to.be.a("number").and.equal(0.1);
            expect(v.get(1), "second element").to.be.a("number").and.equal(0.2);
            expect(v.get(2), "third element").to.be.a("number").and.equal(0.3);
            expect(v.get(3), "fourth element").to.be.a("number").and.equal(0.4);
        });

        it("should throw if the index is out of range", function () {

            var v = makeColor(1, 2, 3, 4),
                fn1 = function () { v.get(4); },
                fn2 = function () { v.get(-1); };

            expect(fn1, "index > 3").to.throw();
            expect(fn2, "negative index").to.throw();
        });
    });

    describe("#setHex", function () {

        it("should be black color from 0x000000", function () {

            var c = makeColor().setHex(0x000000);

            expect(c).to.equalByComponents(0.0, 0.0, 0.0, 1.0);
        });

        it("should be red color from 0xFF0000", function () {

            var c = makeColor().setHex(0xFF0000);

            expect(c).to.equalByComponents(1.0, 0.0, 0.0, 1.0);
        });

        it("should be green color from 0x00FF00", function () {

            var c = makeColor().setHex(0x00FF00);

            expect(c).to.equalByComponents(0.0, 1.0, 0.0, 1.0);
        });

        it("should be blue color from 0x0000FF", function () {

            var c = makeColor().setHex(0x0000FF);

            expect(c).to.equalByComponents(0.0, 0.0, 1.0, 1.0);
        });

        it("should be white color from 0xFFFFFF", function () {

            var c = makeColor().setHex(0xFFFFFF);

            expect(c).to.equalByComponents(1.0, 1.0, 1.0, 1.0);
        });

        it("should not create a new color", function () {

            var c = makeColor();

            expect(c.setHex(0xFFFFFF)).to.equal(c);
        });
    });

    describe("#getHex", function () {

        it("should return the hexadecimal value of the color", function () {

            var hex = M.Color.RED.getHex();

            expect(hex).to.be.a("number").and.equal(0xFF0000);
        });
    });

    describe("#fromArray", function () {

        var c = makeColor(),
            arr = [0.1, 1.0, 0.33, 0.9, 0.25, 0],
            offset = 2;

        it("should set color components from array", function () {

            c.fromArray(arr);
            expect(c).to.equalByComponents(arr);
        });

        it("should set color components from array with given offset", function () {

            c.fromArray(arr, offset);
            expect(c).to.equalByComponents(arr.slice(offset));
        });

        it("should return 4 if offset is not passed", function () {

            expect(c.fromArray(arr)).to.equal(4);
        });

        it("should return new offset", function () {

            expect(c.fromArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#toArray", function () {

        var c = makeColor(0, 0.4, 0.75, 1),
            arr = [10, 52.9, 38, -18, 100, 0.1],
            offset = 2;

        it("should set color components to an array", function () {

            c.toArray(arr);
            expect(c).to.equalByComponents(arr);
        });

        it("should set color components to an array with given offset", function () {

            c.toArray(arr, offset);
            expect(c).to.equalByComponents(arr.slice(offset));
        });

        it("should return 4 if offset is not passed", function () {

            expect(c.toArray(arr)).to.equal(4);
        });

        it("should return new offset", function () {

            expect(c.toArray(arr, offset)).to.equal(offset + 4);
        });
    });

    describe("#clamp", function () {

        it("should clamp components of the color greater than 1.0 ", function () {

            var c = makeColor(1.5, 1.5, 1.5, 1.5);

            c.clamp();
            expect(c.r).to.equal(c.g).to.equal(c.b).to.equal(c.a).to.equal(1.0);
        });

        it("should not clamp components of the color within a range [0.0, 1.0]", function () {

            var c = makeColor(0.5, 0.5, 0.5, 0.5);

            c.clamp();
            expect(c.r).to.equal(c.g).to.equal(c.b).to.equal(c.a).to.equal(0.5);
        });

        it("should clamp components of the color less than 0.0", function () {

            var c = makeColor(-1.5, -1.5, -1.5, -1.5);

            c.clamp();
            expect(c.r).to.equal(c.g).to.equal(c.b).to.equal(c.a).to.equal(0.0);
        });

        it("should not create a new object", function () {

            var c = makeColor(-1.5, -1.5, -1.5, -1.5);

            expect(c.clamp()).to.equal(c);
        });
    });

    describe("#add", function () {

        it("should add a scalar value to the color", function () {

            var c = makeColor(0, 0.4, 0.75, 1),
                val = 0.1;

            c.add(val);
            expect(c).to.equalByComponents(0.1, 0.5, 0.85, 1.0);
        });

        it("should add a color to the color", function () {

            var c1 = makeColor(0, 0.4, 0.75, 1),
                c2 = makeColor(1.0, 0.5, 0.1, 0.0);

            c1.add(c2);
            expect(c1).to.equalByComponents(1.0, 0.9, 0.85, 1.0);
        });

        it("should not create a new object", function () {

            var c = makeColor(0, 0.4, 0.75, 1),
                val = 0.1;

            expect(c.add(val)).to.equal(c);
        });
    });

    describe("#addColors", function () {

        it("should add two given colors and set the result to this color", function () {

            var c1 = makeColor(),
                c2 = makeColor(0.4, 0.1, 0.0, 1.0),
                c3 = makeColor(0.5, 0.9, 0.6, 0.0);

            c1.addColors(c2, c3);
            expect(c1).to.equalByComponents(c2.r + c3.r, c2.g + c3.g, c2.b + c3.b, c2.a + c3.a);
        });

        it("should not create a new object", function () {

            var c1 = makeColor(),
                c2 = makeColor(0.4, 0.1, 0.0, 1.0),
                c3 = makeColor(0.5, 0.9, 0.6, 0.0);

            expect(c1.addColors(c2, c3)).to.equal(c1);
        });
    });

    describe("#sub", function () {

        it("should sub a scalar value from the color", function () {

            var c = makeColor(0, 0.4, 0.75, 1),
                val = 0.1;

            c.sub(val);
            expect(c).to.be.closeByComponents(0, 0.3, 0.65, 0.9);
        });

        it("should add a color from the color", function () {

            var c1 = makeColor(0, 0.4, 0.75, 1),
                c2 = makeColor(1.0, 0.5, 0.1, 0.0);

            c1.sub(c2);
            expect(c1).to.be.closeByComponents(0, 0, 0.65, 1.0);
        });

        it("should not create a new object", function () {

            var c = makeColor(0, 0.4, 0.75, 1),
                val = 0.1;

            expect(c.add(val)).to.equal(c);
        });
    });

    describe("#subColors", function () {

        it("should sub two given colors and set the result to this color", function () {

            var c1 = makeColor(),
                c2 = makeColor(0.4, 0.9, 0.6, 1.0),
                c3 = makeColor(0.3, 0.9, 0.0, 0.0);

            c1.subColors(c2, c3);
            expect(c1).to.equalByComponents(c2.r - c3.r, c2.g - c3.g, c2.b - c3.b, c2.a - c3.a);
        });

        it("should not create a new object", function () {

            var c1 = makeColor(),
                c2 = makeColor(0.4, 0.1, 0.0, 1.0),
                c3 = makeColor(0.5, 0.9, 0.6, 0.0);

            expect(c1.subColors(c2, c3)).to.equal(c1);
        });
    });

    describe("#mul", function () {

        it("should multiply the color by a scalar value", function () {

            var c = makeColor(0.4, 0.5, 0.8, 1.0),
                val = 0.3;

            c.mul(val);
            expect(c).to.be.closeByComponents(0.12, 0.15, 0.24, 0.3);
        });

        it("should multiply the color by a given color", function () {

            var c1 = makeColor(0.4, 0.5, 0.8, 1.0),
                c2 = makeColor(0.2, 0.1, 0.6, 1.0);

            c1.mul(c2);
            expect(c1).to.be.closeByComponents(0.08, 0.05, 0.48, 1.0);
        });

        it("should not create a new object", function () {

            var c = makeColor(0.4, 0.5, 0.85, 1.0),
                val = 0.3;

            expect(c.mul(val)).to.equal(c);
        });
    });

    describe("#mulColors", function () {

        it("should multiply two given colors and set the result to this color", function () {

            var c1 = makeColor(),
                c2 = makeColor(0.4, 0.5, 0.8, 1.0),
                c3 = makeColor(0.2, 0.1, 0.6, 1.0);

            c1.mulColors(c2, c3);
            expect(c1).to.be.closeByComponents(0.08, 0.05, 0.48, 1.0);
        });

        it("should not create a new object", function () {

            var c1 = makeColor(),
                c2 = makeColor(0.4, 0.5, 0.8, 1.0),
                c3 = makeColor(0.2, 0.1, 0.6, 1.0);

            expect(c1.mulColors(c2, c3)).to.equal(c1);
        });
    });

    describe("#equal", function () {

        it("should return true if colors are equal", function () {

            var c1 = makeColor(0.4, 0.5, 0.8, 1.0),
                c2 = makeColor(0.4, 0.5, 0.8, 1.0);

            expect(c1.equal(c2)).to.be.true;
        });

        it("should return false if colors are not equal", function () {

            var c1 = makeColor(0.4, 0.5, 0.8, 1.0),
                c2 = makeColor(0.4, 0.5, 0.8, 0.0);

            expect(c1.equal(c2)).to.be.false;
        });
    });

    describe("WHITE", function () {

        it("should exist", function () {
            expect(M.Color.WHITE).to.exist;
        });

        it("should be an instance of M.Color", function () {
            expect(M.Color.WHITE).to.be.instanceof(M.Color);
        });

        it("should be white color", function () {
            expect(M.Color.WHITE.r, "r").to.be.a("number").and.equal(1.0);
            expect(M.Color.WHITE.g, "g").to.be.a("number").and.equal(1.0);
            expect(M.Color.WHITE.b, "b").to.be.a("number").and.equal(1.0);
            expect(M.Color.WHITE.a, "a").to.be.a("number").and.equal(1.0);
        });
    });

    describe("GRAY", function () {

        it("should exist", function () {
            expect(M.Color.GRAY).to.exist;
        });

        it("should be an instance of M.Color", function () {
            expect(M.Color.GRAY).to.be.instanceof(M.Color);
        });

        it("should be white color", function () {
            expect(M.Color.GRAY.r, "r").to.be.a("number").and.equal(0.5);
            expect(M.Color.GRAY.g, "g").to.be.a("number").and.equal(0.5);
            expect(M.Color.GRAY.b, "b").to.be.a("number").and.equal(0.5);
            expect(M.Color.GRAY.a, "a").to.be.a("number").and.equal(1.0);
        });
    });

    describe("BLACK", function () {

        it("should exist", function () {
            expect(M.Color.BLACK).to.exist;
        });

        it("should be an instance of M.Color", function () {
            expect(M.Color.BLACK).to.be.instanceof(M.Color);
        });

        it("should be black color", function () {
            expect(M.Color.BLACK.r, "r").to.be.a("number").and.equal(0.0);
            expect(M.Color.BLACK.g, "g").to.be.a("number").and.equal(0.0);
            expect(M.Color.BLACK.b, "b").to.be.a("number").and.equal(0.0);
            expect(M.Color.BLACK.a, "a").to.be.a("number").and.equal(1.0);
        });
    });

    describe("RED", function () {

        it("should exist", function () {
            expect(M.Color.RED).to.exist;
        });

        it("should be an instance of M.Color", function () {
            expect(M.Color.RED).to.be.instanceof(M.Color);
        });

        it("should be red color", function () {
            expect(M.Color.RED.r, "r").to.be.a("number").and.equal(1.0);
            expect(M.Color.RED.g, "g").to.be.a("number").and.equal(0.0);
            expect(M.Color.RED.b, "b").to.be.a("number").and.equal(0.0);
            expect(M.Color.RED.a, "a").to.be.a("number").and.equal(1.0);
        });
    });

    describe("GREEN", function () {

        it("should exist", function () {
            expect(M.Color.GREEN).to.exist;
        });

        it("should be an instance of M.Color", function () {
            expect(M.Color.GREEN).to.be.instanceof(M.Color);
        });

        it("should be green color", function () {
            expect(M.Color.GREEN.r, "r").to.be.a("number").and.equal(0.0);
            expect(M.Color.GREEN.g, "g").to.be.a("number").and.equal(1.0);
            expect(M.Color.GREEN.b, "b").to.be.a("number").and.equal(0.0);
            expect(M.Color.GREEN.a, "a").to.be.a("number").and.equal(1.0);
        });
    });

    describe("BLUE", function () {

        it("should exist", function () {
            expect(M.Color.BLUE).to.exist;
        });

        it("should be an instance of M.Color", function () {
            expect(M.Color.BLUE).to.be.instanceof(M.Color);
        });

        it("should be blue color", function () {
            expect(M.Color.BLUE.r, "r").to.be.a("number").and.equal(0.0);
            expect(M.Color.BLUE.g, "g").to.be.a("number").and.equal(0.0);
            expect(M.Color.BLUE.b, "b").to.be.a("number").and.equal(1.0);
            expect(M.Color.BLUE.a, "a").to.be.a("number").and.equal(1.0);
        });
    });
});
