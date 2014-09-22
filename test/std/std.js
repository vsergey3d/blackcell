
describe("B.Std.freeObject", function() {

    var S = B.Std;

    it("should free an object", function () {

        var obj = {
            a: 1,
            b: "b",
            c: false,
            d: null
        };

        S.freeObject(obj);

        expect(obj.a).to.equal(null);
        expect(obj.b).to.equal(null);
        expect(obj.c).to.equal(null);
        expect(obj.d).to.equal(null);
    });
});


describe("B.Std.removeUnordered", function() {

    var S = B.Std;

    it("should return null if array is empty", function () {
        expect(S.removeUnordered([], 5)).to.be.null;
    });

    it("should return null if index is greater than array length", function () {
        expect(S.removeUnordered([0, 1, 2, 3], 5)).to.be.null;
    });

    it("should empty array if it contains only one element", function () {

        var arr = [1];
        S.removeUnordered(arr, 0);
        expect(arr).to.be.empty;
    });

    it("should remove element from beginning of an array", function () {

        var arr = [0, 1, 2, 3, 4, 5];

        S.removeUnordered(arr, 0);
        expect(arr).to.have.length(5);
        expect(arr).to.not.include(0);
    });

    it("should remove element from an array", function () {

        var arr = [0, 1, 2, 3, 4, 5];

        S.removeUnordered(arr, 3);
        expect(arr).to.have.length(5);
        expect(arr).to.not.include(3);
    });

    it("should remove element from end of an array", function () {

        var arr = [0, 1, 2, 3, 4, 5];

        S.removeUnordered(arr, 5);
        expect(arr).to.have.length(5);
        expect(arr).to.not.include(5);
    });

    it("should return removed element", function () {
        expect(S.removeUnordered([0, 1, 2, 3, 4, 5], 3)).to.equal(3);
    });
});