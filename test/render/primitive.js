
describe("B.Render.Primitive", function () {

    var R = B.Render,
        P = R.Primitive,

        primitivesToStr = B.Test.primitivesToStr,
        primitives = [
            P.POINT,
            P.LINE,
            P.TRIANGLE
        ];

    it("should exist", function () {
        expect(B.Render.Primitive).to.exist;
    });

    describe("B.Render.indicesPerPrimitive", function () {

        it("should return non-zero value for B.Render.Primitive", function () {

            var primitive, i, l;

            for(i = 0, l = primitives.length; i < l; i += 1) {

                primitive = primitives[i];
                expect(R.indicesPerPrimitive(primitive), primitivesToStr(primitive)).
                    to.not.equal(0);
            }
        });

        it("should return zero value for unknown primitive type", function () {

            expect(R.indicesPerPrimitive(-1)).to.equal(0);
            expect(R.indicesPerPrimitive(10000)).to.equal(0);
        });
    });

    describe("B.Render.toGLPrimitive", function () {

        var gl;

        before(function () {
            gl = new B.Test.FakeWebGLContext({});
        });

        it("should return non-zero value for B.Render.Primitive", function () {

            var glPrimitives = {},
                primitive, i, l;

            glPrimitives[P.POINT] = gl.POINTS;
            glPrimitives[P.LINE] = gl.LINES;
            glPrimitives[P.TRIANGLE] = gl.TRIANGLES;

            for(i = 0, l = primitives.length; i < l; i += 1) {

                primitive = primitives[i];
                expect(R.toGLPrimitive(gl, primitive), primitivesToStr(primitive)).
                    to.equal(glPrimitives[primitive]);
            }
        });

        it("should return undefined value for unknown primitive type", function () {

            expect(R.toGLPrimitive(gl, -1)).to.equal(undefined);
            expect(R.toGLPrimitive(gl, 10000)).to.equal(undefined);
        });
    });
});