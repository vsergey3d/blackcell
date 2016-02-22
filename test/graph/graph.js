
describe("B.Graph", function () {

    describe("#makeNode", function () {

        it("should create a new node", function () {

            var spy = sinon.spy(B.Graph, "Node"),
            node = B.Graph.makeNode();

            expect(node).to.be.instanceof(B.Graph.Node);
            expect(spy).to.be.calledWith();
        });
    });
});
