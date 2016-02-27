
describe("B.Graph.Locator", function () {

    var M = B.Math,
        G = B.Graph,

        checkEvent = B.Test.checkEvent,
        node, handler = sinon.spy();

    it("should exist", function () {

        expect(G.Locator).to.exist;
    });

    it("should be created", function () {

        expect(function () {
            node = G.makeLocator();
        }).to.not.throw();

        expect(node).to.be.instanceof(G.Locator);
    });

    describe("#move", function () {

        var v1 = M.makeVector3(1.5, 2.0, -10),
            v2 = M.makeVector3(10, -2.0, 0.5),
            mxT1 = M.makeMatrix4().translation(v1.x, v1.y, v1.z),
            mxT2 = M.makeMatrix4().translation(v2.x, v2.y, v2.z).mul(mxT1);

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should move node by a given offset vector", function () {

            node.move(v1);
            expect(node.transform()).to.closeByComponents(mxT1);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.move(v2);
            expect(node.transform()).to.closeByComponents(mxT2);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });

        it("should move node by given offsets", function () {

            node.move(v1.x, v1.y, v1.z);
            expect(node.transform()).to.closeByComponents(mxT1);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.move(v2.x, v2.y, v2.z);
            expect(node.transform()).to.closeByComponents(mxT2);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });
    });

    describe("#rotate", function () {

        var HALF_PI = Math.PI * 0.5,
            mxR1 = M.makeMatrix4().rotationAxis(B.Math.Vector3.Y, HALF_PI),
            mxR2 = mxR1.clone().mul(M.makeMatrix4().rotationAxis(B.Math.Vector3.Z, -HALF_PI));

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should rotate node around an arbitrary axis", function () {

            node.rotate(B.Math.Vector3.Y, HALF_PI);
            expect(node.transform()).to.be.closeByComponents(mxR1);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.rotate(B.Math.Vector3.Z, -HALF_PI);
            expect(node.transform()).to.be.closeByComponents(mxR2);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });

        it("should rotate node by a canonized euler angles object", function () {

            node.rotate(B.Math.makeAngles(HALF_PI, 0, 0));
            expect(node.transform()).to.be.closeByComponents(mxR1);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.rotate(B.Math.makeAngles(0, 0, -HALF_PI));
            expect(node.transform()).to.be.closeByComponents(mxR2);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });

        it("should rotate node by a quaternion object", function () {

            node.rotate(B.Math.makeQuaternion().fromAxisAngle(B.Math.Vector3.Y, HALF_PI));
            expect(node.transform()).to.be.closeByComponents(mxR1);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.rotate(B.Math.makeQuaternion().fromAxisAngle(B.Math.Vector3.Z, -HALF_PI));
            expect(node.transform()).to.be.closeByComponents(mxR2);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });
    });

    describe("#scale", function () {

        var mxS1 = M.makeMatrix4().scale(4, 1, 2),
            mxS2 = M.makeMatrix4().scale(1, 2, 0.5).mul(mxS1),
            mxSU = M.makeMatrix4().scale(5, 5, 5);

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should scale node by a given coefficient vector", function () {

            node.scale(M.makeVector3(4, 1, 2));
            expect(node.transform()).to.closeByComponents(mxS1);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.scale(M.makeVector3(1, 2, 0.5));
            expect(node.transform()).to.closeByComponents(mxS2);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });

        it("should scale node by given coefficients", function () {

            node.scale(4, 1, 2);
            expect(node.transform()).to.closeByComponents(mxS1);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.scale(1, 2, 0.5);
            expect(node.transform()).to.closeByComponents(mxS2);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });

        it("should scale uniformly node by a given coefficient", function () {

            node.scale(5);
            expect(node.transform()).to.closeByComponents(mxSU);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });
    });

    describe("#transform", function () {

        var mxS = M.makeMatrix4().scale(2, 2, 2),
            mxR3 = M.makeMatrix3().rotationZ(Math.PI * 0.5),
            mxR = M.makeMatrix4().setMatrix3(mxR3),
            mxT = M.makeMatrix4().translation(1, 0, -1),
            mxSR = mxS.clone().mul(mxR),
            mxSRT = mxS.clone().mul(mxR).mul(mxT);

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should be B.Math.Matrix4.IDENTITY by default", function () {

            expect(node.transform()).to.closeByComponents(M.Matrix4.IDENTITY);
        });

        it("should add transformation", function () {

            node.transform(mxS);
            expect(node.transform(), "S").to.closeByComponents(mxS);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.transform(mxR3);
            expect(node.transform(), "S*R").to.closeByComponents(mxSR);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.transform(mxT);
            expect(node.transform(), "S*R*T").to.closeByComponents(mxSRT);
            checkEvent(handler, node, "transformed");
            handler.reset();
        });
    });

    describe("#setTransform", function () {

        var mxS3 = M.makeMatrix3().scale(2, 2, 2),
            mxS = M.makeMatrix4().setMatrix3(mxS3),
            mxR = M.makeMatrix4().rotationZ(Math.PI * 0.5),
            mxT = M.makeMatrix4().translation(1, 0, -1);

        beforeEach(function () {

            handler.reset();
            node = G.makeLocator().on("transformed", handler);
        });

        it("should set transformation", function () {

            node.setTransform(mxS3);
            expect(node.transform(), "S").to.closeByComponents(mxS);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.setTransform(mxS);
            expect(node.transform(), "S").to.closeByComponents(mxS);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.setTransform(mxR);
            expect(node.transform(), "R").to.closeByComponents(mxR);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.setTransform(mxT);
            expect(node.transform(), "T").to.closeByComponents(mxT);
            checkEvent(handler, node, "transformed");
            handler.reset();

            node.setTransform();
            expect(node.transform(), "identity").to.closeByComponents(M.Matrix4.IDENTITY);
            checkEvent(handler, node, "transformed");
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
            otherNode1, otherNode2;

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

            expect(node.finalTransform()).to.closeByComponents(mxS1);
            expect(otherNode1.finalTransform()).to.closeByComponents(mxS1R);
            expect(otherNode2.finalTransform()).to.closeByComponents(mxS1T);

        });

        it("should recalculate final transform if the parent was changed", function () {

            node.setTransform(mxS2);

            expect(node.finalTransform()).to.closeByComponents(mxS2);
            expect(otherNode1.finalTransform()).to.closeByComponents(mxS2R);
            expect(otherNode2.finalTransform()).to.closeByComponents(mxS2T);
        });

        it("should recalculate final transform if the node was detached", function () {

            otherNode1.detach();
            expect(otherNode1.finalTransform()).to.closeByComponents(mxR);

            otherNode2.detach();
            expect(otherNode2.finalTransform()).to.closeByComponents(mxT);
        });
    });

    describe("#position", function () {

        node = G.makeLocator();

        it("should has zero position initially", function () {

            var result = M.makeVector3(1, 2, 3);

            expect(node.position()).to.closeByComponents(M.Vector3.ZERO);
            expect(node.position(result)).to.closeByComponents(M.Vector3.ZERO);
            expect(result).to.closeByComponents(M.Vector3.ZERO);
        });

        it("should change the position after transformation", function () {

            var newPos = M.makeVector3(32.54, 0.43, 112.0),
                result = M.makeVector3(1, 2, 3);

            node.move(newPos);

            expect(node.position()).to.closeByComponents(newPos);
            expect(node.position(result)).to.closeByComponents(newPos);
            expect(result).to.closeByComponents(newPos);
        });
    });

    describe("#clone", function () {

        var mxS = M.makeMatrix4().scale(2, 2, 2),
            mxR = M.makeMatrix4().rotationZ(Math.PI * 0.5),
            otherNode, clone;

        beforeEach(function () {

            node = G.makeLocator();
            otherNode = G.makeLocator();

            node.transform(mxS).
                attach(otherNode.transform(mxR));
        });

        it("should clone the node", function () {

            clone = node.clone();

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(0);
            expect(clone.transform()).to.be.closeByComponents(mxS);
        });

        it("should clone the node deeply", function () {

            clone = node.clone(true);

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(1);
            expect(clone.transform()).to.be.closeByComponents(mxS);
            expect(clone.children()[0].parent()).to.equal(clone);
            expect(clone.children()[0].children().length).to.equal(0);
            expect(clone.children()[0].transform()).to.be.closeByComponents(mxR);
        });
    });
});