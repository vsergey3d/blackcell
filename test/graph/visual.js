
describe("B.Graph.Visual", function () {

    var G = B.Graph,

        checkEvent = B.Test.checkEvent;

    it("should exist", function () {

        expect(G.Visual).to.exist;
    });

    it("should be created", function () {

        var node;

        expect(function () {
            node = G.makeVisual();
        }).to.not.throw();

        expect(node).to.be.instanceof(G.Visual);
    });
});
