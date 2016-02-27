
describe("B.Graph.Light", function () {

    var M = B.Math,
        G = B.Graph,

        checkEvent = B.Test.checkEvent,
        node, childNode, handler = sinon.spy(),
        angle = Math.PI / 4, radius = 15.32, intensity = 0.75,
        deviation = 1.5, cutoff = 0.01, color = M.makeColor(0.3, 1.0, 0.7);

    it("should exist", function () {

        expect(G.Light).to.exist;
    });

    it("should be created", function () {

        expect(function () {
            node = G.makeLight();
        }).to.not.throw();

        expect(node).to.be.instanceof(G.Light);
    });

    describe("#direction", function () {

        var defaultValue = M.Vector3.Z;

        beforeEach(function () {

            node = G.makeLight();
        });

        it("should has initial value", function () {

            expect(node.direction()).to.closeByComponents(defaultValue);
        });

        it("should calculate a new value from Locator's tranformaion", function () {

            node.transform(M.makeMatrix4().rotationY(Math.PI * 0.5));
            expect(node.direction()).to.closeByComponents(M.Vector3.X);

            node.transform(M.makeMatrix4().rotationY(Math.PI * 0.5));
            expect(node.direction()).to.closeByComponents(M.Vector3.N_Z);
        });
    });

    describe("#angle", function () {

        var defaultValue = Math.PI * 2.0;
        
        beforeEach(function () {

            childNode = G.makeLight();
            node = G.makeLight().attach(G.makeNode().attach(childNode));
            handler.reset();
        });

        it("should be initialized by default", function () {

            expect(node.angle()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get angle", function () {

            node.on("light-changed", handler);

            expect(node.angle(angle)).to.equal(node);
            checkEvent(handler, node, "light-changed");

            expect(node.angle()).to.closeTo(angle, M.EPSILON);
            expect(childNode.angle()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get angle through the whole hierarchy", function () {

            childNode.on("light-changed", handler);

            expect(node.angle(angle, true)).to.equal(node);
            checkEvent(handler, childNode, "light-changed");

            expect(node.angle()).to.closeTo(angle, M.EPSILON);
            expect(childNode.angle()).to.closeTo(angle, M.EPSILON);
        });
    });

    describe("#radius", function () {

        var defaultValue = 1.0;

        beforeEach(function () {

            childNode = G.makeLight();
            node = G.makeLight().attach(G.makeNode().attach(childNode));
            handler.reset();
        });

        it("should be initialized by default", function () {

            expect(node.radius()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get radius", function () {

            node.on("light-changed", handler);

            expect(node.radius(radius)).to.equal(node);
            checkEvent(handler, node, "light-changed");

            expect(node.radius()).to.closeTo(radius, M.EPSILON);
            expect(childNode.radius()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get radius through the whole hierarchy", function () {

            childNode.on("light-changed", handler);

            expect(node.radius(radius, true)).to.equal(node);
            checkEvent(handler, childNode, "light-changed");

            expect(node.radius()).to.closeTo(radius, M.EPSILON);
            expect(childNode.radius()).to.closeTo(radius, M.EPSILON);
        });
    });

    describe("#intensity", function () {

        var defaultValue = 1.0;

        beforeEach(function () {

            childNode = G.makeLight();
            node = G.makeLight().attach(G.makeNode().attach(childNode));
            handler.reset();
        });

        it("should be initialized by default", function () {

            expect(node.intensity()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get intensity", function () {

            node.on("light-changed", handler);

            expect(node.intensity(intensity)).to.equal(node);
            checkEvent(handler, node, "light-changed");

            expect(node.intensity()).to.closeTo(intensity, M.EPSILON);
            expect(childNode.intensity()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get intensity through the whole hierarchy", function () {

            childNode.on("light-changed", handler);

            expect(node.intensity(intensity, true)).to.equal(node);
            checkEvent(handler, childNode, "light-changed");

            expect(node.intensity()).to.closeTo(intensity, M.EPSILON);
            expect(childNode.intensity()).to.closeTo(intensity, M.EPSILON);
        });
    });

    describe("#deviation", function () {

        var defaultValue = 3.0;

        beforeEach(function () {

            childNode = G.makeLight();
            node = G.makeLight().attach(G.makeNode().attach(childNode));
            handler.reset();
        });

        it("should be initialized by default", function () {

            expect(node.deviation()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get deviation", function () {

            node.on("light-changed", handler);

            expect(node.deviation(deviation)).to.equal(node);
            checkEvent(handler, node, "light-changed");

            expect(node.deviation()).to.closeTo(deviation, M.EPSILON);
            expect(childNode.deviation()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get deviation through the whole hierarchy", function () {

            childNode.on("light-changed", handler);

            expect(node.deviation(deviation, true)).to.equal(node);
            checkEvent(handler, childNode, "light-changed");

            expect(node.deviation()).to.closeTo(deviation, M.EPSILON);
            expect(childNode.deviation()).to.closeTo(deviation, M.EPSILON);
        });
    });

    describe("#cutoff", function () {

        var defaultValue = 0.0;

        beforeEach(function () {

            childNode = G.makeLight();
            node = G.makeLight().attach(G.makeNode().attach(childNode));
            handler.reset();
        });

        it("should be initialized by default", function () {

            expect(node.cutoff()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get cutoff", function () {

            node.on("light-changed", handler);

            expect(node.cutoff(cutoff)).to.equal(node);
            checkEvent(handler, node, "light-changed");

            expect(node.cutoff()).to.closeTo(cutoff, M.EPSILON);
            expect(childNode.cutoff()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get cutoff through the whole hierarchy", function () {

            childNode.on("light-changed", handler);

            expect(node.cutoff(cutoff, true)).to.equal(node);
            checkEvent(handler, childNode, "light-changed");

            expect(node.cutoff()).to.closeTo(cutoff, M.EPSILON);
            expect(childNode.cutoff()).to.closeTo(cutoff, M.EPSILON);
        });
    });

    describe("#color", function () {

        var defaultValue = M.Color.WHITE;

        beforeEach(function () {

            childNode = G.makeLight();
            node = G.makeLight().attach(G.makeNode().attach(childNode));
            handler.reset();
        });

        it("should be initialized by default", function () {

            expect(node.color()).to.closeByComponents(defaultValue);
        });

        it("should set/get color", function () {

            node.on("light-changed", handler);

            expect(node.color(color)).to.equal(node);
            checkEvent(handler, node, "light-changed");

            expect(node.color()).to.closeByComponents(color);
            expect(childNode.color()).to.closeByComponents(defaultValue);
        });

        it("should set/get color through the whole hierarchy", function () {

            childNode.on("light-changed", handler);

            expect(node.color(color, true)).to.equal(node);
            checkEvent(handler, childNode, "light-changed");

            expect(node.color()).to.closeByComponents(color);
            expect(childNode.color()).to.closeByComponents(color);
        });
    });

    describe("#clone", function () {

        beforeEach(function () {

            node = G.makeLight().attach(G.makeLight()).
                angle(angle, true).
                radius(radius, true).
                intensity(intensity, true).
                deviation(deviation, true).
                cutoff(cutoff, true).
                color(color, true);
        });

        it("should clone the node", function () {

            var clone;

            clone = node.clone();

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(0);
            expect(clone.angle()).to.closeTo(angle, M.EPSILON);
            expect(clone.radius()).to.closeTo(radius, M.EPSILON);
            expect(clone.intensity()).to.closeTo(intensity, M.EPSILON);
            expect(clone.deviation()).to.closeTo(deviation, M.EPSILON);
            expect(clone.cutoff()).to.closeTo(cutoff, M.EPSILON);
            expect(clone.color()).to.closeByComponents(color);
        });

        it("should clone the node deeply", function () {

            var clone;

            clone = node.clone(true);

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(1);
            expect(clone.angle()).to.closeTo(angle, M.EPSILON);
            expect(clone.radius()).to.closeTo(radius, M.EPSILON);
            expect(clone.intensity()).to.closeTo(intensity, M.EPSILON);
            expect(clone.deviation()).to.closeTo(deviation, M.EPSILON);
            expect(clone.cutoff()).to.closeTo(cutoff, M.EPSILON);
            expect(clone.color()).to.closeByComponents(color);

            expect(clone.children()[0].parent()).to.equal(clone);
            expect(clone.children()[0].children().length).to.equal(0);
            expect(clone.children()[0].angle()).to.closeTo(angle, M.EPSILON);
            expect(clone.children()[0].radius()).to.closeTo(radius, M.EPSILON);
            expect(clone.children()[0].intensity()).to.closeTo(intensity, M.EPSILON);
            expect(clone.children()[0].deviation()).to.closeTo(deviation, M.EPSILON);
            expect(clone.children()[0].cutoff()).to.closeTo(cutoff, M.EPSILON);
            expect(clone.children()[0].color()).to.closeByComponents(color);
        });
    });
});
