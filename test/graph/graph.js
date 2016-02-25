
describe("B.Graph", function () {

    var gl;

    before(function () {
        gl = new B.Test.FakeWebGLContext({});
    });

    describe("#makeNode", function () {

        it("should create a new node", function () {

            var spy = sinon.spy(B.Graph, "Node"),
            node = B.Graph.makeNode();

            expect(node).to.be.instanceof(B.Graph.Node);
            expect(spy).to.be.calledWith();
        });
    });

    describe("#makeLocator", function () {

        it("should create a new locator", function () {

            var spy = sinon.spy(B.Graph, "Locator"),
                node = B.Graph.makeLocator();

            expect(node).to.be.instanceof(B.Graph.Locator);
            expect(spy).to.be.calledWith();
        });
    });

    describe("#makeVisual", function () {

        it("should create a new visual", function () {

            var device = B.Render.makeDevice(new B.Test.FakeCanvas(300, 200)),
                spy = sinon.spy(B.Graph, "Visual"),
                node = B.Graph.makeVisual(device);

            expect(node).to.be.instanceof(B.Graph.Visual);
            expect(spy).to.be.calledWith(device);
        });
    });
});
