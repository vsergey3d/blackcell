
describe("B.Graph.Visual", function () {

    var M = B.Math,
        R = B.Render,
        G = B.Graph,

        checkEvent = B.Test.checkEvent,
        canvas, device, node, childNode, material, mesh,
        uniforms = {
            "some": 12,
            "another": 3.54
        };

    before(function () {

        canvas = new B.Test.FakeCanvas(300, 200);
        device = R.makeDevice(canvas);
        mesh = device.makeMesh();
        material = device.material("some");
    });

    after(function () {
        device && device.free();
    });

    it("should exist", function () {

        expect(G.Visual).to.exist;
    });

    it("should be created", function () {

        expect(function () {
            node = G.makeVisual();
        }).to.not.throw();

        expect(node).to.be.instanceof(G.Visual);
    });

    describe("#visible", function () {

        var handler = sinon.spy();

        beforeEach(function () {

            childNode = G.makeVisual();
            node = G.makeVisual().attach(G.makeNode().attach(childNode));
        });

        it("should not be visible initially", function () {

            expect(node.visible()).to.equal(false);
        });

        it("should set/get visibility and trigger events", function () {

            node.on("shown", handler);

            expect(node.visible(true)).to.equal(node);
            checkEvent(handler, node, "shown");
            handler.reset();

            expect(node.visible()).to.equal(true);
            expect(childNode.visible()).to.equal(false);

            expect(node.visible(true)).to.equal(node);
            expect(handler.called).to.equal(false);

            node.on("hidden", handler);

            expect(node.visible(false)).to.equal(node);
            checkEvent(handler, node, "hidden");
            handler.reset();

            expect(node.visible()).to.equal(false);
            expect(childNode.visible()).to.equal(false);

            expect(node.visible(false)).to.equal(node);
            expect(handler.called).to.equal(false);
        });

        it("should set/get visibility through the whole hierarchy", function () {

            childNode.on("shown", handler);

            expect(node.visible(true, true)).to.equal(node);
            checkEvent(handler, childNode, "shown");
            handler.reset();

            expect(node.visible()).to.equal(true);
            expect(childNode.visible()).to.equal(true);

            expect(node.visible(true, true)).to.equal(node);
            expect(handler.called).to.equal(false);

            childNode.on("hidden", handler);

            expect(node.visible(false, true)).to.equal(node);
            checkEvent(handler, childNode, "hidden");
            handler.reset();

            expect(node.visible()).to.equal(false);
            expect(childNode.visible()).to.equal(false);

            expect(node.visible(false, true)).to.equal(node);
            expect(handler.called).to.equal(false);
        });
    });

    describe("#material", function () {

        beforeEach(function () {

            childNode = G.makeVisual();
            node = G.makeVisual().attach(G.makeNode().attach(childNode));
        });

        it("should not have material initially", function () {

            expect(node.material()).to.equal(null);
        });

        it("should set/get material", function () {

            expect(node.material(material)).to.equal(node);

            expect(node.material()).to.equal(material);
            expect(childNode.material()).to.equal(null);

            expect(node.material(material)).to.equal(node);
        });

        it("should set/get material through the whole hierarchy", function () {

            expect(node.material(material, true)).to.equal(node);

            expect(node.material()).to.equal(material);
            expect(childNode.material()).to.equal(material);
        });
    });

    describe("#mesh", function () {

        beforeEach(function () {

            childNode = G.makeVisual();
            node = G.makeVisual().attach(G.makeNode().attach(childNode));
        });

        it("should not have mesh initially", function () {

            expect(node.mesh()).to.equal(null);
        });

        it("should set/get mesh", function () {

            expect(node.mesh(mesh)).to.equal(node);

            expect(node.mesh()).to.equal(mesh);
            expect(childNode.mesh()).to.equal(null);

            expect(node.mesh(mesh)).to.equal(node);
        });

        it("should set/get mesh through the whole hierarchy", function () {

            expect(node.mesh(mesh, true)).to.equal(node);

            expect(node.mesh()).to.equal(mesh);
            expect(childNode.mesh()).to.equal(mesh);
        });
    });

    describe("uniforms", function () {

        beforeEach(function () {

            childNode = G.makeVisual();
            node = G.makeVisual().attach(G.makeNode().attach(childNode));

            node.visible(true);
            node.mesh(mesh);
            node.material(material);
        });

        it("should not have uniforms initially", function () {

            expect(node.uniforms()).to.be.empty;
            expect(node.uniform("some")).to.equal(null);
        });

        it("should set/get uniform", function () {

            var name;

            for (name in uniforms) {
                expect(node.uniform(name, uniforms[name])).to.equal(node);
                expect(node.uniform(name)).to.equal(uniforms[name]);
                expect(childNode.uniform(name)).to.equal(null);
            }
            expect(node.uniforms()).to.deep.equal(Object.keys(uniforms));
            expect(childNode.uniforms()).to.be.empty;

            for (name in uniforms) {
                expect(node.uniform(name, null)).to.equal(node);
                expect(node.uniform(name)).to.equal(null);
                expect(childNode.uniform(name)).to.equal(null);
            }
            expect(node.uniforms()).to.be.empty;
            expect(childNode.uniforms()).to.be.empty;
        });

        it("should set/get uniform through the whole hierarchy", function () {

            var name;

            for (name in uniforms) {
                expect(node.uniform(name, uniforms[name], true)).to.equal(node);
                expect(node.uniform(name)).to.equal(uniforms[name]);
                expect(childNode.uniform(name)).to.equal(uniforms[name]);
            }
            expect(node.uniforms()).to.deep.equal(Object.keys(uniforms));
            expect(childNode.uniforms()).to.deep.equal(Object.keys(uniforms));

            for (name in uniforms) {
                expect(node.uniform(name, null, true)).to.equal(node);
                expect(node.uniform(name)).to.equal(null);
                expect(childNode.uniform(name)).to.equal(null);
            }
            expect(node.uniforms()).to.be.empty;
            expect(childNode.uniforms()).to.be.empty;
        });
    });

    describe("#culling", function () {

        beforeEach(function () {

            childNode = G.makeVisual();
            node = G.makeVisual().attach(G.makeNode().attach(childNode));

            node.visible(true);
            node.mesh(mesh);
            node.material(material);
        });

        it("should have culling enabled initially", function () {

            expect(node.culling()).to.equal(true);
            expect(childNode.culling()).to.equal(true);
        });

        it("should set/get culling", function () {

            expect(node.culling(false)).to.equal(node);

            expect(node.culling()).to.equal(false);
            expect(childNode.culling()).to.equal(true);
        });

        it("should set/get culling through the whole hierarchy", function () {

            expect(node.culling(false, true)).to.equal(node);

            expect(node.culling()).to.equal(false);
            expect(childNode.culling()).to.equal(false);
        });
    });

    describe("#bounds", function () {

        var aaboxA = M.makeAABox(M.makeVector3(-2, -2, -2), M.makeVector3(-1, -1, -1)),
            aaboxB = M.makeAABox(M.makeVector3(3, -7, 3), M.makeVector3(5, 5, 5));

        beforeEach(function () {

            childNode = G.makeVisual().
                visible(true).
                material(material).
                mesh(device.makeMesh().bounds(aaboxB));

            node = G.makeVisual().attach(G.makeNode().attach(childNode)).
                visible(true).
                material(material).
                mesh(device.makeMesh().bounds(aaboxA));
        });

        it("should get bounds", function () {

            expect(node.bounds()).to.closeByComponents(aaboxA);
            expect(childNode.bounds()).to.closeByComponents(aaboxB);
        });

        it("should get null bounds if the node is not visible", function () {

            node.visible(false);
            expect(node.bounds()).to.equal(null);
        });

        it("should get bounds deeply", function () {

            expect(node.bounds(true)).to.closeByComponents(aaboxA.clone().merge(aaboxB));
            expect(childNode.bounds(true)).to.closeByComponents(aaboxB);
        });

        it("should get bounds deeply (parent is not visible)", function () {

            node.visible(false);
            expect(node.bounds(true)).to.closeByComponents(aaboxB);
        });
    });

    describe("#clone", function () {

        beforeEach(function () {

            var name;

            node = G.makeVisual().attach(G.makeVisual()).
                visible(true, true).
                culling(false, true).
                mesh(mesh, true).
                material(material, true);

            for (name in uniforms) {
                node.uniform(name, uniforms[name], true);
            }
        });

        it("should clone the node", function () {

            var name, clone;

            clone = node.clone();

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(0);
            expect(clone.visible()).to.equal(true);
            expect(clone.culling()).to.equal(false);
            expect(clone.mesh()).to.equal(mesh);
            expect(clone.material()).to.equal(material);
            for (name in uniforms) {
                expect(clone.uniform(name)).to.equal(uniforms[name]);
            }
        });

        it("should clone the node deeply", function () {

            var name, clone;

            clone = node.clone(true);

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(1);
            expect(clone.visible()).to.equal(true);
            expect(clone.culling()).to.equal(false);
            expect(clone.mesh()).to.equal(mesh);
            expect(clone.material()).to.equal(material);
            for (name in uniforms) {
                expect(clone.uniform(name)).to.equal(uniforms[name]);
            }
            expect(clone.children()[0].parent()).to.equal(clone);
            expect(clone.children()[0].children().length).to.equal(0);
            expect(clone.children()[0].visible()).to.equal(true);
            expect(clone.children()[0].culling()).to.equal(false);
            expect(clone.children()[0].mesh()).to.equal(mesh);
            expect(clone.children()[0].material()).to.equal(material);
            for (name in uniforms) {
                expect(clone.children()[0].uniform(name)).to.equal(uniforms[name]);
            }
        });
    });

    it("should add/remove instance to/from rendering device", function () {

        var spy = sinon.spy(device, "instance");

        node = G.makeVisual().
            mesh(mesh).
            material(material);

        node.visible(true);
        expect(spy).to.be.calledOnce;

        spy = sinon.spy(B.Render.Instance.prototype, "free");
        node.visible(false);
        expect(spy).to.be.calledOnce;
    });
});
