
describe("B.Graph.Camera", function () {

    var M = B.Math,
        R = B.Render,
        G = B.Graph,

        canvas, device, node, childNode, stages,
        near = 12.34, far = 56.78, fov = Math.PI / 8, aspect = 4 / 3;

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
        stages = [device.stage("s1"), device.stage("s2"), device.stage("s0")];
    });

    after(function () {

        device && device.free();
    });

    it("should exist", function () {

        expect(G.Camera).to.exist;
    });

    it("should be created", function () {

        expect(function () {
            node = G.makeCamera();
        }).to.not.throw();

        expect(node).to.be.instanceof(G.Camera);
    });

    describe("#enable", function () {

        beforeEach(function () {

            childNode = G.makeCamera();
            node = G.makeCamera().attach(G.makeNode().attach(childNode));
        });

        it("should be enabled initially", function () {

            expect(node.enable()).to.equal(true);
        });

        it("should set/get enable", function () {

            expect(node.enable(false)).to.equal(node);
            expect(node.enable()).to.equal(false);
            expect(childNode.enable()).to.equal(true);

            expect(node.enable(true)).to.equal(node);
            expect(node.enable()).to.equal(true);
            expect(childNode.enable()).to.equal(true);
        });

        it("should set/get enable through the whole hierarchy", function () {

            expect(node.enable(false, true)).to.equal(node);
            expect(node.enable()).to.equal(false);
            expect(childNode.enable()).to.equal(false);

            expect(node.enable(true, true)).to.equal(node);
            expect(node.enable()).to.equal(true);
            expect(childNode.enable()).to.equal(true);
        });
    });

    describe("#stages", function () {

        beforeEach(function () {

            childNode = G.makeCamera();
            node = G.makeCamera().attach(G.makeNode().attach(childNode));
        });

        it("should not have stages initially", function () {

            expect(node.stages()).to.be.empty;
        });

        it("should set/get/remove stages", function () {

            expect(node.stages(stages)).to.equal(node);
            expect(node.stages()).to.deep.equal(stages);
            expect(childNode.stages()).to.be.empty;

            expect(node.stages(stages)).to.equal(node);
            expect(node.stages(null)).to.equal(node);
            expect(node.stages()).to.be.empty;
            expect(childNode.stages()).to.be.empty;

            expect(node.stages(stages[0])).to.equal(node);
            expect(node.stages()).to.deep.equal([stages[0]]);
            expect(childNode.stages()).to.be.empty;
        });

        it("should set/get/remove stages (disabled)", function () {

            node.enable(false, true);

            expect(node.stages(stages)).to.equal(node);
            expect(node.stages()).to.deep.equal(stages);
            expect(childNode.stages()).to.be.empty;

            expect(node.stages(stages)).to.equal(node);
            expect(node.stages(null)).to.equal(node);
            expect(node.stages()).to.be.empty;
            expect(childNode.stages()).to.be.empty;

            expect(node.stages(stages[0])).to.equal(node);
            expect(node.stages()).to.deep.equal([stages[0]]);
            expect(childNode.stages()).to.be.empty;

            node.enable(true, true);
        });

        it("should set/get/remove stages through the whole hierarchy", function () {

            expect(node.stages(stages, true)).to.equal(node);
            expect(node.stages()).to.deep.equal(stages);
            expect(childNode.stages()).to.deep.equal(stages);

            expect(node.stages(stages, true)).to.equal(node);
            expect(node.stages(null, true)).to.equal(node);
            expect(node.stages()).to.be.empty;
            expect(childNode.stages()).to.be.empty;

            expect(node.stages(stages[0], true)).to.equal(node);
            expect(node.stages()).to.deep.equal([stages[0]]);
            expect(childNode.stages()).to.deep.equal([stages[0]]);
        });
    });

    describe("#near", function () {

        var defaultValue = 0.001;

        beforeEach(function () {

            childNode = G.makeCamera();
            node = G.makeCamera().attach(G.makeNode().attach(childNode)).stages(stages);
        });

        it("should be initialized by default", function () {

            expect(node.near()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get near", function () {

            expect(node.near(near)).to.equal(node);

            expect(node.near()).to.closeTo(near, M.EPSILON);
            expect(childNode.near()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get material through the whole hierarchy", function () {

            expect(node.near(near, true)).to.equal(node);

            expect(node.near()).to.closeTo(near, M.EPSILON);
            expect(childNode.near()).to.closeTo(near, M.EPSILON);
        });
    });

    describe("#far", function () {

        var defaultValue = 100.0;

        beforeEach(function () {

            childNode = G.makeCamera();
            node = G.makeCamera().attach(G.makeNode().attach(childNode)).stages(stages);
        });

        it("should be initialized by default", function () {

            expect(node.far()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get far", function () {

            expect(node.far(far)).to.equal(node);

            expect(node.far()).to.closeTo(far, M.EPSILON);
            expect(childNode.far()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get material through the whole hierarchy", function () {

            expect(node.far(far, true)).to.equal(node);

            expect(node.far()).to.closeTo(far, M.EPSILON);
            expect(childNode.far()).to.closeTo(far, M.EPSILON);
        });
    });

    describe("#aspect", function () {

        var defaultValue = 16 / 9;

        beforeEach(function () {

            childNode = G.makeCamera();
            node = G.makeCamera().attach(G.makeNode().attach(childNode)).stages(stages);
        });

        it("should be initialized by default", function () {

            expect(node.aspect()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get aspect", function () {

            expect(node.aspect(aspect)).to.equal(node);

            expect(node.aspect()).to.closeTo(aspect, M.EPSILON);
            expect(childNode.aspect()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get material through the whole hierarchy", function () {

            expect(node.aspect(aspect, true)).to.equal(node);

            expect(node.aspect()).to.closeTo(aspect, M.EPSILON);
            expect(childNode.aspect()).to.closeTo(aspect, M.EPSILON);
        });
    });

    describe("#fov", function () {

        var defaultValue = Math.PI / 2.0;

        beforeEach(function () {

            childNode = G.makeCamera();
            node = G.makeCamera().attach(G.makeNode().attach(childNode)).stages(stages);
        });

        it("should be initialized by default", function () {

            expect(node.fov()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get fov", function () {

            expect(node.fov(fov)).to.equal(node);

            expect(node.fov()).to.closeTo(fov, M.EPSILON);
            expect(childNode.fov()).to.closeTo(defaultValue, M.EPSILON);
        });

        it("should set/get material through the whole hierarchy", function () {

            expect(node.fov(fov, true)).to.equal(node);

            expect(node.fov()).to.closeTo(fov, M.EPSILON);
            expect(childNode.fov()).to.closeTo(fov, M.EPSILON);
        });
    });

    describe("#clone", function () {

        beforeEach(function () {

            node = G.makeCamera().attach(G.makeCamera()).
                enable(false, true).
                stages(stages, true).
                near(near, true).
                far(far, true).
                aspect(aspect, true).
                fov(fov, true);
        });

        it("should clone the node", function () {

            var clone;

            clone = node.clone();

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(0);
            expect(clone.enable()).to.equal(false);
            expect(clone.stages()).to.deep.equal(stages);
            expect(clone.near()).to.closeTo(near, M.EPSILON);
            expect(clone.far()).to.closeTo(far, M.EPSILON);
            expect(clone.aspect()).to.closeTo(aspect, M.EPSILON);
            expect(clone.fov()).to.closeTo(fov, M.EPSILON);
        });

        it("should clone the node deeply", function () {

            var clone;

            clone = node.clone(true);

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(1);
            expect(clone.enable()).to.equal(false);
            expect(clone.stages()).to.deep.equal(stages);
            expect(clone.near()).to.closeTo(near, M.EPSILON);
            expect(clone.far()).to.closeTo(far, M.EPSILON);
            expect(clone.aspect()).to.closeTo(aspect, M.EPSILON);
            expect(clone.fov()).to.closeTo(fov, M.EPSILON);

            expect(clone.children()[0].parent()).to.equal(clone);
            expect(clone.children()[0].children().length).to.equal(0);
            expect(clone.children()[0].enable()).to.equal(false);
            expect(clone.children()[0].stages()).to.deep.equal(stages);
            expect(clone.children()[0].near()).to.closeTo(near, M.EPSILON);
            expect(clone.children()[0].far()).to.closeTo(far, M.EPSILON);
            expect(clone.children()[0].aspect()).to.closeTo(aspect, M.EPSILON);
            expect(clone.children()[0].fov()).to.closeTo(fov, M.EPSILON);
        });
    });

    it("should rebuild if had been transformed", function () {

        var spy;

        node = G.makeCamera().stages(stages);
        spy = sinon.spy(node, "_rebuildView");

        node.transform(M.makeMatrix4().rotationX(Math.PI / 2));
        expect(spy).to.be.calledOnce;
    });
});
