
describe("B.Render.Index", function () {

    var R = B.Render,
        I = R.Index;

    it("should exist", function () {
        expect(B.Render.Index).to.exist;
    });

    describe("B.Render.indexByteSize", function () {

        it("should return non-zero value for B.Render.Index", function () {

            expect(R.indexByteSize(I.USHORT), "USHORT").to.not.equal(0);
            expect(R.indexByteSize(I.UINT), "UINT").to.not.equal(0);
        });

        it("should return zero value for unknown index type", function () {

            expect(R.indexByteSize(-1)).to.equal(0);
            expect(R.indexByteSize(10000)).to.equal(0);
        });
    });

    describe("B.Render.toGLIndex", function () {

        var gl;

        before(function () {
            gl = new B.Test.FakeWebGLContext({});
        });

        it("should return non-zero value for B.Render.Index", function () {

            expect(R.toGLIndex(gl, I.USHORT), "USHORT").to.equal(gl.UNSIGNED_SHORT);
            expect(R.toGLIndex(gl, I.UINT), "UINT").to.equal(gl.UNSIGNED_INT);
        });

        it("should return undefined value for unknown index type", function () {

            expect(R.toGLIndex(gl, -1)).to.equal(undefined);
            expect(R.toGLIndex(gl, 10000)).to.equal(undefined);
        });
    });
});