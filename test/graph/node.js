
describe("B.Graph.Node", function () {

    var G = B.Graph,
        props = {"a": true, "b": 128, "c": "asd"},

        checkEvent = function (spy, caster, type, data) {

            var e = spy.getCall(0).args[0];

            expect(spy).to.be.calledOnce;
            expect(e).to.be.instanceof(B.Std.Event);
            expect(e.caster).to.equal(caster);
            expect(e.type).to.equal(type);
            expect(e.data).to.deep.equal(data);
        };

    it("should exist", function () {

        expect(G.Node).to.exist;
    });

    it("should be created", function () {

        var node;

        expect(
            function () {
                node = G.makeNode();
            }).to.not.throw();

        expect(node).to.be.instanceof(G.Node);
    });

    describe("hierarchy", function () {

        it("should not has parent and children initially", function () {

            var node = G.makeNode();

            expect(node.parent()).to.equal(null);
            expect(node.children()).to.be.an("array");
            expect(node.children().length).to.equal(0);
        });

        it("should attach a node", function () {

            var node = G.makeNode(), otherNode = G.makeNode(),
                attachedHandler = sinon.spy(),
                childAttachedHandler = sinon.spy();

            node.on("attached", attachedHandler);
            node.on("child-attached", childAttachedHandler);
            otherNode.on("attached", attachedHandler);
            otherNode.on("child-attached", childAttachedHandler);

            expect(node.attach(otherNode)).to.equal(node);

            expect(node.parent()).to.equal(null);
            expect(node.children().length).to.equal(1);
            expect(node.children()[0]).to.equal(otherNode);

            expect(otherNode.parent()).to.equal(node);
            expect(otherNode.children().length).to.equal(0);

            checkEvent(attachedHandler, otherNode, "attached", null);
            checkEvent(childAttachedHandler, node, "child-attached", null);
        });

        it("should detach the node from its parent", function () {

            var node = G.makeNode(),
                otherNode = G.makeNode(), anotherNode = G.makeNode(),
                detachedHandler = sinon.spy(),
                childDetachedHandler = sinon.spy();

            node.on("detached", detachedHandler);
            node.on("child-detached", childDetachedHandler);
            otherNode.on("detached", detachedHandler);
            otherNode.on("child-detached", childDetachedHandler);
            anotherNode.on("detached", detachedHandler);
            anotherNode.on("child-detached", childDetachedHandler);

            node.attach(otherNode).attach(anotherNode);
            expect(otherNode.detach()).to.equal(otherNode);

            expect(node.parent()).to.equal(null);
            expect(node.children().length).to.equal(1);
            expect(node.children()[0]).to.equal(anotherNode);
            expect(otherNode.parent()).to.equal(null);
            expect(otherNode.children().length).to.equal(0);
            expect(anotherNode.parent()).to.equal(node);
            expect(anotherNode.children().length).to.equal(0);
            checkEvent(detachedHandler, otherNode, "detached", null);
            checkEvent(childDetachedHandler, node, "child-detached", null);

            detachedHandler.reset();
            childDetachedHandler.reset();

            expect(anotherNode.detach()).to.equal(anotherNode);

            expect(node.parent()).to.equal(null);
            expect(node.children().length).to.equal(0);
            expect(otherNode.parent()).to.equal(null);
            expect(otherNode.children().length).to.equal(0);
            expect(anotherNode.parent()).to.equal(null);
            expect(anotherNode.children().length).to.equal(0);
            checkEvent(detachedHandler, anotherNode, "detached", null);
            checkEvent(childDetachedHandler, node, "child-detached", null);
        });
    });

    describe("properties", function () {

        it("should not contain properties initially", function () {

            var node = G.makeNode(), name;

            for (name in props) {
                expect(node.prop(name)).to.equal(undefined);
            }
        });

        it("should set/get a property", function () {

            var node = G.makeNode(), name,
                setHandler = sinon.spy();

            node.on("prop-changed", setHandler);

            for (name in props) {
                expect(node.prop(name, props[name])).to.equal(node);
                checkEvent(setHandler, node, "prop-changed", {
                    name: name,
                    value: props[name]
                });
                expect(node.prop(name)).to.equal(props[name]);
                setHandler.reset();
            }
        });

        it("should set/get a property through the whole hierarchy", function () {

            var node = G.makeNode().attach(G.makeNode().attach(G.makeNode())), name;

            for (name in props) {

                expect(node.prop(name)).to.equal(undefined);
                expect(node.children()[0].prop(name)).to.equal(undefined);
                expect(node.children()[0].children()[0].prop(name)).to.equal(undefined);

                node.prop(name, props[name]);

                expect(node.prop(name)).to.equal(props[name]);
                expect(node.children()[0].prop(name)).to.equal(undefined);
                expect(node.children()[0].children()[0].prop(name)).to.equal(undefined);

                node.prop(name, props[name], true);

                expect(node.prop(name)).to.equal(props[name]);
                expect(node.children()[0].prop(name)).to.equal(props[name]);
                expect(node.children()[0].children()[0].prop(name)).to.equal(props[name]);
            }
        });

        it("should set/get a property without triggering", function () {

            var node = G.makeNode(), name,
                setHandler = sinon.spy();

            node.on("prop-changed", setHandler);

            for (name in props) {
                expect(node.prop(name, props[name], false, false)).to.equal(node);
                expect(setHandler.callCount).to.equal(0);
                expect(node.prop(name)).to.equal(props[name]);
                setHandler.reset();
            }
        });
    });

    describe("#find", function () {

        var node, result;

        beforeEach(function () {

            node = G.makeNode().
                attach(G.makeNode()).
                attach(G.makeNode().
                    attach(G.makeNode()).
                    attach(G.makeNode()).
                    attach(G.makeNode()));

            node.prop("id", 15);
            node.children()[0].prop("id", 2);
            node.children()[1].prop("id", 5);
            node.children()[1].children()[0].prop("id", 31);
            node.children()[1].children()[1].prop("id", 77);
            node.children()[1].children()[2].prop("id", 31);
        });

        it("should find the node by prop", function () {

            var out = [];

            result = node.find("name", "abc");
            expect(result).to.be.an("array");
            expect(result.length).to.equal(0);

            result = node.find("id", 15);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(0);

            result = node.find("id", 2);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(node.children()[0]);

            result = node.find("id", 5);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(node.children()[1]);

            result = node.find("id", 31);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(0);

            result = node.find("id", 77);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(0);

            node.find("id", 5, false, out);
            expect(out).to.be.an("array");
            expect(out.length).to.equal(1);
            expect(out[0]).to.equal(node.children()[1]);
        });

        it("should find the node by prop deeply", function () {

            var out = [];

            result = node.find("name", "abc", true);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(0);

            result = node.find("id", 15, true);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(0);

            result = node.find("id", 2, true);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(node.children()[0]);

            result = node.find("id", 5, true);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(node.children()[1]);

            result = node.find("id", 31, true);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(2);
            expect(result[0]).to.equal(node.children()[1].children()[0]);
            expect(result[1]).to.equal(node.children()[1].children()[2]);

            result = node.find("id", 77, true);
            expect(result).to.be.an("array");
            expect(result.length).to.equal(1);
            expect(result[0]).to.equal(node.children()[1].children()[1]);

            node.find("id", 5, true, out);
            expect(out).to.be.an("array");
            expect(out.length).to.equal(1);
            expect(out[0]).to.equal(node.children()[1]);

            node.find("id", 31, true, out);
            expect(out).to.be.an("array");
            expect(out.length).to.equal(3);
            expect(out[0]).to.equal(node.children()[1]);
            expect(out[1]).to.equal(node.children()[1].children()[0]);
            expect(out[2]).to.equal(node.children()[1].children()[2]);
        });
    });

    describe("#clone", function () {

        var node, otherNode, clone;

        beforeEach(function () {

            var name;

            node = G.makeNode();
            otherNode = G.makeNode();

            node.attach(otherNode);
            for (name in props) {
                node.prop(name, props[name], true, false);
            }
        });

        it("should clone the node", function () {

            var name;

            clone = node.clone();

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(0);
            for (name in props) {
                expect(clone.prop(name)).to.equal(props[name]);
            }
        });

        it("should clone the node deeply", function () {

            var name;

            clone = node.clone(true);

            expect(clone.parent()).to.equal(null);
            expect(clone.children().length).to.equal(1);
            expect(clone.children()[0].parent()).to.equal(clone);
            expect(clone.children()[0].children().length).to.equal(0);
            for (name in props) {
                expect(clone.prop(name)).to.equal(props[name]);
            }
            for (name in props) {
                expect(clone.children()[0].prop(name)).to.equal(props[name]);
            }
        });
    });

    describe("#free", function () {

        it("should free the node", function () {

            var node = G.makeNode(), otherNode = G.makeNode(),
                detachedHandler = sinon.spy(),
                childDetachedHandler = sinon.spy();

            node.on("detached", detachedHandler);
            node.on("child-detached", childDetachedHandler);
            otherNode.on("detached", detachedHandler);
            otherNode.on("child-detached", childDetachedHandler);

            node.attach(otherNode);
            otherNode.free();

            expect(node.parent()).to.equal(null);
            expect(node.children().length).to.equal(0);

            checkEvent(detachedHandler, otherNode, "detached", null);
            checkEvent(childDetachedHandler, node, "child-detached", null);
        });
    });
});