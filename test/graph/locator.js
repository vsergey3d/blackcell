
describe("B.Graph.Locator", function () {

    var M = B.Math,
        G = B.Graph,

        checkEvent = function (spy, caster, type, data) {

            var e = spy.getCall(0).args[0];

            expect(spy).to.be.calledOnce;
            expect(e).to.be.instanceof(B.Std.Event);
            expect(e.caster).to.equal(caster);
            expect(e.type).to.equal(type);
            expect(e.data).to.deep.equal(data);
        };

    it("should exist", function () {

        expect(G.Locator).to.exist;
    });

    it("should be created", function () {

        var node;

        expect(
            function () {
                node = G.makeLocator();
            }).to.not.throw();

        expect(node).to.be.instanceof(G.Locator);
    });

    describe("#move", function () {

        var mxT1 = M.makeMatrix4().translation(1.5, 2.0, -10),
            mxT2 = M.makeMatrix4().translation(10, -2.0, 0.5).mul(mxT1),
            node, handler = sinon.spy();

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should move node by a given offset vector", function () {

            node.move(M.makeVector3(1.5, 2.0, -10));
            expect(node.transform(), "1").to.equalByComponents(mxT1);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.move(M.makeVector3(10, -2.0, 0.5));
            expect(node.transform(), "2").to.equalByComponents(mxT2);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });

        it("should move node by given offsets", function () {

            node.move(1.5, 2.0, -10);
            expect(node.transform(), "1").to.equalByComponents(mxT1);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.move(10, -2.0, 0.5);
            expect(node.transform(), "2").to.equalByComponents(mxT2);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });
    });

    describe("#rotate", function () {

        var HALF_PI = Math.PI * 0.5,
            mxR1 = M.makeMatrix4().rotationAxis(B.Math.Vector3.Y, HALF_PI),
            mxR2 = mxR1.clone().mul(M.makeMatrix4().rotationAxis(B.Math.Vector3.Z, -HALF_PI)),
            node, handler = sinon.spy();

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should rotate node around an arbitrary axis", function () {

            node.rotate(B.Math.Vector3.Y, HALF_PI);
            expect(node.transform(), "1").to.be.closeByComponents(mxR1);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.rotate(B.Math.Vector3.Z, -HALF_PI);
            expect(node.transform(), "2").to.be.closeByComponents(mxR2);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });

        it("should rotate node by a canonized euler angles object", function () {

            node.rotate(B.Math.makeAngles(HALF_PI, 0, 0));
            expect(node.transform(), "1").to.be.closeByComponents(mxR1);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.rotate(B.Math.makeAngles(0, 0, -HALF_PI));
            expect(node.transform(), "2").to.be.closeByComponents(mxR2);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });

        it("should rotate node by a quaternion object", function () {

            node.rotate(B.Math.makeQuaternion().fromAxisAngle(B.Math.Vector3.Y, HALF_PI));
            expect(node.transform(), "1").to.be.closeByComponents(mxR1);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.rotate(B.Math.makeQuaternion().fromAxisAngle(B.Math.Vector3.Z, -HALF_PI));
            expect(node.transform(), "2").to.be.closeByComponents(mxR2);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });
    });

    describe("#scale", function () {

        var mxS1 = M.makeMatrix4().scale(4, 1, 2),
            mxS2 = M.makeMatrix4().scale(1, 2, 0.5).mul(mxS1),
            mxSU = M.makeMatrix4().scale(5, 5, 5),
            node, handler = sinon.spy();

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should scale node by a given coefficient vector", function () {

            node.scale(M.makeVector3(4, 1, 2));
            expect(node.transform(), "1").to.equalByComponents(mxS1);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.scale(M.makeVector3(1, 2, 0.5));
            expect(node.transform(), "2").to.equalByComponents(mxS2);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });

        it("should scale node by given coefficients", function () {

            node.scale(4, 1, 2);
            expect(node.transform(), "1").to.equalByComponents(mxS1);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.scale(1, 2, 0.5);
            expect(node.transform(), "2").to.equalByComponents(mxS2);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });

        it("should scale uniformly node by a given coefficient", function () {

            node.scale(5);
            expect(node.transform()).to.equalByComponents(mxSU);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });
    });

    describe("#transform", function () {

        var mxS = M.makeMatrix4().scale(2, 2, 2),
            mxR3 = M.makeMatrix3().rotationZ(Math.PI * 0.5),
            mxR = M.makeMatrix4().setMatrix3(mxR3),
            mxT = M.makeMatrix4().translation(1, 0, -1),
            mxSR = mxS.clone().mul(mxR),
            mxSRT = mxS.clone().mul(mxR).mul(mxT),
            node, handler = sinon.spy();

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should be B.Math.Matrix4.IDENTITY by default", function () {

            expect(node.transform()).to.equalByComponents(M.Matrix4.IDENTITY);
        });

        it("should add transformation", function () {

            node.transform(mxS);
            expect(node.transform(), "S").to.equalByComponents(mxS);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.transform(mxR3);
            expect(node.transform(), "S*R").to.equalByComponents(mxSR);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.transform(mxT);
            expect(node.transform(), "S*R*T").to.equalByComponents(mxSRT);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });
    });

    describe("#resetTransform", function () {

        var mxS3 = M.makeMatrix3().scale(2, 2, 2),
            mxS = M.makeMatrix4().setMatrix3(mxS3),
            mxR = M.makeMatrix4().rotationZ(Math.PI * 0.5),
            mxT = M.makeMatrix4().translation(1, 0, -1),
            node, handler = sinon.spy();

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should set transformation", function () {

            node.resetTransform(mxS3);
            expect(node.transform(), "S").to.equalByComponents(mxS);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.resetTransform(mxS);
            expect(node.transform(), "S").to.equalByComponents(mxS);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.resetTransform(mxR);
            expect(node.transform(), "R").to.equalByComponents(mxR);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.resetTransform(mxT);
            expect(node.transform(), "T").to.equalByComponents(mxT);
            checkEvent(handler, node, "transformed", null);
            handler.reset();

            node.resetTransform();
            expect(node.transform(), "identity").to.equalByComponents(M.Matrix4.IDENTITY);
            checkEvent(handler, node, "transformed", null);
            handler.reset();
        });
    });

    describe("#finalTransform", function () {

        var mxS1 = M.makeMatrix4().scale(2, 2, 2),
            mxS2 = M.makeMatrix4().scale(17, 32, 29),
            mxR = M.makeMatrix4().rotationZ(Math.PI * 0.5),
            mxT = M.makeMatrix4().translation(1, 0, -1),
            mxS1R = mxS1.clone().mul(mxR),
            mxS1T = mxS1.clone().mul(mxT),
            mxS2R = mxS2.clone().mul(mxR),
            mxS2T = mxS2.clone().mul(mxT),
            node, otherNode1, otherNode2;

        beforeEach(function () {

            node = G.makeLocator();
            otherNode1 = G.makeLocator();
            otherNode2 = G.makeLocator();

            node.transform(mxS1).
                attach(otherNode1.transform(mxR)).
                attach(otherNode2.transform(mxT)).
                attach(G.makeNode());
        });

        it("should compute the final transform", function () {

            expect(node.finalTransform()).to.equalByComponents(mxS1);
            expect(otherNode1.finalTransform()).to.equalByComponents(mxS1R);
            expect(otherNode2.finalTransform()).to.equalByComponents(mxS1T);

        });

        it("should recalculate child transform if the parent was changed", function () {

            node.resetTransform(mxS2);

            expect(node.finalTransform()).to.equalByComponents(mxS2);
            expect(otherNode1.finalTransform()).to.equalByComponents(mxS2R);
            expect(otherNode2.finalTransform()).to.equalByComponents(mxS2T);
        });
    });

    describe("#clone", function () {

        var mxS = M.makeMatrix4().scale(2, 2, 2),
            mxR = M.makeMatrix4().rotationZ(Math.PI * 0.5),
            node, otherNode, clone;

        beforeEach(function () {

            node = G.makeLocator();
            otherNode = G.makeLocator();

            node.transform(mxS).
                attach(otherNode.transform(mxR));
        });

        it("should clone the node", function () {

            clone = node.clone();

            expect(clone.parent()).to.equal(null);
            expect(clone.transform()).to.be.closeByComponents(mxS);
            expect(clone.children().length).to.equal(0);
        });

        it("should clone the node deeply", function () {

            clone = node.clone(true);

            expect(clone.parent()).to.equal(null);
            expect(clone.transform()).to.be.closeByComponents(mxS);
            expect(clone.children().length).to.equal(1);
            expect(clone.children()[0].parent()).to.equal(clone);
            expect(clone.children()[0].transform()).to.be.closeByComponents(mxR);
            expect(clone.children()[0].children().length).to.equal(0);
        });
    });
});