
describe("B.Render.Uniform", function () {

    var R = B.Render,
        U = B.Render.Uniform,

        uniformToStr = function (type) {

            switch (type) {
            case U.FLOAT:
                return "FLOAT";
            case U.VECTOR2:
                return "VECTOR2";
            case U.VECTOR3:
                return "VECTOR3";
            case U.VECTOR4:
                return "VECTOR4";
            case U.MATRIX3:
                return "MATRIX3";
            case U.MATRIX4:
                return "MATRIX4";
            case U.SAMPLER_2D:
                return "SAMPLER_2D";
            case U.SAMPLER_CUBE:
                return "SAMPLER_CUBE";
            }
            return "unknown";
        };

    it("should exist", function () {
        expect(B.Render.Uniform).to.exist;
    });

    describe("B.Render.uniformByteSize", function () {

        it("should return non-zero value for B.Render.Uniform except SAMPLER_2D & SAMPLER_CUBE",
            function () {

                var correct = [
                        U.FLOAT,
                        U.VECTOR2,
                        U.VECTOR3,
                        U.VECTOR4,
                        U.MATRIX3,
                        U.MATRIX4
                    ],
                    uniform, i, l;

                for(i = 0, l = correct.length; i < l; i += 1) {

                    uniform = correct[i];
                    expect(R.uniformByteSize(uniform), uniformToStr(uniform)).to.not.equal(0);
                }
            }
        );

        it("should return zero value for SAMPLER_2D & SAMPLER_CUBE", function () {

            expect(R.uniformByteSize(U.SAMPLER_2D)).to.equal(0);
            expect(R.uniformByteSize(U.SAMPLER_CUBE)).to.equal(0);
        });

        it("should return zero value for unknown uniform type", function () {

            expect(R.uniformByteSize(-1)).to.equal(0);
            expect(R.uniformByteSize(10000)).to.equal(0);
        });
    });

    describe("B.Render.fromGLUniformActiveInfo", function () {

        var gl;

        before(function () {

            gl = new B.Test.FakeWebGLContext({});
        });

        it("should return non-zero value for B.Render.Uniform", function () {

            var correct = [
                    gl.FLOAT,
                    gl.FLOAT_VEC2,
                    gl.FLOAT_VEC3,
                    gl.FLOAT_VEC4,
                    gl.FLOAT_MAT3,
                    gl.FLOAT_MAT4,
                    gl.SAMPLER_2D,
                    gl.SAMPLER_CUBE
                ],
                glUniform, i, l;

            for(i = 0, l = correct.length; i < l; i += 1) {

                glUniform = correct[i];
                expect(R.fromGLUniformActiveInfo(gl, { type: glUniform }), glUniform).
                    to.not.equal(0);
            }
        });

        it("should return undefined value for unknown uniform type", function () {

            expect(R.fromGLUniformActiveInfo(gl, { type: -1 })).to.equal(undefined);
            expect(R.fromGLUniformActiveInfo(gl, { type: 10000 })).to.equal(undefined);
        });
    });
});